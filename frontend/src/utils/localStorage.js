// localStorage utility functions for Ascend

const STORAGE_KEY = 'ascend_game_data';

// Get data from localStorage
export const loadGameData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading game data:', error);
    return null;
  }
};

// Save data to localStorage
export const saveGameData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving game data:', error);
    return false;
  }
};

// Clear all data
export const clearGameData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing game data:', error);
    return false;
  }
};

// Get initial game state
export const getInitialGameState = () => ({
  level: 1,
  xp: 0,
  coins: 0,
  mainQuest: null,
  mainQuestCooldown: null, // Timestamp when Main Quest cooldown ends (7 days after completion)
  dailyQuests: [], // Now includes: { text, xp, completed, completedAt, category }
  weeklyQuests: [], // Now includes: { text, target, current, xpPerIncrement, lastProgressAt, category }
  sideQuests: [], // Now includes: { text, xp, completed, completedAt, category }
  dailyStreak: 0,
  weeklyStreak: 0,
  lastLoginDate: new Date().toISOString(),
  lastCheckIn: null, // Timestamp of last daily check-in
  isFirstTime: true,
  miniGameCooldowns: {},
  // New fields for Phase 1 & 2
  username: 'Ascendant',
  avatar: '😊',
  unlockedAvatars: ['professional-person', 'professional-woman', 'person-pouting', 'man-pouting', 'woman-pouting', 'person-headscarf', 'male-teacher', 'female-teacher'], // All free avatars unlocked by default
  unlockedAchievements: [],
  inventory: [],
  mainQuestHistory: [], // Stores completed and current Main Quests with full details
  totalXPEarned: 0,
  totalQuestsCompleted: 0,
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  totalPurchases: 0,
  longestDailyStreak: 0,
  longestWeeklyStreak: 0,
  memberSince: new Date().toISOString(),
  miniGamesPlayed: {},
  mainQuestsCompleted: 0,
  tutorialCompleted: false,
  soundEnabled: true,
  activeMultiplier: null,
  // Settings
  settings: {
    individualDailyStreaks: false, // false = global streak, true = individual streaks per quest
  },
  // Active Effects (XP Multiplier, Streak Saver, etc.)
  activeEffects: {}
});
