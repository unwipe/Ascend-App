// Game logic utility functions

// Export from levelSystem.js for consistency
export { getLevelEmoji, getRankTitle, getXPForLevel, calculateLevel, getXPProgress } from './levelSystem';

// Calculate required XP for next level (uses new exponential system)
export const getRequiredXP = (level) => {
  const { getXPForLevel } = require('./levelSystem');
  return getXPForLevel(level + 1) - getXPForLevel(level);
};

// Check if user should level up (updated for new exponential system)
export const checkLevelUp = (xp, currentLevel) => {
  const { getXPForLevel } = require('./levelSystem');
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  
  if (xp >= xpForNextLevel) {
    // Calculate how many levels to jump (in case of large XP gains)
    let newLevel = currentLevel + 1;
    let xpNeeded = getXPForLevel(newLevel + 1);
    
    while (xp >= xpNeeded) {
      newLevel++;
      xpNeeded = getXPForLevel(newLevel + 1);
    }
    
    return {
      shouldLevelUp: true,
      newLevel: newLevel,
      remainingXP: xp,
      levelsGained: newLevel - currentLevel
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
