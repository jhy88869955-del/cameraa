import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Printer, Copy, RotateCcw, Edit3, Check, Sparkles, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ResultScreenProps {
  finalImageUrl: string;
  onEditCustomization: () => void;
  onRestart: () => void;
  classNameText: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  finalImageUrl,
  onEditCustomization,
  onRestart,
  classNameText,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#F43F5E', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch {}
  }, []);

  // Download PNG file
  const handleDownload = () => {
    soundManager.playPop();
    setIsDownloading(true);
    const link = document.createElement('a');
    const sanitizedName = (classNameText || '우리반').replace(/\s+/g, '_');
    const filename = `${sanitizedName}_네컷_${Date.now()}.png`;
    link.download = filename;
    link.href = finalImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 800);
  };

  // Print
  const handlePrint = () => {
    soundManager.playPop();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>우리반 네컷 인쇄</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: #ffffff;
              }
              img {
                max-width: 95vw;
                max-height: 95vh;
                object-fit: contain;
              }
              @media print {
                body {
                  margin: 0;
                }
                img {
                  width: 100%;
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${finalImageUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // Copy to clipboard
  const handleCopyImage = async () => {
    soundManager.playPop();
    try {
      const res = await fetch(finalImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div
      id="result-screen"
      className="w-full max-w-4xl flex flex-col items-center gap-8 py-4"
    >
      {/* Cheer Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-[#5D4037] font-jua rounded-2xl text-sm mb-2 border-2 border-[#D7CCC8]">
          <Sparkles className="w-4 h-4 text-[#FF8A65]" />
          <span>짜잔! 우리들의 사랑스러운 네컷 완성 ✨</span>
        </div>
        <h2 className="font-jua text-3xl sm:text-4xl text-[#8D6E63]">
          {classNameText || '우리반'} 네컷 사진
        </h2>
        <p className="text-[#A1887F] font-gaegu text-lg mt-1">
          인쇄하거나 저장하여 아이들, 학부모님과 함께 행복한 추억을 나눠보세요!
        </p>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Preview Card */}
        <div className="relative group p-4 bg-white rounded-[32px] shadow-xl border-4 border-white max-w-[340px] sm:max-w-[400px]">
          <img
            src={finalImageUrl}
            alt="Completed Four Cut"
            className="w-full rounded-2xl shadow-2xs object-contain"
          />
        </div>

        {/* Action Controls Panel */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="bg-white rounded-[32px] p-6 border-2 border-[#E0E0E0] shadow-sm flex flex-col gap-3.5">
            <h3 className="font-jua text-xl text-[#5D4037] flex items-center gap-2 border-b border-[#D7CCC8]/50 pb-3">
              <Heart className="w-5 h-5 text-[#FF8A65] fill-[#FF8A65]" />
              사진 보관 & 인쇄하기
            </h3>

            {/* Primary Download Button */}
            <button
              id="btn-download-png"
              type="button"
              onClick={handleDownload}
              className="w-full py-3.5 bg-[#81C784] hover:bg-[#66BB6A] active:scale-[0.98] text-white font-jua text-base sm:text-lg rounded-[24px] shadow-lg shadow-[#81C784]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>고화질 이미지 저장 (PNG)</span>
            </button>

            {/* Print Button */}
            <button
              id="btn-print-action"
              type="button"
              onClick={handlePrint}
              className="w-full py-3 bg-[#FF8A65] hover:bg-[#F4511E] text-white font-jua text-base rounded-[24px] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>프린터로 바로 인쇄하기</span>
            </button>

            {/* Copy Clipboard Button */}
            <button
              id="btn-copy-clipboard"
              type="button"
              onClick={handleCopyImage}
              className="w-full py-2.5 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#5D4037] font-jua text-sm rounded-2xl border border-[#D7CCC8] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#81C784]" />
                  <span className="text-[#81C784] font-bold">클립보드에 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8D6E63]" />
                  <span>이미지 클립보드 복사</span>
                </>
              )}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#D7CCC8]/50">
              <button
                id="btn-re-edit"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onEditCustomization();
                }}
                className="py-2.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] font-jua text-xs sm:text-sm rounded-xl border-2 border-[#D7CCC8] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#8D6E63]" />
                <span>프레임 수정</span>
              </button>

              <button
                id="btn-start-over"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onRestart();
                }}
                className="py-2.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] font-jua text-xs sm:text-sm rounded-xl border-2 border-[#D7CCC8] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#8D6E63]" />
                <span>새로 찍기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
