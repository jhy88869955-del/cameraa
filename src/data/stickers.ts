export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  items: {
    id: string;
    emoji: string;
    label: string;
  }[];
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'kinder_stamps',
    name: '칭찬 도장',
    icon: '💮',
    items: [
      { id: 'stamp_best', emoji: '💮', label: '참 잘했어요' },
      { id: 'stamp_love', emoji: '💖', label: '사랑해요' },
      { id: 'stamp_thumb', emoji: '👍', label: '최고야!' },
      { id: 'stamp_star', emoji: '⭐', label: '반짝스타' },
      { id: 'stamp_sun', emoji: '☀️', label: '햇살미소' },
      { id: 'stamp_heart', emoji: '❤️', label: '하트뿅' },
    ],
  },
  {
    id: 'cute_costumes',
    name: '머리띠 & 소품',
    icon: '👑',
    items: [
      { id: 'crown_gold', emoji: '👑', label: '왕관' },
      { id: 'party_hat', emoji: '🥳', label: '파티모자' },
      { id: 'bunny_ears', emoji: '🐰', label: '토끼귀' },
      { id: 'bear_head', emoji: '🧸', label: '곰돌이' },
      { id: 'sunglasses', emoji: '🕶️', label: '선글라스' },
      { id: 'heart_glasses', emoji: '👓', label: '안경' },
      { id: 'red_ribbon', emoji: '🎀', label: '리본' },
      { id: 'magic_wand', emoji: '🪄', label: '요술봉' },
    ],
  },
  {
    id: 'animals',
    name: '동물 친구들',
    icon: '🐣',
    items: [
      { id: 'chick', emoji: '🐣', label: '병아리' },
      { id: 'cat', emoji: '🐱', label: '고양이' },
      { id: 'dog', emoji: '🐶', label: '강아지' },
      { id: 'tiger', emoji: '🐯', label: '호랑이' },
      { id: 'lion', emoji: '🦁', label: '사자' },
      { id: 'frog', emoji: '🐸', label: '개구리' },
      { id: 'whale', emoji: '🐳', label: '고래' },
      { id: 'dino', emoji: '🦕', label: '공룡' },
    ],
  },
  {
    id: 'decorations',
    name: '반짝이 & 자연',
    icon: '✨',
    items: [
      { id: 'sparkles', emoji: '✨', label: '반짝이' },
      { id: 'rainbow', emoji: '🌈', label: '무지개' },
      { id: 'cloud', emoji: '☁️', label: '구름' },
      { id: 'cherry_blossom', emoji: '🌸', label: '벚꽃' },
      { id: 'sunflower', emoji: '🌻', label: '해바라기' },
      { id: 'sprout', emoji: '🌱', label: '새싹' },
      { id: 'clover', emoji: '🍀', label: '네잎클로버' },
      { id: 'balloon', emoji: '🎈', label: '풍선' },
      { id: 'tada', emoji: '🎉', label: '폭죽' },
      { id: 'candy', emoji: '🍭', label: '사탕' },
    ],
  },
];
