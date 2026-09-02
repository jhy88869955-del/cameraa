import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CapturedPhoto, FrameTheme, LayoutMode, PlacedSticker } from '../types';
import { X, Move } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface FourCutCanvasHandle {
  exportHighResImage: () => Promise<string>;
}

interface FourCutCanvasProps {
  photos: CapturedPhoto[];
  frame: FrameTheme;
  layout: LayoutMode;
  classNameText: string;
  subText: string;
  dateText: string;
  stickers: PlacedSticker[];
  onUpdateSticker: (id: string, x: number, y: number) => void;
  onRemoveSticker: (id: string) => void;
  interactive?: boolean;
}

export const FourCutCanvas = forwardRef<FourCutCanvasHandle, FourCutCanvasProps>(
  (
    {
      photos,
      frame,
      layout,
      classNameText,
      subText,
      dateText,
      stickers,
      onUpdateSticker,
      onRemoveSticker,
      interactive = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
    const draggingRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      initX: number;
      initY: number;
    } | null>(null);

    // Export high-resolution Canvas to DataURL (PNG)
    useImperativeHandle(ref, () => ({
      exportHighResImage: async (): Promise<string> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // Target high-res resolution (approx 1200px width for crisp print)
        let canvasWidth = 800;
        let canvasHeight = 2400; // 1:3 for strip

        if (layout === 'grid') {
          canvasWidth = 1200;
          canvasHeight = 1500;
        } else if (layout === 'twin') {
          canvasWidth = 1600;
          canvasHeight = 2400; // 4x6 twin strip
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Load all 4 photo images
        const loadedImgs = await Promise.all(
          photos.slice(0, 4).map((p) => {
            return new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.src = p.dataUrl;
            });
          })
        );

        // Helper: Draw Single Strip
        const drawSingleStrip = (
          offsetX: number,
          stripWidth: number,
          stripHeight: number
        ) => {
          ctx.save();
          ctx.translate(offsetX, 0);

          // Background Fill
          ctx.fillStyle = frame.bgColor;
          ctx.fillRect(0, 0, stripWidth, stripHeight);

          // Background Decorative Pattern
          if (frame.themeProps.patternType === 'dots') {
            ctx.fillStyle = `rgba(255, 255, 255, ${frame.themeProps.patternOpacity || 0.15})`;
            for (let x = 20; x < stripWidth; x += 40) {
              for (let y = 20; y < stripHeight; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else if (frame.themeProps.patternType === 'hearts') {
            ctx.font = '24px serif';
            ctx.fillStyle = `rgba(244, 63, 94, ${frame.themeProps.patternOpacity || 0.15})`;
            for (let x = 30; x < stripWidth; x += 80) {
              for (let y = 30; y < stripHeight; y += 80) {
                ctx.fillText('♥', x, y);
              }
            }
          } else if (frame.themeProps.patternType === 'stars') {
            ctx.font = '24px serif';
            ctx.fillStyle = `rgba(250, 204, 21, ${frame.themeProps.patternOpacity || 0.18})`;
            for (let x = 30; x < stripWidth; x += 80) {
              for (let y = 30; y < stripHeight; y += 80) {
                ctx.fillText('★', x, y);
              }
            }
          }

          // Header
          const headerHeight = stripHeight * 0.08;
          ctx.fillStyle = frame.textColor;
          ctx.font = `bold ${stripWidth * 0.055}px "SchoolSafeOuting", "Jua", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${frame.headerIcon} ${classNameText || '우리반 네컷'}`,
            stripWidth / 2,
            headerHeight * 0.55
          );

          // Subtext in Header
          ctx.font = `normal ${stripWidth * 0.032}px "SchoolSafeOuting", "Gaegu", cursive, sans-serif`;
          ctx.fillStyle = frame.textColor;
          ctx.fillText(
            subText || frame.footerTitle,
            stripWidth / 2,
            headerHeight * 0.88
          );

          // Draw 4 Photos
          const paddingX = stripWidth * 0.06;
          const photoW = stripWidth - paddingX * 2;
          const photoH = photoW * 0.75; // 4:3 ratio
          const startY = headerHeight + 10;
          const gapY = (stripHeight * 0.76 - photoH * 4) / 3;

          for (let i = 0; i < 4; i++) {
            const img = loadedImgs[i];
            const y = startY + i * (photoH + gapY);

            // Slot Shadow & Border
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = frame.slotBorderColor || '#FFFFFF';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.roundRect
              ? ctx.roundRect(paddingX, y, photoW, photoH, 16)
              : ctx.rect(paddingX, y, photoW, photoH);
            ctx.fill();
            ctx.stroke();

            // Clip Image inside rounded rect
            if (img) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect
                ? ctx.roundRect(paddingX + 3, y + 3, photoW - 6, photoH - 6, 14)
                : ctx.rect(paddingX + 3, y + 3, photoW - 6, photoH - 6);
              ctx.clip();

              // Draw image centered cover
              const imgRatio = img.width / img.height;
              const slotRatio = photoW / photoH;
              let sW = img.width;
              let sH = img.height;
              let sX = 0;
              let sY = 0;

              if (imgRatio > slotRatio) {
                sW = img.height * slotRatio;
                sX = (img.width - sW) / 2;
              } else {
                sH = img.width / slotRatio;
                sY = (img.height - sH) / 2;
              }

              ctx.drawImage(
                img,
                sX,
                sY,
                sW,
                sH,
                paddingX + 3,
                y + 3,
                photoW - 6,
                photoH - 6
              );
              ctx.restore();
            }
          }

          // Footer Section
          const footerY = stripHeight * 0.88;
          ctx.fillStyle = frame.textColor;
          ctx.textAlign = 'center';
          ctx.font = `bold ${stripWidth * 0.045}px "SchoolSafeOuting", "Jua", sans-serif`;
          ctx.fillText(frame.footerTitle, stripWidth / 2, footerY + 20);

          ctx.font = `bold ${stripWidth * 0.035}px "SchoolSafeOuting", "Nunito", sans-serif`;
          ctx.fillStyle = frame.textColor;
          ctx.fillText(dateText || '2026.09.02', stripWidth / 2, footerY + 55);

          // Barcode Decoration
          if (frame.themeProps.showBarcode) {
            ctx.fillStyle = frame.textColor;
            const barcodeW = stripWidth * 0.45;
            const barcodeH = 24;
            const barcodeX = (stripWidth - barcodeW) / 2;
            const barcodeY = footerY + 80;

            for (let bx = barcodeX; bx < barcodeX + barcodeW; bx += 8) {
              const w = (bx % 16 === 0 ? 4 : 2);
              ctx.fillRect(bx, barcodeY, w, barcodeH);
            }
          }

          ctx.restore();
        };

        // Helper: Draw 2x2 Grid Layout
        const drawGridLayout = () => {
          // Background Fill
          ctx.fillStyle = frame.bgColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Pattern
          if (frame.themeProps.patternType === 'dots') {
            ctx.fillStyle = `rgba(255, 255, 255, ${frame.themeProps.patternOpacity || 0.15})`;
            for (let x = 30; x < canvasWidth; x += 50) {
              for (let y = 30; y < canvasHeight; y += 50) {
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Header
          ctx.fillStyle = frame.textColor;
          ctx.font = `bold ${canvasWidth * 0.05}px "SchoolSafeOuting", "Jua", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(
            `${frame.headerIcon} ${classNameText || '우리반 네컷'}`,
            canvasWidth / 2,
            80
          );
          ctx.font = `normal ${canvasWidth * 0.03}px "SchoolSafeOuting", "Gaegu", cursive, sans-serif`;
          ctx.fillText(subText || frame.footerTitle, canvasWidth / 2, 125);

          // 2x2 slots
          const pad = 50;
          const gap = 30;
          const slotW = (canvasWidth - pad * 2 - gap) / 2;
          const slotH = slotW * 0.75;
          const startY = 160;

          const coords = [
            { x: pad, y: startY },
            { x: pad + slotW + gap, y: startY },
            { x: pad, y: startY + slotH + gap },
            { x: pad + slotW + gap, y: startY + slotH + gap },
          ];

          for (let i = 0; i < 4; i++) {
            const img = loadedImgs[i];
            const { x, y } = coords[i];

            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = frame.slotBorderColor || '#FFFFFF';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.roundRect
              ? ctx.roundRect(x, y, slotW, slotH, 18)
              : ctx.rect(x, y, slotW, slotH);
            ctx.fill();
            ctx.stroke();

            if (img) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect
                ? ctx.roundRect(x + 4, y + 4, slotW - 8, slotH - 8, 14)
                : ctx.rect(x + 4, y + 4, slotW - 8, slotH - 8);
              ctx.clip();
              ctx.drawImage(img, x + 4, y + 4, slotW - 8, slotH - 8);
              ctx.restore();
            }
          }

          // Footer
          const footerY = startY + slotH * 2 + gap + 60;
          ctx.fillStyle = frame.textColor;
          ctx.textAlign = 'center';
          ctx.font = `bold ${canvasWidth * 0.035}px "SchoolSafeOuting", "Jua", sans-serif`;
          ctx.fillText(frame.footerTitle, canvasWidth / 2, footerY);
          ctx.font = `bold ${canvasWidth * 0.028}px "SchoolSafeOuting", "Nunito", sans-serif`;
          ctx.fillText(dateText || '2026.09.02', canvasWidth / 2, footerY + 40);
        };

        // Render chosen layout
        if (layout === 'grid') {
          drawGridLayout();
        } else if (layout === 'twin') {
          // Draw 2 identical strips side-by-side (classic photobooth print)
          const singleW = canvasWidth / 2;
          drawSingleStrip(0, singleW, canvasHeight);
          drawSingleStrip(singleW, singleW, canvasHeight);

          // Center dotted cutting guide line
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
          ctx.lineWidth = 3;
          ctx.setLineDash([12, 12]);
          ctx.beginPath();
          ctx.moveTo(singleW, 20);
          ctx.lineTo(singleW, canvasHeight - 20);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Single 1x4 Strip
          drawSingleStrip(0, canvasWidth, canvasHeight);
        }

        // Render Placed Stickers onto Canvas
        stickers.forEach((st) => {
          if (!st.emoji) return;
          const posX = (st.x / 100) * canvasWidth;
          const posY = (st.y / 100) * canvasHeight;
          const pixelSize = (st.size / 400) * canvasWidth * 0.22;

          ctx.save();
          ctx.translate(posX, posY);
          ctx.rotate((st.rotation * Math.PI) / 180);
          ctx.font = `${pixelSize}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(st.emoji, 0, 0);
          ctx.restore();
        });

        return canvas.toDataURL('image/png');
      },
    }));

    // Mouse / Touch Dragging for Interactive Stickers
    const handleTouchOrMouseDown = (
      e: React.MouseEvent | React.TouchEvent,
      st: PlacedSticker
    ) => {
      if (!interactive) return;
      e.stopPropagation();
      setActiveStickerId(st.id);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      draggingRef.current = {
        id: st.id,
        startX: clientX,
        startY: clientY,
        initX: st.x,
        initY: st.y,
      };

      const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
        if (!draggingRef.current || !containerRef.current) return;
        const curX =
          'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const curY =
          'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((curX - draggingRef.current.startX) / rect.width) * 100;
        const deltaY = ((curY - draggingRef.current.startY) / rect.height) * 100;

        const newX = Math.min(
          95,
          Math.max(5, draggingRef.current.initX + deltaX)
        );
        const newY = Math.min(
          95,
          Math.max(5, draggingRef.current.initY + deltaY)
        );

        onUpdateSticker(draggingRef.current.id, newX, newY);
      };

      const handleEnd = () => {
        draggingRef.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    };

    // Render 4 Photo Slots in DOM View
    const renderPhotoSlots = () => {
      const isGrid = layout === 'grid';

      return (
        <div
          className={`w-full ${
            isGrid
              ? 'grid grid-cols-2 gap-2.5 sm:gap-3.5 my-2'
              : 'flex flex-col gap-2.5 sm:gap-3 my-2'
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const photo = photos[idx];
            return (
              <div
                key={idx}
                id={`photocut-slot-${idx}`}
                style={{
                  borderColor: frame.slotBorderColor || '#FFFFFF',
                  borderRadius: frame.slotRadius || '14px',
                }}
                className="relative aspect-[4/3] overflow-hidden bg-white shadow-sm border-2 sm:border-4"
              >
                {photo ? (
                  <img
                    src={photo.dataUrl}
                    alt={`Photo slot ${idx + 1}`}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-jua text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    // Single photostrip DOM
    const renderSinglePhotostrip = (stripKey: string) => {
      return (
        <div
          key={stripKey}
          style={{
            background: frame.bgGradient || frame.bgColor,
            color: frame.textColor,
          }}
          className="relative w-full h-full flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl shadow-xl border border-black/5 select-none overflow-hidden"
        >
          {/* Decorative Polka Dots Background pattern */}
          {frame.themeProps.patternType === 'dots' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, currentColor 2px, transparent 2px)',
                backgroundSize: '16px 16px',
              }}
            />
          )}

          {/* Header Banner */}
          <div className="relative z-10 text-center pt-1 pb-1">
            <div className="flex items-center justify-center gap-1.5 font-jua text-base sm:text-lg tracking-tight leading-snug">
              <span className="text-lg">{frame.headerIcon}</span>
              <span className="truncate max-w-[200px]">
                {classNameText || '우리반 네컷'}
              </span>
            </div>
            <div className="font-gaegu text-xs sm:text-sm opacity-85 truncate mt-0.5">
              {subText || frame.footerTitle}
            </div>
          </div>

          {/* 4 Photos */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {renderPhotoSlots()}
          </div>

          {/* Footer Banner */}
          <div className="relative z-10 text-center pt-1 pb-1 flex flex-col items-center">
            <div className="font-jua text-xs sm:text-sm tracking-wide">
              {frame.footerTitle}
            </div>
            <div className="font-sans font-bold text-[10px] sm:text-xs tracking-wider opacity-80 mt-0.5">
              {dateText || '2026.09.02'}
            </div>

            {/* Barcode Graphic */}
            {frame.themeProps.showBarcode && (
              <div
                className="flex items-center justify-center gap-1 mt-1.5 opacity-65 h-3.5 w-24"
                title="Barcode"
              >
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2].map((w, i) => (
                  <span
                    key={i}
                    style={{
                      width: `${w * 2}px`,
                      backgroundColor: frame.textColor,
                    }}
                    className="h-full inline-block rounded-xs"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        id="four-cut-canvas-wrapper"
        ref={containerRef}
        onClick={() => setActiveStickerId(null)}
        className="relative mx-auto transition-all select-none"
        style={{
          width: layout === 'twin' ? '380px' : layout === 'grid' ? '320px' : '230px',
          maxWidth: '100%',
        }}
      >
        {/* Layout Mode Containers */}
        {layout === 'twin' ? (
          <div className="grid grid-cols-2 gap-2 bg-slate-200/50 p-2 rounded-3xl border-2 border-dashed border-amber-300">
            {renderSinglePhotostrip('strip-1')}
            {renderSinglePhotostrip('strip-2')}
          </div>
        ) : (
          renderSinglePhotostrip('strip-main')
        )}

        {/* Draggable Interactive Stickers Layer */}
        {stickers.map((st) => {
          const isActive = activeStickerId === st.id;

          return (
            <div
              key={st.id}
              id={`placed-sticker-${st.id}`}
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`,
                fontSize: `${st.size}px`,
              }}
              onMouseDown={(e) => handleTouchOrMouseDown(e, st)}
              onTouchStart={(e) => handleTouchOrMouseDown(e, st)}
              className={`absolute z-30 cursor-move select-none touch-none leading-none ${
                isActive
                  ? 'ring-2 ring-rose-500 rounded-lg bg-white/30 backdrop-blur-[1px] p-1'
                  : 'hover:scale-110 transition-transform'
              }`}
            >
              <span className="drop-shadow-md select-none pointer-events-none">
                {st.emoji}
              </span>

              {/* Active Sticker Actions (Delete / Move tag) */}
              {isActive && interactive && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white rounded-full px-1.5 py-0.5 text-[10px] shadow-lg pointer-events-auto">
                  <span className="flex items-center gap-0.5 text-slate-300">
                    <Move className="w-2.5 h-2.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playPop();
                      onRemoveSticker(st.id);
                    }}
                    className="hover:text-rose-400 p-0.5"
                    title="스티커 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
