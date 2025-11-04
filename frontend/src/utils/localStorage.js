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
  dailyQuests: [],
  weeklyQuests: [],
  sideQuests: [],
  dailyStreak: 0,
  weeklyStreak: 0,
  lastLoginDate: new Date().toISOString(),
  isFirstTime: true,
  miniGameCooldowns: {}
});
