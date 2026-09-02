import React, { useState } from 'react';
import { Camera, Volume2, VolumeX, Sparkles, HelpCircle, Heart } from 'lucide-react';
import { AppStep } from '../types';
import { soundManager } from '../utils/audio';

interface HeaderNavProps {
  currentStep: AppStep;
  onGoStep: (step: AppStep) => void;
  canGoSelect: boolean;
  canGoCustomize: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentStep,
  onGoStep,
  canGoSelect,
  canGoCustomize,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [showGuide, setShowGuide] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const steps: { id: AppStep; label: string; num: string }[] = [
    { id: 'ready', label: '찰칵 촬영', num: '1' },
    { id: 'select', label: '4장 고르기', num: '2' },
    { id: 'customize', label: '프레임 꾸미기', num: '3' },
    { id: 'result', label: '완성 & 인쇄', num: '4' },
  ];

  return (
    <header
      id="main-header"
      className="w-full bg-[#FFF9F2]/95 backdrop-blur-md border-b-2 border-[#D7CCC8] sticky top-0 z-40 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#FFD54F] border-2 border-white shadow-sm flex items-center justify-center text-xl text-[#5D4037]">
            🎈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-jua text-2xl text-[#8D6E63] tracking-tight">
                우리반 네컷 📸
              </h1>
              <span className="px-2.5 py-0.5 bg-white/90 text-[#8D6E63] text-xs font-jua rounded-full border border-[#D7CCC8] shadow-2xs">
                유치원 사진관
              </span>
            </div>
            <p className="text-sm text-[#A1887F] font-gaegu leading-none mt-0.5">
              친구들과 함께하는 소중한 추억 만들기!
            </p>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {steps.map((s, idx) => {
            const isActive = currentStep === s.id;
            const isClickable =
              (s.id === 'ready') ||
              (s.id === 'select' && canGoSelect) ||
              (s.id === 'customize' && canGoCustomize) ||
              (s.id === 'result' && canGoCustomize);

            return (
              <React.Fragment key={s.id}>
                <button
                  id={`nav-step-${s.id}`}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable) {
                      soundManager.playPop();
                      onGoStep(s.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-jua transition-all border-2 ${
                    isActive
                      ? 'bg-[#81C784] text-white border-[#66BB6A] shadow-sm scale-105'
                      : isClickable
                      ? 'bg-white text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                      : 'bg-[#EFEBE9]/60 text-[#A1887F]/60 border-[#D7CCC8]/40 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isActive
                        ? 'bg-white text-[#81C784]'
                        : isClickable
                        ? 'bg-[#FFD54F] text-[#5D4037]'
                        : 'bg-[#D7CCC8] text-white'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-[#D7CCC8] font-bold text-xs">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Sound and Help Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-sound-toggle"
            type="button"
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-2xl border-2 text-xs font-jua flex items-center gap-1.5 transition-all shadow-2xs ${
              isMuted
                ? 'bg-white text-[#A1887F] border-[#D7CCC8]'
                : 'bg-white text-[#5D4037] border-[#FFD54F] hover:bg-[#FFF9F2]'
            }`}
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#FF8A65]" />}
            <span className="hidden sm:inline">{isMuted ? '음소거' : '효과음'}</span>
          </button>

          <button
            id="btn-guide-toggle"
            type="button"
            onClick={() => {
              soundManager.playPop();
              setShowGuide(!showGuide);
            }}
            className="px-3 py-1.5 rounded-2xl bg-white hover:bg-[#EFEBE9] text-[#5D4037] border-2 border-[#D7CCC8] text-xs font-jua flex items-center gap-1.5 shadow-2xs"
            title="사용 방법 안내"
          >
            <HelpCircle className="w-4 h-4 text-[#81C784]" />
            <span className="hidden sm:inline">이용안내</span>
          </button>
        </div>
      </div>

      {/* Guide Modal / Popover */}
      {showGuide && (
        <div className="bg-[#EFEBE9] border-t-2 border-[#D7CCC8] px-4 py-3 text-xs text-[#5D4037] flex items-center justify-between">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-1 font-gaegu text-base">
            <span className="font-jua text-[#8D6E63] text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A65]" /> 유치원 네컷 사용법:
            </span>
            <span>① 3초 카운트다운 후 총 5번의 귀여운 포즈로 사진이 찍혀요.</span>
            <span>② 찍힌 5장 중 마음에 드는 4장을 골라요.</span>
            <span>③ 병아리반, 새싹반 등 귀여운 프레임과 스티커로 꾸며요.</span>
            <span>④ 고화질 이미지로 저장하거나 인쇄하여 아이들에게 선물해요! 🎁</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="text-[#8D6E63] font-jua text-xs hover:underline ml-2"
          >
            닫기
          </button>
        </div>
      )}
    </header>
  );
};
