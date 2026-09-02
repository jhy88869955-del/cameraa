import React, { useState } from 'react';
import { Palette, Layout, Type, Sparkles, Plus, Trash2, Tag, Calendar, Smile } from 'lucide-react';
import { FrameTheme, LayoutMode, PlacedSticker, PhotoFilter } from '../types';
import { FRAME_THEMES, CLASS_PRESETS } from '../data/frames';
import { STICKER_CATEGORIES } from '../data/stickers';
import { soundManager } from '../utils/audio';

interface FrameCustomizerProps {
  currentFrame: FrameTheme;
  onSelectFrame: (frame: FrameTheme) => void;
  currentLayout: LayoutMode;
  onSelectLayout: (layout: LayoutMode) => void;
  classNameText: string;
  onChangeClassName: (text: string) => void;
  subText: string;
  onChangeSubText: (text: string) => void;
  dateText: string;
  onChangeDateText: (text: string) => void;
  stickers: PlacedSticker[];
  onAddSticker: (emoji: string, label?: string) => void;
  onClearStickers: () => void;
}

type TabType = 'frames' | 'layout' | 'stickers' | 'text';

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  currentFrame,
  onSelectFrame,
  currentLayout,
  onSelectLayout,
  classNameText,
  onChangeClassName,
  subText,
  onChangeSubText,
  dateText,
  onChangeDateText,
  stickers,
  onAddSticker,
  onClearStickers,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('frames');
  const [activeStickerCategory, setActiveStickerCategory] = useState<string>('kinder_stamps');

  const tabs: { id: TabType; name: string; icon: React.ReactNode }[] = [
    { id: 'frames', name: '프레임 테마', icon: <Palette className="w-4 h-4" /> },
    { id: 'layout', name: '배치 형식', icon: <Layout className="w-4 h-4" /> },
    { id: 'stickers', name: '스티커 & 도장', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'text', name: '우리반 문구', icon: <Type className="w-4 h-4" /> },
  ];

  return (
    <div
      id="frame-customizer-panel"
      className="w-full bg-white p-6 rounded-[32px] shadow-sm border-2 border-[#E0E0E0] flex flex-col gap-5"
    >
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-[#EFEBE9] rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              type="button"
              onClick={() => {
                soundManager.playPop();
                setActiveTab(tab.id);
              }}
              className={`py-2.5 px-1 rounded-xl font-jua text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white text-[#5D4037] shadow-sm font-bold border border-[#D7CCC8]'
                  : 'text-[#8D6E63] hover:text-[#5D4037] hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {/* Tab 1: Frame Themes */}
        {activeTab === 'frames' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#8D6E63]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#4FC3F7]">🎨</span>
                프레임 디자인 테마 ({FRAME_THEMES.length}종)
              </span>
              <span className="text-[#A1887F] font-normal">
                선택: {currentFrame.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {FRAME_THEMES.map((theme) => {
                const isSelected = currentFrame.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-btn-${theme.id}`}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      onSelectFrame(theme);
                    }}
                    style={{
                      background: theme.bgGradient || theme.bgColor,
                    }}
                    className={`p-3 rounded-2xl border-3 flex flex-col items-center text-center gap-1 shadow-sm transition-all text-xs font-jua relative overflow-hidden ${
                      isSelected
                        ? 'border-[#FFD54F] ring-4 ring-[#FFD54F]/40 scale-[1.03]'
                        : 'border-white hover:border-[#D7CCC8] opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span className="text-2xl drop-shadow-2xs">
                      {theme.headerIcon}
                    </span>
                    <span
                      style={{ color: theme.textColor }}
                      className="truncate max-w-[120px] font-bold"
                    >
                      {theme.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-[#FF8A65] ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Layout Format */}
        {activeTab === 'layout' && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-[#8D6E63]">
              포토컷 출력 형식 선택
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: 1x4 Strip */}
              <button
                id="layout-btn-strip"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onSelectLayout('strip');
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                  currentLayout === 'strip'
                    ? 'border-[#81C784] bg-[#81C784]/10 text-[#5D4037] shadow-sm ring-2 ring-[#81C784]/30'
                    : 'border-[#E0E0E0] bg-white text-[#5D4037] hover:border-[#D7CCC8]'
                }`}
              >
                <div className="w-10 h-24 border-2 border-[#D7CCC8] bg-white rounded-lg flex flex-col justify-around p-1 shadow-inner">
                  <div className="w-full h-4 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-4 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-4 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-4 bg-[#FFD54F]/70 rounded" />
                </div>
                <div className="font-jua text-sm">1x4 롱 스트립</div>
                <div className="text-[11px] font-gaegu text-[#A1887F]">
                  인생네컷 시그니처 세로형
                </div>
              </button>

              {/* Option 2: 2x2 Grid */}
              <button
                id="layout-btn-grid"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onSelectLayout('grid');
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                  currentLayout === 'grid'
                    ? 'border-[#81C784] bg-[#81C784]/10 text-[#5D4037] shadow-sm ring-2 ring-[#81C784]/30'
                    : 'border-[#E0E0E0] bg-white text-[#5D4037] hover:border-[#D7CCC8]'
                }`}
              >
                <div className="w-18 h-20 border-2 border-[#D7CCC8] bg-white rounded-lg grid grid-cols-2 gap-1 p-1 shadow-inner">
                  <div className="w-full h-7 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-7 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-7 bg-[#FFD54F]/70 rounded" />
                  <div className="w-full h-7 bg-[#FFD54F]/70 rounded" />
                </div>
                <div className="font-jua text-sm">2x2 격자 포토카드</div>
                <div className="text-[11px] font-gaegu text-[#A1887F]">
                  정사각형 엽서/SNS 형태
                </div>
              </button>

              {/* Option 3: Twin Double Strip */}
              <button
                id="layout-btn-twin"
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onSelectLayout('twin');
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                  currentLayout === 'twin'
                    ? 'border-[#81C784] bg-[#81C784]/10 text-[#5D4037] shadow-sm ring-2 ring-[#81C784]/30'
                    : 'border-[#E0E0E0] bg-white text-[#5D4037] hover:border-[#D7CCC8]'
                }`}
              >
                <div className="w-20 h-24 border-2 border-[#D7CCC8] bg-white rounded-lg flex items-center justify-between p-1 gap-1 shadow-inner">
                  <div className="flex-1 h-full border border-dashed border-[#D7CCC8] flex flex-col justify-around p-0.5">
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                  </div>
                  <div className="flex-1 h-full border border-dashed border-[#D7CCC8] flex flex-col justify-around p-0.5">
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                    <div className="w-full h-3 bg-[#FFD54F]/70 rounded" />
                  </div>
                </div>
                <div className="font-jua text-sm">2장 분할 (4x6 인쇄용)</div>
                <div className="text-[11px] font-gaegu text-[#A1887F]">
                  인쇄 후 반으로 싹둑! ✂️
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Stickers & Stamps */}
        {activeTab === 'stickers' && (
          <div className="flex flex-col gap-3">
            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {STICKER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  type="button"
                  onClick={() => {
                    soundManager.playPop();
                    setActiveStickerCategory(cat.id);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-jua transition-all flex items-center gap-1 border ${
                    activeStickerCategory === cat.id
                      ? 'bg-[#FF8A65] text-white border-[#FF8A65] shadow-xs'
                      : 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] hover:bg-[#D7CCC8]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Sticker grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto p-2 bg-[#FFF9F2] rounded-2xl border-2 border-[#D7CCC8]">
              {STICKER_CATEGORIES.find((c) => c.id === activeStickerCategory)?.items.map(
                (item) => (
                  <button
                    key={item.id}
                    id={`sticker-btn-${item.id}`}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      onAddSticker(item.emoji, item.label);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-[#EFEBE9] border border-[#D7CCC8] shadow-2xs flex flex-col items-center justify-center gap-0.5 hover:scale-110 active:scale-95 transition-all"
                  >
                    <span className="text-2xl select-none">{item.emoji}</span>
                    <span className="text-[10px] font-gaegu text-[#5D4037] truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                )
              )}
            </div>

            {/* Placed Stickers Count & Clear */}
            <div className="flex items-center justify-between text-xs text-[#A1887F] pt-1">
              <span className="font-gaegu text-base">
                붙인 스티커: {stickers.length}개 (사진 위에서 드래그하여 이동할 수 있어요!)
              </span>
              {stickers.length > 0 && (
                <button
                  id="btn-clear-stickers"
                  type="button"
                  onClick={() => {
                    soundManager.playPop();
                    onClearStickers();
                  }}
                  className="text-[#FF8A65] hover:text-[#F4511E] font-jua text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 스티커 모두 지우기
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Text Personalization */}
        {activeTab === 'text' && (
          <div className="flex flex-col gap-4">
            {/* Quick Class Presets */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8D6E63] mb-2">
                <Tag className="w-3.5 h-3.5 text-[#FF8A65]" />
                <span>유치원 반 이름 빠른 선택</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[85px] overflow-y-auto pr-1">
                {CLASS_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    id={`preset-${preset.name}`}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      onChangeClassName(`${preset.name} ${preset.emoji}`);
                      onChangeSubText(preset.subtext);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-[#EFEBE9] text-[#5D4037] font-jua text-xs rounded-xl border-2 border-[#D7CCC8] transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="input-class-name"
                  className="block text-xs font-bold text-[#8D6E63] mb-1"
                >
                  상단 반 이름 / 타이틀
                </label>
                <input
                  id="input-class-name"
                  type="text"
                  value={classNameText}
                  onChange={(e) => onChangeClassName(e.target.value)}
                  placeholder="예: 햇살반 친구들 ☀️"
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F2] border-2 border-[#D7CCC8] rounded-xl font-jua text-sm text-[#5D4037] focus:outline-none focus:border-[#FF8A65]"
                />
              </div>

              <div>
                <label
                  htmlFor="input-subtext"
                  className="block text-xs font-bold text-[#8D6E63] mb-1"
                >
                  부제목 / 슬로건
                </label>
                <input
                  id="input-subtext"
                  type="text"
                  value={subText}
                  onChange={(e) => onChangeSubText(e.target.value)}
                  placeholder="예: 사랑스러운 우리들의 추억"
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F2] border-2 border-[#D7CCC8] rounded-xl font-jua text-sm text-[#5D4037] focus:outline-none focus:border-[#FF8A65]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="input-date-text"
                  className="block text-xs font-bold text-[#8D6E63] mb-1 flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#FF8A65]" />
                  하단 날짜 표기
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-date-text"
                    type="text"
                    value={dateText}
                    onChange={(e) => onChangeDateText(e.target.value)}
                    placeholder="예: 2026.09.02"
                    className="flex-1 px-3.5 py-2.5 bg-[#FFF9F2] border-2 border-[#D7CCC8] rounded-xl font-jua text-sm text-[#5D4037] focus:outline-none focus:border-[#FF8A65]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      const d = new Date();
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      onChangeDateText(`${y}.${m}.${day}`);
                    }}
                    className="px-4 py-2.5 bg-[#FFD54F] hover:bg-[#FFCA28] text-[#5D4037] font-jua text-xs rounded-xl border border-[#D7CCC8] shadow-2xs cursor-pointer"
                  >
                    오늘 날짜
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
