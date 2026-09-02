import { PhotoFilter } from '../types';

export const FILTER_STYLES: Record<PhotoFilter, { name: string; cssFilter: string; badge: string }> = {
  normal: {
    name: '기본 (자연스러움)',
    cssFilter: 'none',
    badge: '🌿 원본',
  },
  bright: {
    name: '화사한 햇살 (밝고 선명)',
    cssFilter: 'brightness(1.08) contrast(1.05) saturate(1.12)',
    badge: '✨ 화사함',
  },
  warm: {
    name: '따뜻한 감성 (포근한 톤)',
    cssFilter: 'sepia(0.18) saturate(1.2) brightness(1.04) hue-rotate(-5deg)',
    badge: '☀️ 따뜻함',
  },
  soft: {
    name: '뽀샤시 파스텔 (부드러움)',
    cssFilter: 'brightness(1.1) contrast(0.95) saturate(1.08)',
    badge: '🌸 뽀샤시',
  },
  vintage: {
    name: '필름 빈티지 (감성 네컷)',
    cssFilter: 'sepia(0.3) contrast(1.1) brightness(0.95) saturate(0.9)',
    badge: '🎞️ 필름',
  },
  bw: {
    name: '클래식 흑백',
    cssFilter: 'grayscale(1) contrast(1.15) brightness(1.02)',
    badge: '🖤 흑백',
  },
};
