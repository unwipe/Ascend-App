// Timer utility functions for countdown timers

// Get time remaining until next 00:01 AM (12:01 AM)
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0); // 00:01 AM
  
  const diff = tomorrow - now;
  return diff;
};

// Get time remaining until next Monday 00:01 AM
export const getTimeUntilMonday = () => {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 1, 0, 0);
  
  const diff = nextMonday - now;
  return diff;
};

// Format milliseconds to readable countdown
export const formatCountdown = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    return `${days}d ${remainingHours}h ${remainingMinutes}m`;
  }
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${seconds}s`;
};

// Check if quest can be completed (cooldown expired)
export const canCompleteQuest = (completedAt) => {
  if (!completedAt) return true;
  
  const now = new Date();
  const completed = new Date(completedAt);
  
  // Check if it's past 00:01 AM today
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 1, 0, 0);
  
  return completed < todayMidnight;
};

// Check if 5 minutes have passed since completion
export const canUndoQuest = (completedAt) => {
  if (!completedAt) return false;
  
  const now = new Date();
  const completed = new Date(completedAt);
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - completed) < fiveMinutes;
};

// Get time remaining for undo (5 minutes)
export const getUndoTimeRemaining = (completedAt) => {
  if (!completedAt) return 0;
  
  const now = new Date();
  const completed = new Date(completedAt);
  const fiveMinutes = 5 * 60 * 1000;
  const elapsed = now - completed;
  
  return Math.max(0, fiveMinutes - elapsed);
};
