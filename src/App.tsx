import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStep, CapturedPhoto, FrameTheme, LayoutMode, PhotoFilter, PlacedSticker } from './types';
import { FRAME_THEMES } from './data/frames';
import { HeaderNav } from './components/HeaderNav';
import { CameraView } from './components/CameraView';
import { PhotoSelector } from './components/PhotoSelector';
import { FourCutCanvas, FourCutCanvasHandle } from './components/FourCutCanvas';
import { FrameCustomizer } from './components/FrameCustomizer';
import { ResultScreen } from './components/ResultScreen';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundManager } from './utils/audio';

export default function App() {
  const [step, setStep] = useState<AppStep>('ready');

  // Shooting & Photos State
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('bright');

  // Customization State
  const [currentFrame, setCurrentFrame] = useState<FrameTheme>(FRAME_THEMES[0]);
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>('strip');
  const [classNameText, setClassNameText] = useState('병아리반 🐣');
  const [subText, setSubText] = useState('삐약삐약 귀여운 우리들');

  const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };
  const [dateText, setDateText] = useState(todayStr());

  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<FourCutCanvasHandle | null>(null);

  // When 5 photos are taken
  const handlePhotosCaptured = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    // Auto-select first 4 photos by default
    const initialSelected = photos.slice(0, 4).map((p) => p.id);
    setSelectedPhotoIds(initialSelected);
    setStep('select');
  };

  // 4 photos selected -> go to customize
  const handleConfirmSelectedPhotos = () => {
    setStep('customize');
  };

  // Retake all photos
  const handleRestartSession = () => {
    setCapturedPhotos([]);
    setSelectedPhotoIds([]);
    setStickers([]);
    setFinalImageUrl('');
    setStep('ready');
  };

  // Add a sticker to the canvas
  const handleAddSticker = (emoji: string, label?: string) => {
    const newSticker: PlacedSticker = {
      id: `st_${Date.now()}_${Math.random()}`,
      stickerId: label || 'sticker',
      emoji,
      label,
      x: 35 + Math.random() * 30, // center random
      y: 35 + Math.random() * 30,
      size: 48,
      rotation: Math.floor(Math.random() * 20 - 10),
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleUpdateSticker = (id: string, x: number, y: number) => {
    setStickers((prev) =>
      prev.map((st) => (st.id === id ? { ...st, x, y } : st))
    );
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((st) => st.id !== id));
  };

  const handleClearStickers = () => {
    setStickers([]);
  };

  // Complete Customization & Generate High-Res Image
  const handleFinishCustomization = async () => {
    if (!canvasRef.current) return;
    soundManager.playCheer();
    setIsExporting(true);

    try {
      const dataUrl = await canvasRef.current.exportHighResImage();
      setFinalImageUrl(dataUrl);
      setStep('result');
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter 4 photos according to selected order
  const chosenPhotos = selectedPhotoIds
    .map((id) => capturedPhotos.find((p) => p.id === id))
    .filter((p): p is CapturedPhoto => p !== undefined);

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#FFF9F2] text-[#5D4037] flex flex-col font-jua relative overflow-x-hidden"
    >
      {/* Decorative floating background elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
        <div className="absolute top-12 left-8 text-4xl animate-bounce-subtle">☁️</div>
        <div className="absolute top-28 right-12 text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-20 left-16 text-4xl animate-bounce-subtle">🌸</div>
        <div className="absolute bottom-36 right-20 text-4xl animate-pulse">🐣</div>
      </div>

      {/* Header Navigation */}
      <HeaderNav
        currentStep={step}
        onGoStep={(s) => setStep(s)}
        canGoSelect={capturedPhotos.length >= 5}
        canGoCustomize={selectedPhotoIds.length === 4}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: 촬영 단계 (Camera View) */}
          {step === 'ready' && (
            <motion.div
              key="step-camera"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Introduction Banner */}
              <div className="text-center max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-[#5D4037] rounded-2xl text-xs sm:text-sm border-2 border-[#D7CCC8] mb-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#FF8A65]" />
                  <span>유치원·어린이집 우리반 추억 만들기</span>
                </div>
                <h2 className="text-2xl sm:text-4xl text-[#8D6E63]">
                  3, 2, 1 찰칵! 5번의 귀여운 포즈
                </h2>
                <p className="text-[#A1887F] font-gaegu text-lg sm:text-xl mt-1">
                  카메라 앞에서 방긋 웃어보세요! 촬영된 5장 중 4장을 골라 예쁘게 꾸며요.
                </p>
              </div>

              {/* Camera Component */}
              <CameraView
                onPhotosCaptured={handlePhotosCaptured}
                selectedFilter={selectedFilter}
                onChangeFilter={setSelectedFilter}
                classNameText={classNameText}
              />
            </motion.div>
          )}

          {/* STEP 2: 5장 중 4장 선택 (Photo Selector) */}
          {step === 'select' && (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full flex flex-col items-center"
            >
              <PhotoSelector
                allPhotos={capturedPhotos}
                selectedPhotoIds={selectedPhotoIds}
                onSelectPhotoIds={setSelectedPhotoIds}
                onConfirm={handleConfirmSelectedPhotos}
                onRetakeAll={handleRestartSession}
              />
            </motion.div>
          )}

          {/* STEP 3: 프레임 & 스티커 꾸미기 (Customize) */}
          {step === 'customize' && (
            <motion.div
              key="step-customize"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Header Title */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-[#5D4037] rounded-2xl text-sm mb-1 border-2 border-[#D7CCC8] shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#FF8A65]" />
                  <span>원하는 프레임과 스티커로 네컷을 꾸며보세요!</span>
                </div>
                <h2 className="text-2xl sm:text-3xl text-[#8D6E63]">
                  우리반 네컷 스튜디오
                </h2>
              </div>

              {/* Studio Workspace Layout */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left/Center Preview Canvas */}
                <div className="lg:col-span-5 flex flex-col items-center gap-3">
                  <div className="w-full bg-[#EFEBE9] p-4 sm:p-6 rounded-[32px] border-2 border-[#D7CCC8] shadow-inner flex flex-col items-center justify-center min-h-[480px]">
                    <FourCutCanvas
                      ref={canvasRef}
                      photos={chosenPhotos}
                      frame={currentFrame}
                      layout={currentLayout}
                      classNameText={classNameText}
                      subText={subText}
                      dateText={dateText}
                      stickers={stickers}
                      onUpdateSticker={handleUpdateSticker}
                      onRemoveSticker={handleRemoveSticker}
                      interactive={true}
                    />
                  </div>
                  <span className="text-xs text-[#A1887F] font-gaegu text-base">
                    💡 스티커를 클릭 후 드래그하여 원하는 위치로 옮길 수 있어요!
                  </span>
                </div>

                {/* Right Customization Controls */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <FrameCustomizer
                    currentFrame={currentFrame}
                    onSelectFrame={setCurrentFrame}
                    currentLayout={currentLayout}
                    onSelectLayout={setCurrentLayout}
                    classNameText={classNameText}
                    onChangeClassName={setClassNameText}
                    subText={subText}
                    onChangeSubText={setSubText}
                    dateText={dateText}
                    onChangeDateText={setDateText}
                    stickers={stickers}
                    onAddSticker={handleAddSticker}
                    onClearStickers={handleClearStickers}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      id="btn-back-to-select"
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setStep('select');
                      }}
                      className="px-6 py-3.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] font-jua rounded-2xl border-2 border-[#D7CCC8] text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#8D6E63]" />
                      <span>사진 다시 고르기</span>
                    </button>

                    <button
                      id="btn-finish-custom"
                      type="button"
                      disabled={isExporting}
                      onClick={handleFinishCustomization}
                      className="px-8 py-4 bg-[#81C784] hover:bg-[#66BB6A] text-white font-jua text-base sm:text-lg rounded-[24px] shadow-lg shadow-[#81C784]/20 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <span>
                        {isExporting ? '네컷 제작 중...' : '네컷 완성하기! ✨'}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: 완성 & 인쇄 (Result Screen) */}
          {step === 'result' && (
            <motion.div
              key="step-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <ResultScreen
                finalImageUrl={finalImageUrl}
                onEditCustomization={() => setStep('customize')}
                onRestart={handleRestartSession}
                classNameText={classNameText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-[#E0E0E0] bg-white py-4 px-4 text-center text-[#8D6E63] font-gaegu text-base">
        <p>우리들의 귀여운 추억, 우리반 네컷 📸 삐약삐약 햇살 가득한 유치원 사진관</p>
      </footer>
    </div>
  );
}
