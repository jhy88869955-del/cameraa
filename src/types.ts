export type AppStep = 'ready' | 'shooting' | 'select' | 'customize' | 'result';

export type LayoutMode = 'strip' | 'grid' | 'twin'; // 1x4 세로 스트립 | 2x2 격자 | 4x6 트윈(2열) 인쇄용

export type PhotoFilter = 'normal' | 'bright' | 'warm' | 'soft' | 'vintage' | 'bw';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji?: string;
  label?: string;
  svgType?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px size
  rotation: number; // deg
}

export interface FrameTheme {
  id: string;
  name: string;
  badge: string;
  category: 'kinder' | 'nature' | 'classic' | 'cute';
  bgColor: string;
  bgGradient?: string;
  bgPattern?: string;
  textColor: string;
  accentColor: string;
  slotBorderColor: string;
  slotRadius: string;
  headerIcon: string;
  footerTitle: string;
  stickerDefaults: string[];
  themeProps: {
    patternType?: 'dots' | 'stars' | 'hearts' | 'stripes' | 'none';
    patternOpacity?: number;
    showBarcode?: boolean;
    headerDecoration?: 'chick' | 'sprout' | 'bunny' | 'rainbow' | 'stars' | 'bear' | 'classic' | 'dino' | 'flowers';
  };
}

export interface ClassPreset {
  name: string;
  emoji: string;
  subtext: string;
}
