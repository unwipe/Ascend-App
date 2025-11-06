// Individual Quest Streak System
// Tracks streaks for each quest independently with milestone rewards

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

// Milestone rewards (XP + Coins + Special Unlocks)
// XP rewards doubled for better progression
export const getMilestoneReward = (milestone) => {
  const rewards = {
    3: { xp: 40, coins: 5, title: '3-Day Streak!' },
    7: { xp: 100, coins: 5, title: 'Week Warrior!' },
    14: { xp: 200, coins: 5, title: '2-Week Champion!' },
    30: { xp: 400, coins: 5, title: 'Monthly Master!' },
    60: { xp: 1000, coins: 5, title: '60-Day Legend!' },
    100: { xp: 2000, coins: 5, title: '100-Day Titan!', unlockPhoenix: true }
  };
  return rewards[milestone] || null;
};

// Check if streak should continue (within 24 hours + grace period)
export const shouldContinueStreak = (lastCompletedDate) => {
  if (!lastCompletedDate) return false;
  
  const now = new Date();
  const lastCompleted = new Date(lastCompletedDate);
  const hoursSinceCompletion = (now - lastCompleted) / (1000 * 60 * 60);
  
  // Grace period: must complete within 48 hours (24h + 24h grace)
  return hoursSinceCompletion <= 48;
};

// Check if it's a new streak day (different calendar day)
export const isNewStreakDay = (lastCompletedDate) => {
  if (!lastCompletedDate) return true;
  
  const now = new Date();
  const lastCompleted = new Date(lastCompletedDate);
  
  // Different calendar day
  return now.toDateString() !== lastCompleted.toDateString();
};

// Update streak for a quest
export const updateQuestStreak = (currentStreakData, questId, questText) => {
  const now = new Date().toISOString();
  
  // Initialize streak data if doesn't exist
  if (!currentStreakData[questId]) {
    return {
      ...currentStreakData,
      [questId]: {
        questId,
        questText,
        streak: 1,
        lastCompleted: now,
        milestones: [],
        totalCompletions: 1
      }
    };
  }
  
  const questStreak = currentStreakData[questId];
  
  // Check if it's a new day
  if (!isNewStreakDay(questStreak.lastCompleted)) {
    // Same day, no streak increment
    return {
      ...currentStreakData,
      [questId]: {
        ...questStreak,
        lastCompleted: now,
        totalCompletions: questStreak.totalCompletions + 1
      }
    };
  }
  
  // New day - check if streak should continue
  const shouldContinue = shouldContinueStreak(questStreak.lastCompleted);
  const newStreak = shouldContinue ? questStreak.streak + 1 : 1;
  
  return {
    ...currentStreakData,
    [questId]: {
      ...questStreak,
      questText, // Update text in case it changed
      streak: newStreak,
      lastCompleted: now,
      totalCompletions: questStreak.totalCompletions + 1
    }
  };
};

// Check for new milestones and return rewards
export const checkMilestoneRewards = (oldStreak, newStreak) => {
  const newMilestones = STREAK_MILESTONES.filter(
    milestone => newStreak >= milestone && oldStreak < milestone
  );
  
  return newMilestones.map(milestone => ({
    milestone,
    ...getMilestoneReward(milestone)
  }));
};

// Reset streak for a quest (when broken)
export const resetQuestStreak = (currentStreakData, questId) => {
  if (!currentStreakData[questId]) return currentStreakData;
  
  return {
    ...currentStreakData,
    [questId]: {
      ...currentStreakData[questId],
      streak: 0,
      lastCompleted: null
    }
  };
};

// Get all active streaks (sorted by streak count)
export const getActiveStreaks = (streakData) => {
  return Object.values(streakData)
    .filter(data => data.streak > 0)
    .sort((a, b) => b.streak - a.streak);
};

// Get milestone progress for a quest
export const getMilestoneProgress = (streak) => {
  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak);
  const previousMilestone = STREAK_MILESTONES.filter(m => m <= streak).pop() || 0;
  
  return {
    current: streak,
    next: nextMilestone || 100,
    previous: previousMilestone,
    completed: STREAK_MILESTONES.filter(m => m <= streak)
  };
};

// Get streak emoji based on count
export const getStreakEmoji = (streak) => {
  if (streak >= 100) return '🏆';
  if (streak >= 60) return '💎';
  if (streak >= 30) return '⚡';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '💪';
  if (streak >= 3) return '🎯';
  return '🔥';
};

// Format streak display
export const formatStreakDisplay = (streak) => {
  if (streak === 0) return '';
  if (streak === 1) return '🔥 1 day';
  return `${getStreakEmoji(streak)} ${streak} days`;
};
