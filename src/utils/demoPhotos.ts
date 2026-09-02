// Creates cute fallback/sample photo canvases with happy kindergarten poses

export function generateSampleKidsPhoto(index: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const themes = [
    {
      bg1: '#FEF08A',
      bg2: '#FDE047',
      faceColor: '#FFDFBA',
      pose: '✌️ 브이!',
      accessory: '🐥',
      clothes: '#38BDF8',
      text: '방긋방긋 첫번째 컷',
    },
    {
      bg1: '#BBF7D0',
      bg2: '#86EFAC',
      faceColor: '#FFE4C4',
      pose: '🌸 꽃받침!',
      accessory: '🌱',
      clothes: '#F472B6',
      text: '예쁜미소 두번째 컷',
    },
    {
      bg1: '#FECDD3',
      bg2: '#FDA4AF',
      faceColor: '#FFDAB9',
      pose: '🐯 어흥!',
      accessory: '🐰',
      clothes: '#FBBF24',
      text: '용감하게 세번째 컷',
    },
    {
      bg1: '#BAE6FD',
      bg2: '#7DD3FC',
      faceColor: '#FFE4B5',
      pose: '❤️ 하트뿅!',
      accessory: '👑',
      clothes: '#A78BFA',
      text: '사랑가득 네번째 컷',
    },
    {
      bg1: '#DDD6FE',
      bg2: '#C4B5FD',
      faceColor: '#FFE0BD',
      pose: '🥳 윙크!',
      accessory: '🌈',
      clothes: '#34D399',
      text: '최고신난 다섯번째 컷',
    },
  ];

  const theme = themes[index % themes.length];

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  grad.addColorStop(0, theme.bg1);
  grad.addColorStop(1, theme.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Background decorative polka dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let x = 30; x < 640; x += 60) {
    for (let y = 30; y < 480; y += 60) {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cute Classroom Window or Board Frame
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.roundRect ? ctx.roundRect(20, 20, 600, 440, 20) : ctx.rect(20, 20, 600, 440);
  ctx.fill();

  // Child Figure Body (Shirt)
  ctx.fillStyle = theme.clothes;
  ctx.beginPath();
  ctx.ellipse(320, 470, 140, 120, 0, 0, Math.PI, true);
  ctx.fill();

  // Shirt Collar
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(320, 360, 35, 0, Math.PI);
  ctx.fill();

  // Neck
  ctx.fillStyle = theme.faceColor;
  ctx.fillRect(295, 310, 50, 60);

  // Face Head
  ctx.beginPath();
  ctx.arc(320, 250, 110, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.arc(260, 275, 18, 0, Math.PI * 2);
  ctx.arc(380, 275, 18, 0, Math.PI * 2);
  ctx.fill();

  // Cute Eyes (Smiling Arcs or Happy Dots)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  if (index === 4) {
    // Wink!
    ctx.beginPath();
    ctx.arc(270, 240, 15, Math.PI * 0.1, Math.PI * 0.9, false); // curved smile eye
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(370, 240, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Happy open or smiling curved eyes
    ctx.beginPath();
    ctx.arc(270, 240, 16, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(370, 240, 16, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();
  }

  // Big Happy Smile
  ctx.fillStyle = '#E11D48';
  ctx.beginPath();
  ctx.arc(320, 275, 26, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Hair
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.arc(320, 220, 115, Math.PI * 0.85, Math.PI * 2.15, false);
  ctx.lineTo(440, 260);
  ctx.bezierCurveTo(420, 170, 220, 170, 200, 260);
  ctx.closePath();
  ctx.fill();

  // Front Bangs
  ctx.beginPath();
  ctx.arc(320, 185, 30, 0, Math.PI);
  ctx.arc(275, 185, 25, 0, Math.PI);
  ctx.arc(365, 185, 25, 0, Math.PI);
  ctx.fill();

  // Head Accessory Emoji (Hat / Ribbon / Sprout / Chick)
  ctx.font = '60px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.accessory, 320, 125);

  // Pose Text Bubble
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(420, 70, 180, 60, 16) : ctx.rect(420, 70, 180, 60);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 24px "Jua", sans-serif';
  ctx.fillText(theme.pose, 510, 102);

  // Bottom Label
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(190, 420, 260, 36, 18) : ctx.rect(190, 420, 260, 36);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Jua", sans-serif';
  ctx.fillText(theme.text, 320, 440);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function getSamplePhotoBatch(): string[] {
  return [
    generateSampleKidsPhoto(0),
    generateSampleKidsPhoto(1),
    generateSampleKidsPhoto(2),
    generateSampleKidsPhoto(3),
    generateSampleKidsPhoto(4),
  ];
}
