import React, { useEffect, useState } from 'react';
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
    // Fire celebration confetti animation on canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD54F', '#FF8A65', '#81C784', '#64B5F6', '#BA68C8', '#FF80AB'];
    const particles = Array.from({ length: 60 }).map(() => ({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      canvas.remove();
    };
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
