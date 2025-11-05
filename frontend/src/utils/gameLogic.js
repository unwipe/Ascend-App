// Game logic utility functions

// Export from levelSystem.js for consistency
export { getLevelEmoji, getRankTitle, getXPForLevel, calculateLevel, getXPProgress } from './levelSystem';

// Calculate required XP for next level (x1.5 exponential system)
export const getRequiredXP = (level) => {
  const { getXPForLevel } = require('./levelSystem');
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  return nextLevelXP - currentLevelXP;
};

// Check if user should level up based on current XP
export const checkLevelUp = (currentXP, currentLevel) => {
  const { getXPForLevel, calculateLevel } = require('./levelSystem');
  
  // Calculate what level the user should be at based on their XP
  const actualLevel = calculateLevel(currentXP);
  
  if (actualLevel > currentLevel) {
    return {
      shouldLevelUp: true,
      newLevel: actualLevel,
      levelsGained: actualLevel - currentLevel
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
