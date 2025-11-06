// Daily logs utility for tracking today's progress

const LOGS_KEY = 'ascend_daily_logs';
const DL_EVENT = 'dailyLogs:update';

/**
 * Emit update event when daily logs change
 */
export const emitDailyLogsUpdate = () => {
  window.dispatchEvent(new CustomEvent(DL_EVENT));
};

/**
 * Subscribe to daily logs updates
 * @returns {Function} Cleanup function to unsubscribe
 */
export const onDailyLogsUpdate = (handler) => {
  window.addEventListener(DL_EVENT, handler);
  return () => window.removeEventListener(DL_EVENT, handler);
};

/**
 * Get today's date string (YYYY-MM-DD)
 */
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Load all daily logs
 */
export const loadDailyLogs = () => {
  try {
    const logsStr = localStorage.getItem(LOGS_KEY);
    return logsStr ? JSON.parse(logsStr) : {};
  } catch (error) {
    console.error('Error loading daily logs:', error);
    return {};
  }
};

/**
 * Save daily logs
 */
export const saveDailyLogs = (logs) => {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving daily logs:', error);
  }
};

/**
 * Get today's log (alias for getTodayProgress for consistency)
 */
export const getTodayLog = () => {
  const logs = loadDailyLogs();
  const today = getTodayString();
  
  return logs[today] || {
    xp: 0,
    coins: 0,
    completed: { daily: 0, weekly: 0, side: 0, main: 0 },
    streakChanges: { daily: 0, weekly: 0 }
  };
};

/**
 * Get today's progress (public API for components)
 */
export const getTodayProgress = getTodayLog;

/**
 * Update today's log
 */
export const updateTodayLog = (updates) => {
  const logs = loadDailyLogs();
  const today = getTodayString();
  
  const currentLog = logs[today] || {
    xp: 0,
    coins: 0,
    completed: { daily: 0, weekly: 0, side: 0, main: 0 },
    streakChanges: { daily: 0, weekly: 0 }
  };
  
  logs[today] = {
    ...currentLog,
    ...updates,
    completed: {
      ...currentLog.completed,
      ...(updates.completed || {})
    },
    streakChanges: {
      ...currentLog.streakChanges,
      ...(updates.streakChanges || {})
    }
  };
  
  saveDailyLogs(logs);
  return logs[today];
};

/**
 * Log XP gain
 */
export const logXPGain = (amount) => {
  const todayLog = getTodayLog();
  const result = updateTodayLog({
    xp: todayLog.xp + amount
  });
  emitDailyLogsUpdate();
  return result;
};

/**
 * Log coins earned
 */
export const logCoinsEarned = (amount) => {
  const todayLog = getTodayLog();
  const result = updateTodayLog({
    coins: todayLog.coins + amount
  });
  emitDailyLogsUpdate();
  return result;
};

/**
 * Log quest completion
 */
export const logQuestCompletion = (questType) => {
  const todayLog = getTodayLog();
  const validTypes = ['daily', 'weekly', 'side', 'main'];
  
  if (!validTypes.includes(questType)) {
    console.warn(`Invalid quest type: ${questType}`);
    return todayLog;
  }
  
  return updateTodayLog({
    completed: {
      ...todayLog.completed,
      [questType]: todayLog.completed[questType] + 1
    }
  });
};

/**
 * Log streak change
 */
export const logStreakChange = (streakType, change) => {
  const todayLog = getTodayLog();
  
  return updateTodayLog({
    streakChanges: {
      ...todayLog.streakChanges,
      [streakType]: todayLog.streakChanges[streakType] + change
    }
  });
};

/**
 * Clean old logs (keep last 30 days)
 */
export const cleanOldLogs = () => {
  const logs = loadDailyLogs();
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const cleanedLogs = {};
  Object.keys(logs).forEach(dateStr => {
    const logDate = new Date(dateStr);
    if (logDate >= thirtyDaysAgo) {
      cleanedLogs[dateStr] = logs[dateStr];
    }
  });
  
  saveDailyLogs(cleanedLogs);
  return cleanedLogs;
};
