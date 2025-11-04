// Achievement System

export const achievements = [
  {
    id: 'first_steps',
    icon: '🌱',
    title: 'First Steps',
    description: 'Complete your first quest',
    condition: (stats) => stats.totalQuestsCompleted >= 1
  },
  {
    id: 'week_warrior',
    icon: '🔥',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    condition: (stats) => stats.dailyStreak >= 7
  },
  {
    id: 'month_master',
    icon: '⚡',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    condition: (stats) => stats.dailyStreak >= 30
  },
  {
    id: 'century_club',
    icon: '🏆',
    title: 'Century Club',
    description: 'Maintain a 100-day streak',
    condition: (stats) => stats.dailyStreak >= 100
  },
  {
    id: 'level_10',
    icon: '⭐',
    title: 'Level 10',
    description: 'Reach Level 10',
    condition: (stats) => stats.level >= 10
  },
  {
    id: 'level_25',
    icon: '💎',
    title: 'Level 25',
    description: 'Reach Level 25',
    condition: (stats) => stats.level >= 25
  },
  {
    id: 'level_50',
    icon: '👑',
    title: 'Level 50',
    description: 'Reach Level 50',
    condition: (stats) => stats.level >= 50
  },
  {
    id: 'game_master',
    icon: '🎮',
    title: 'Game Master',
    description: 'Complete all 4 mini-games',
    condition: (stats) => stats.miniGamesPlayed?.dice && stats.miniGamesPlayed?.focusHunt && stats.miniGamesPlayed?.raceClock && stats.miniGamesPlayed?.bossBattle
  },
  {
    id: 'boss_slayer',
    icon: '🐉',
    title: 'Boss Slayer',
    description: 'Complete your first Main Quest',
    condition: (stats) => stats.mainQuestsCompleted >= 1
  },
  {
    id: 'centurion',
    icon: '💯',
    title: 'Centurion',
    description: 'Complete 100 total quests',
    condition: (stats) => stats.totalQuestsCompleted >= 100
  },
  {
    id: 'legendary',
    icon: '🌟',
    title: 'Legendary',
    description: 'Complete 500 total quests',
    condition: (stats) => stats.totalQuestsCompleted >= 500
  },
  {
    id: 'coin_collector',
    icon: '💰',
    title: 'Coin Collector',
    description: 'Earn 100 coins',
    condition: (stats) => stats.totalCoinsEarned >= 100
  },
  {
    id: 'first_purchase',
    icon: '🏪',
    title: 'First Purchase',
    description: 'Buy your first item from the Reward Store',
    condition: (stats) => stats.totalPurchases >= 1
  }
];

export const checkAchievements = (stats, unlockedAchievements = []) => {
  const newlyUnlocked = [];
  
  achievements.forEach(achievement => {
    if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
      newlyUnlocked.push(achievement);
    }
  });
  
  return newlyUnlocked;
};

export const getAchievementProgress = (stats) => {
  const unlocked = achievements.filter(a => a.condition(stats)).length;
  const total = achievements.length;
  return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
};
