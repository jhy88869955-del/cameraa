import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/audio';
import { POSE_PROMPTS } from '../data/frames';

interface CountdownOverlayProps {
  count: number; // 3, 2, 1, 0
  shotIndex: number; // 0 to 4 (representing 1st to 5th photo)
  totalShots: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  count,
  shotIndex,
  totalShots,
}) => {
  const currentPrompt = POSE_PROMPTS[shotIndex] || POSE_PROMPTS[0];

  useEffect(() => {
    if (count > 0) {
      soundManager.playCountdown(count);
    }
  }, [count]);

  return (
    <div
      id="countdown-overlay"
      className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-between p-6 bg-black/20 backdrop-blur-[1px]"
    >
      {/* Top Shot Indicator with Natural Accent Dots */}
      <div className="w-full flex items-center justify-between max-w-xl">
        <div className="flex gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#D7CCC8]">
          <div className="w-3.5 h-3.5 bg-[#FF8A65] rounded-full" />
          <div className="w-3.5 h-3.5 bg-[#FFD54F] rounded-full" />
          <div className="w-3.5 h-3.5 bg-[#81C784] rounded-full" />
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xs text-[#5D4037] font-jua text-base sm:text-lg px-5 py-2 rounded-full shadow-lg border-2 border-[#FFD54F] flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-[#FF8A65] rounded-full animate-pulse" />
          <span>
            남은 촬영: {shotIndex + 1} / {totalShots} 장
          </span>
        </motion.div>
      </div>

      {/* Big Center Countdown */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
              animate={{ scale: [0.85, 1.2, 1], opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              {/* Outer Warm Halo */}
              <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-[#FFD54F]/30 animate-ping opacity-50" />
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-white/95 shadow-2xl border-6 border-[#FFD54F] flex items-center justify-center">
                <span
                  className="font-jua text-7xl sm:text-9xl font-black text-[#5D4037] drop-shadow-md select-none"
                >
                  {count}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="snap"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/95 border-4 border-[#81C784] px-8 py-4 rounded-[28px] shadow-2xl flex items-center gap-3"
            >
              <span className="text-4xl sm:text-5xl animate-bounce">📸</span>
              <span className="font-jua text-3xl sm:text-5xl text-[#5D4037]">
                찰칵! 김치~
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Pose Helper Card */}
      <motion.div
        key={`pose-${shotIndex}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white/95 text-[#5D4037] rounded-[24px] p-4 shadow-xl border-2 border-[#D7CCC8] text-center"
      >
        <div className="text-xs font-bold text-[#FF8A65] tracking-wide flex items-center justify-center gap-1">
          <span>✨</span>
          <span>{currentPrompt.title}</span>
        </div>
        <div className="font-jua text-xl sm:text-2xl text-[#8D6E63] mt-0.5">
          {currentPrompt.pose}
        </div>
        <p className="text-sm text-[#A1887F] mt-1 font-gaegu text-base">
          {currentPrompt.hint}
        </p>
      </motion.div>
    </div>
  );
};
