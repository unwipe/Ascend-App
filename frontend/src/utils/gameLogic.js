// Game logic utility functions

// Calculate required XP for next level
export const getRequiredXP = (level) => {
  return 500 + (level - 1) * 50;
};

// Get level emoji indicator
export const getLevelEmoji = (level) => {
  if (level >= 50) return '👑';
  if (level >= 40) return '💎';
  if (level >= 30) return '⭐';
  if (level >= 20) return '🔥';
  if (level >= 10) return '🚀';
  if (level >= 5) return '⚡';
  return '🌱';
};

// Check if user should level up
export const checkLevelUp = (xp, level) => {
  const requiredXP = getRequiredXP(level);
  if (xp >= requiredXP) {
    return {
      shouldLevelUp: true,
      newLevel: level + 1,
      remainingXP: xp - requiredXP
    };
  }
  return { shouldLevelUp: false };
};

// Check if streak should be broken
export const checkStreakStatus = (lastLoginDate) => {
  const now = new Date();
  const lastLogin = new Date(lastLoginDate);
  
  // Reset time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  lastLogin.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
  
  return {
    shouldResetDaily: daysDiff > 1,
    shouldResetWeekly: daysDiff > 7,
    isNewDay: daysDiff >= 1
  };
};

// Check if it's Monday (weekly reset)
export const isMonday = () => {
  return new Date().getDay() === 1;
};

// Get start of current week
export const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(now.setDate(diff));
};
