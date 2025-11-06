// Confetti effects for special events
import confetti from 'canvas-confetti';

/**
 * Level up confetti - celebratory burst
 */
export const triggerLevelUpConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#60a5fa', '#34d399', '#fbbf24', '#f87171'],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.2
  });
  
  // Second burst slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
      colors: ['#8b5cf6', '#ec4899', '#fbbf24']
    });
  }, 250);
};

/**
 * Streak milestone confetti - smaller, focused burst
 */
export const triggerStreakConfetti = () => {
  confetti({
    particleCount: 50,
    spread: 50,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#fb923c', '#fbbf24', '#f59e0b'],
    ticks: 150,
    startVelocity: 35
  });
};

/**
 * Phoenix unlock confetti - special dual-sided pattern
 */
export const triggerPhoenixConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const phoenixColors = ['#f97316', '#fbbf24', '#dc2626', '#ea580c'];
  
  const frame = () => {
    // Left side burst
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: phoenixColors,
      ticks: 100
    });
    
    // Right side burst
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: phoenixColors,
      ticks: 100
    });
    
    // Center burst occasionally
    if (Math.random() > 0.7) {
      confetti({
        particleCount: 5,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: phoenixColors,
        ticks: 120,
        startVelocity: 25
      });
    }

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();
};

/**
 * Achievement unlock confetti - quick sparkle
 */
export const triggerAchievementConfetti = () => {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#fbbf24', '#facc15', '#fde047'],
    ticks: 120,
    shapes: ['circle', 'square'],
    scalar: 0.8
  });
};
