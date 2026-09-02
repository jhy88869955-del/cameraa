import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, SwitchCamera, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { PhotoFilter, CapturedPhoto } from '../types';
import { FILTER_STYLES } from '../utils/filter';
import { CountdownOverlay } from './CountdownOverlay';
import { soundManager } from '../utils/audio';
import { getSamplePhotoBatch } from '../utils/demoPhotos';

interface CameraViewProps {
  onPhotosCaptured: (photos: CapturedPhoto[]) => void;
  selectedFilter: PhotoFilter;
  onChangeFilter: (filter: PhotoFilter) => void;
  classNameText: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotosCaptured,
  selectedFilter,
  onChangeFilter,
  classNameText,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);

  // Shooting Session State
  const [isShooting, setIsShooting] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, 0
  const [flash, setFlash] = useState(false);
  const [capturedList, setCapturedList] = useState<CapturedPhoto[]>([]);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: facingMode,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setHasCamera(false);
      const msg =
        err instanceof Error
          ? err.message
          : '카메라에 연결할 수 없습니다. 권한을 확인해주세요.';
      setCameraError(msg);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Flip camera
  const toggleFacingMode = () => {
    soundManager.playPop();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setIsMirrored((prev) => !prev);
  };

  // Capture current video frame to base64 DataURL
  const takeFrameSnapshot = useCallback((): string => {
    if (!videoRef.current) {
      // Fallback
      return getSamplePhotoBatch()[currentShotIndex] || getSamplePhotoBatch()[0];
    }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Maintain standard 4:3 high-res ratio for photo cuts
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 960;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Apply Filter on Snapshot
    ctx.filter = FILTER_STYLES[selectedFilter].cssFilter;

    ctx.save();
    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored, selectedFilter, currentShotIndex]);

  // Start 5-Shot Sequence
  const startFiveShotSequence = () => {
    soundManager.playPop();
    setIsShooting(true);
    setCurrentShotIndex(0);
    setCapturedList([]);
    runCountdownForShot(0, []);
  };

  // Run countdown recursive timer for 5 shots
  const runCountdownForShot = (shotIdx: number, currentCaptured: CapturedPhoto[]) => {
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(timer);

        // Flash & Shutter
        setFlash(true);
        soundManager.playShutter();
        setTimeout(() => setFlash(false), 350);

        // Capture photo
        const photoData = takeFrameSnapshot();
        const newPhoto: CapturedPhoto = {
          id: `photo_${Date.now()}_${shotIdx}`,
          dataUrl: photoData,
          timestamp: Date.now(),
        };
        const updatedList = [...currentCaptured, newPhoto];
        setCapturedList(updatedList);

        if (shotIdx + 1 < 5) {
          // Pause 1.6s for pose change, then start next shot
          setTimeout(() => {
            setCurrentShotIndex(shotIdx + 1);
            runCountdownForShot(shotIdx + 1, updatedList);
          }, 1600);
        } else {
          // Finished all 5 shots!
          setTimeout(() => {
            setIsShooting(false);
            setCountdown(null);
            soundManager.playCheer();
            onPhotosCaptured(updatedList);
          }, 1000);
        }
      }
    }, 1000);
  };

  // Fallback 1: Use Sample Photos directly
  const handleUseSamplePhotos = () => {
    soundManager.playPop();
    const samples = getSamplePhotoBatch().map((dataUrl, idx) => ({
      id: `sample_${idx}_${Date.now()}`,
      dataUrl,
      timestamp: Date.now(),
    }));
    setCapturedList(samples);
    soundManager.playCheer();
    onPhotosCaptured(samples);
  };

  // Fallback 2: Manual File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundManager.playPop();
    const fileList: File[] = [];
    for (let i = 0; i < files.length && i < 5; i++) {
      const f = files.item(i);
      if (f) fileList.push(f);
    }
    const readPromises = fileList.map((file: File, idx: number) => {
      return new Promise<CapturedPhoto>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: `upload_${Date.now()}_${idx}`,
            dataUrl: (event.target?.result as string) || '',
            timestamp: Date.now(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((photos) => {
      // If user uploaded less than 5, fill rest with sample photos so there are always 5 choices
      const finalPhotos = [...photos];
      while (finalPhotos.length < 5) {
        finalPhotos.push({
          id: `sample_fill_${finalPhotos.length}_${Date.now()}`,
          dataUrl: getSamplePhotoBatch()[finalPhotos.length],
          timestamp: Date.now(),
        });
      }
      onPhotosCaptured(finalPhotos);
    });
  };

  return (
    <div id="camera-view-container" className="w-full flex flex-col items-center gap-6">
      {/* Viewport Frame */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-[#EFEBE9] rounded-[40px] border-8 border-white shadow-xl overflow-hidden flex items-center justify-center">
        {/* Flash Effect */}
        {flash && (
          <div className="absolute inset-0 z-40 bg-white animate-flash pointer-events-none" />
        )}

        {/* Live Camera Video */}
        {hasCamera !== false && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              filter: FILTER_STYLES[selectedFilter].cssFilter,
              transform: isMirrored ? 'scaleX(-1)' : 'none',
            }}
            className="w-full h-full object-cover"
          />
        )}

        {/* Camera Permission / Error Fallback Screen */}
        {hasCamera === false && (
          <div
            id="camera-fallback-screen"
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FFF9F2] text-[#5D4037]"
          >
            <div className="w-16 h-16 rounded-full bg-[#FFD54F] text-[#5D4037] flex items-center justify-center mb-3 shadow-sm">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="font-jua text-2xl text-[#8D6E63] mb-1">
              카메라 연결 준비 중
            </h3>
            <p className="text-sm text-[#A1887F] max-w-sm mb-4 font-gaegu text-lg leading-snug">
              {cameraError || '웹캠을 허용해주시거나 귀여운 샘플 사진으로 네컷을 체험해보세요!'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                id="btn-retry-camera"
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-[#FF8A65] hover:bg-[#F4511E] text-white font-jua rounded-2xl text-sm flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" /> 카메라 다시 시도
              </button>
              <button
                id="btn-sample-photos"
                type="button"
                onClick={handleUseSamplePhotos}
                className="px-4 py-2 bg-[#81C784] hover:bg-[#66BB6A] text-white font-jua rounded-2xl text-sm flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" /> 샘플 사진으로 찰칵!
              </button>
              <label
                id="btn-upload-photos"
                className="px-4 py-2 bg-white hover:bg-[#EFEBE9] text-[#5D4037] border-2 border-[#D7CCC8] font-jua rounded-2xl text-sm flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-[#8D6E63]" /> 사진 업로드 (5장)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Live Overlay Guides */}
        {!isShooting && hasCamera && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="bg-black/45 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full font-jua text-xs sm:text-sm flex items-center gap-2 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A65] animate-pulse" />
              <span>{classNameText || '우리반'} 네컷 촬영 준비</span>
            </div>
            <div className="bg-black/45 backdrop-blur-xs text-[#FFD54F] px-3.5 py-1.5 rounded-full font-jua text-xs sm:text-sm border border-white/20">
              총 5장 연속 촬영
            </div>
          </div>
        )}

        {/* 3, 2, 1 Countdown Overlay */}
        {isShooting && countdown !== null && (
          <CountdownOverlay
            count={countdown}
            shotIndex={currentShotIndex}
            totalShots={5}
          />
        )}
      </div>

      {/* 5-Shot Progress Thumbnails Bar */}
      <div
        id="five-shot-progress-bar"
        className="w-full max-w-2xl bg-white rounded-[32px] p-5 shadow-sm border-2 border-[#E0E0E0] flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63]">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#FF8A65]" />
            5장 연속 촬영 현황
          </span>
          <span className="text-[#A1887F]">
            {capturedList.length} / 5장 완료
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4].map((idx) => {
            const photo = capturedList[idx];
            const isCurrent = isShooting && currentShotIndex === idx;

            return (
              <div
                key={idx}
                id={`shot-progress-slot-${idx}`}
                className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 relative flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'border-[#FF8A65] ring-4 ring-[#FF8A65]/25 scale-105 bg-[#FF8A65]/10'
                    : photo
                    ? 'border-[#81C784] bg-[#81C784]/15'
                    : 'border-dashed border-[#D7CCC8] bg-[#EFEBE9]/60'
                }`}
              >
                {photo ? (
                  <>
                    <img
                      src={photo.dataUrl}
                      alt={`Shot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-[#81C784] text-white rounded-full p-0.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#A1887F] text-center p-1">
                    <span className="font-jua text-sm sm:text-base font-bold text-[#8D6E63]">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-gaegu text-[#A1887F]">
                      {isCurrent ? '촬영 중' : '대기'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Camera Controls & Filter Palette */}
      {!isShooting && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-[32px] border-2 border-[#E0E0E0] shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63] px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A65]" />
                사진 필터 효과 선택
              </span>
              <span className="text-[#A1887F]">
                {FILTER_STYLES[selectedFilter].name}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(Object.keys(FILTER_STYLES) as PhotoFilter[]).map((filterKey) => {
                const isSelected = selectedFilter === filterKey;
                return (
                  <button
                    key={filterKey}
                    id={`btn-filter-${filterKey}`}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      onChangeFilter(filterKey);
                    }}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-2xl font-jua text-xs sm:text-sm transition-all flex items-center gap-1.5 border-2 ${
                      isSelected
                        ? 'bg-[#FFD54F] text-[#5D4037] border-[#8D6E63] shadow-xs scale-105'
                        : 'bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#5D4037] border-[#D7CCC8]'
                    }`}
                  >
                    <span>{FILTER_STYLES[filterKey].badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Secondary Controls (Mirror, Switch Camera) */}
            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-mirror"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  setIsMirrored((prev) => !prev);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-jua border-2 transition-all ${
                  isMirrored
                    ? 'bg-[#EFEBE9] border-[#D7CCC8] text-[#5D4037] shadow-2xs'
                    : 'bg-white border-[#E0E0E0] text-[#A1887F] hover:bg-[#EFEBE9]'
                }`}
              >
                좌우 반전 {isMirrored ? 'ON' : 'OFF'}
              </button>

              <button
                id="btn-switch-camera"
                type="button"
                onClick={toggleFacingMode}
                className="px-4 py-2.5 bg-white hover:bg-[#EFEBE9] border-2 border-[#D7CCC8] text-[#5D4037] rounded-2xl text-xs sm:text-sm font-jua flex items-center gap-1.5 shadow-2xs transition-all"
                title="카메라 전환"
              >
                <SwitchCamera className="w-4 h-4 text-[#8D6E63]" />
                카메라 전환
              </button>
            </div>

            {/* Big Shoot Button */}
            <button
              id="btn-start-shoot"
              type="button"
              onClick={startFiveShotSequence}
              className="flex-1 sm:flex-none px-8 py-4 bg-[#81C784] hover:bg-[#66BB6A] text-white font-jua text-lg sm:text-xl rounded-[24px] shadow-lg shadow-[#81C784]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span>3, 2, 1 찰칵 촬영 시작!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
