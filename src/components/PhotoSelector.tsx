import React from 'react';
import { Check, ArrowRight, RotateCcw, Sparkles, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { soundManager } from '../utils/audio';

interface PhotoSelectorProps {
  allPhotos: CapturedPhoto[];
  selectedPhotoIds: string[];
  onSelectPhotoIds: (ids: string[]) => void;
  onConfirm: () => void;
  onRetakeAll: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  allPhotos,
  selectedPhotoIds,
  onSelectPhotoIds,
  onConfirm,
  onRetakeAll,
}) => {
  // Toggle selection
  const handleToggle = (id: string) => {
    soundManager.playPop();
    if (selectedPhotoIds.includes(id)) {
      onSelectPhotoIds(selectedPhotoIds.filter((item) => item !== id));
    } else {
      if (selectedPhotoIds.length < 4) {
        onSelectPhotoIds([...selectedPhotoIds, id]);
      } else {
        // Replace last chosen one or do nothing
        const newArr = [...selectedPhotoIds.slice(0, 3), id];
        onSelectPhotoIds(newArr);
      }
    }
  };

  // Swap position of selected items
  const handleMove = (fromIndex: number, toIndex: number) => {
    soundManager.playPop();
    const newArr = [...selectedPhotoIds];
    const temp = newArr[fromIndex];
    newArr[fromIndex] = newArr[toIndex];
    newArr[toIndex] = temp;
    onSelectPhotoIds(newArr);
  };

  const isReady = selectedPhotoIds.length === 4;

  return (
    <div id="photo-selector-section" className="w-full max-w-4xl flex flex-col items-center gap-8">
      {/* Header Prompt */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-[#5D4037] font-jua rounded-2xl text-sm mb-2 border-2 border-[#D7CCC8]">
          <span className="w-3 h-3 bg-[#FF8A65] rounded-full"></span>
          <span>5장 중 가장 마음에 드는 4장을 골라주세요!</span>
        </div>
        <h2 className="font-jua text-2xl sm:text-3xl text-[#8D6E63]">
          우리반 네컷 사진 선택하기 ({selectedPhotoIds.length} / 4장)
        </h2>
        <p className="text-[#A1887F] font-gaegu text-lg mt-1">
          사진을 클릭하여 선택하거나 순서를 바꿀 수 있어요.
        </p>
      </div>

      {/* 5 Photos Gallery Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {allPhotos.map((photo, index) => {
          const selectedIndex = selectedPhotoIds.indexOf(photo.id);
          const isSelected = selectedIndex !== -1;

          return (
            <div
              key={photo.id}
              id={`photo-card-${index}`}
              onClick={() => handleToggle(photo.id)}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm transition-all duration-200 select-none ${
                isSelected
                  ? 'border-4 border-[#FF8A65] ring-4 ring-[#FF8A65]/20 scale-[1.03] shadow-md'
                  : 'border-4 border-white bg-[#D7CCC8] opacity-75 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <img
                src={photo.dataUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Shot Index Tag */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white font-jua text-xs px-2 py-0.5 rounded-md">
                {index + 1}번째 컷
              </div>

              {/* Selected Badge or Add Indicator */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-[#FF8A65] text-white font-jua text-xs font-bold flex items-center justify-center shadow-md border-2 border-white">
                    {selectedIndex + 1}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center border border-white/60 group-hover:bg-[#FFD54F] group-hover:text-[#5D4037] transition-colors">
                    <Check className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </div>
                )}
              </div>

              {/* Bottom selection label */}
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 bg-[#FF8A65] text-white text-center font-jua text-xs py-1">
                  네컷 {selectedIndex + 1}번 컷 선정 ✨
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4 Selected Slots Preview & Reorder Section */}
      <div className="w-full bg-white p-6 rounded-[32px] shadow-sm border-2 border-[#E0E0E0] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#D7CCC8]/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#81C784] font-bold text-lg">✔</span>
            <h3 className="font-jua text-lg sm:text-xl text-[#5D4037]">
              선택된 4컷 순서 미리보기
            </h3>
          </div>
          <span className="text-xs sm:text-sm font-gaegu text-[#A1887F] text-base">
            화살표를 눌러 사진의 위치를 서로 바꿀 수 있어요!
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photoId = selectedPhotoIds[slotIdx];
            const photo = allPhotos.find((p) => p.id === photoId);

            return (
              <div
                key={slotIdx}
                id={`slot-preview-${slotIdx}`}
                className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${
                  photo
                    ? 'bg-[#EFEBE9] border-[#D7CCC8]'
                    : 'bg-[#FFF9F2] border-dashed border-[#D7CCC8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-jua text-[#5D4037] px-1">
                  <span>{slotIdx + 1}번째 프레임</span>
                  {photo && (
                    <span className="text-[#81C784] font-bold font-gaegu text-sm">
                      선택 완료
                    </span>
                  )}
                </div>

                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#D7CCC8] border border-white flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo.dataUrl}
                      alt={`Selected ${slotIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[#A1887F] font-jua text-xs text-center p-2">
                      위 사진에서 선택해주세요
                    </div>
                  )}
                </div>

                {/* Reorder Arrows */}
                {photo && (
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <button
                      type="button"
                      disabled={slotIdx === 0}
                      onClick={() => handleMove(slotIdx, slotIdx - 1)}
                      className="flex-1 py-1.5 bg-white hover:bg-[#D7CCC8] disabled:opacity-30 disabled:hover:bg-white text-[#5D4037] font-jua text-xs rounded-xl border border-[#D7CCC8] transition-colors flex items-center justify-center"
                      title="왼쪽으로 이동"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      disabled={slotIdx === 3 || slotIdx >= selectedPhotoIds.length - 1}
                      onClick={() => handleMove(slotIdx, slotIdx + 1)}
                      className="flex-1 py-1.5 bg-white hover:bg-[#D7CCC8] disabled:opacity-30 disabled:hover:bg-white text-[#5D4037] font-jua text-xs rounded-xl border border-[#D7CCC8] transition-colors flex items-center justify-center"
                      title="오른쪽으로 이동"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          id="btn-retake-all"
          type="button"
          onClick={() => {
            soundManager.playPop();
            onRetakeAll();
          }}
          className="px-6 py-3.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] font-jua rounded-2xl border-2 border-[#D7CCC8] text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all"
        >
          <RotateCcw className="w-4 h-4 text-[#8D6E63]" />
          <span>처음부터 다시 촬영하기</span>
        </button>

        <button
          id="btn-confirm-photos"
          type="button"
          disabled={!isReady}
          onClick={() => {
            soundManager.playCheer();
            onConfirm();
          }}
          className={`px-8 py-4 font-jua text-base sm:text-lg rounded-[24px] flex items-center gap-2.5 shadow-lg transition-all ${
            isReady
              ? 'bg-[#81C784] hover:bg-[#66BB6A] text-white shadow-[#81C784]/20 hover:scale-105 cursor-pointer'
              : 'bg-[#E0E0E0] text-[#A1887F] cursor-not-allowed shadow-none'
          }`}
        >
          <span>
            {isReady
              ? '네컷 프레임 꾸미러 가기!'
              : `4장을 선택해주세요 (${selectedPhotoIds.length}/4)`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
