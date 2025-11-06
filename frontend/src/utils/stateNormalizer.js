// State normalization utilities to ensure consistent data types

/**
 * Convert possibly-object to array
 */
export function toArray(maybeArr) {
  if (Array.isArray(maybeArr)) {
    return maybeArr;
  }
  if (maybeArr && typeof maybeArr === 'object') {
    return Object.values(maybeArr);
  }
  return [];
}

/**
 * Normalize game state to ensure all fields have correct types
 * Prevents crashes from type mismatches between localStorage/backend
 */
export function normalizeGameState(state = {}) {
  return {
    // User info
    username: state.username || state.name || 'Adventurer',
    // Don't use Google profile URL as avatar - only use emoji avatars
    avatar: (state.avatar && !state.avatar.startsWith('http')) ? state.avatar : '😊',
    
    // Progress
    xp: Number(state.xp ?? 0),
    level: Number(state.level ?? 1),
    coins: Number(state.coins ?? 0),
    
    // Inventory - MUST be an array
    inventory: Array.isArray(state.inventory) 
      ? state.inventory 
      : toArray(state.inventory),
    
    // Quests - ensure all are arrays
    dailyQuests: Array.isArray(state.dailyQuests) 
      ? state.dailyQuests 
      : toArray(state.dailyQuests),
    weeklyQuests: Array.isArray(state.weeklyQuests) 
      ? state.weeklyQuests 
      : toArray(state.weeklyQuests),
    mainQuest: state.mainQuest || null,
    sideQuests: Array.isArray(state.sideQuests) 
      ? state.sideQuests 
      : toArray(state.sideQuests),
    
    // If quests come from backend as nested object
    ...(state.quests && {
      dailyQuests: Array.isArray(state.quests.daily) 
        ? state.quests.daily 
        : toArray(state.quests?.daily),
      weeklyQuests: Array.isArray(state.quests.weekly) 
        ? state.quests.weekly 
        : toArray(state.quests?.weekly),
      mainQuest: state.quests.main || null,
      sideQuests: Array.isArray(state.quests.side) 
        ? state.quests.side 
        : toArray(state.quests?.side),
    }),
    
    // Streaks - should be objects with numbers
    dailyStreak: Number(state.dailyStreak ?? 0),
    weeklyStreak: Number(state.weeklyStreak ?? 0),
    longestDailyStreak: Number(state.longestDailyStreak ?? 0),
    longestWeeklyStreak: Number(state.longestWeeklyStreak ?? 0),
    lastDailyCheckIn: state.lastDailyCheckIn || null,
    lastWeeklyCheckIn: state.lastWeeklyCheckIn || null,
    
    // If streaks come from backend as nested object
    ...(state.streaks && typeof state.streaks === 'object' && {
      dailyStreak: Number(state.streaks.dailyStreak ?? state.dailyStreak ?? 0),
      weeklyStreak: Number(state.streaks.weeklyStreak ?? state.weeklyStreak ?? 0),
      longestDailyStreak: Number(state.streaks.longestDailyStreak ?? state.longestDailyStreak ?? 0),
      longestWeeklyStreak: Number(state.streaks.longestWeeklyStreak ?? state.longestWeeklyStreak ?? 0),
    }),
    
    // Quest streaks - ensure object
    questStreaks: state.questStreaks && typeof state.questStreaks === 'object' 
      ? state.questStreaks 
      : {},
    
    // Effects - MUST be an array
    activeEffects: Array.isArray(state.activeEffects) 
      ? state.activeEffects 
      : toArray(state.activeEffects),
    
    // Settings
    settings: state.settings && typeof state.settings === 'object' 
      ? state.settings 
      : {},
    tutorialCompleted: Boolean(state.tutorialCompleted || state.settings?.tutorialCompleted),
    soundEnabled: state.soundEnabled ?? state.settings?.soundEnabled ?? true,
    
    // History and achievements
    mainQuestHistory: Array.isArray(state.mainQuestHistory) 
      ? state.mainQuestHistory 
      : toArray(state.mainQuestHistory),
    unlockedAchievements: Array.isArray(state.unlockedAchievements) 
      ? state.unlockedAchievements 
      : Array.isArray(state.achievements)
        ? state.achievements
        : toArray(state.unlockedAchievements || state.achievements),
    
    // Stats for profile
    totalXPEarned: Number(state.totalXPEarned ?? state.xp ?? 0),
    totalQuestsCompleted: Number(state.totalQuestsCompleted ?? 0),
    totalCoinsEarned: Number(state.totalCoinsEarned ?? state.coins ?? 0),
    totalCoinsSpent: Number(state.totalCoinsSpent ?? 0),
    totalPurchases: Number(state.totalPurchases ?? 0),
    memberSince: state.memberSince || state.created_at || new Date().toISOString(),
    miniGamesPlayed: state.miniGamesPlayed && typeof state.miniGamesPlayed === 'object'
      ? state.miniGamesPlayed
      : {},
    mainQuestsCompleted: Number(state.mainQuestsCompleted ?? 0),
    
    // Promo codes and inspiration
    usedPromoCodes: Array.isArray(state.usedPromoCodes) 
      ? state.usedPromoCodes 
      : toArray(state.usedPromoCodes),
    usedInspirationSuggestions: Array.isArray(state.usedInspirationSuggestions) 
      ? state.usedInspirationSuggestions 
      : toArray(state.usedInspirationSuggestions),
    
    // Quest creation limits
    dailyQuestCreationCount: Number(state.dailyQuestCreationCount ?? 0),
    dailyQuestCreationDate: state.dailyQuestCreationDate || null,
    weeklyQuestCreationCount: Number(state.weeklyQuestCreationCount ?? 0),
    weeklyQuestCreationDate: state.weeklyQuestCreationDate || null,
    
    // Cooldowns
    mainQuestCooldown: state.mainQuestCooldown || null,
    dailyCheckInDate: state.dailyCheckInDate || null,
    
    // Unlocked content
    unlockedAvatars: Array.isArray(state.unlockedAvatars)
      ? state.unlockedAvatars
      : ['professional-person', 'professional-woman', 'person-pouting', 'man-pouting', 'woman-pouting', 'person-headscarf', 'male-teacher', 'female-teacher'],
    
    // Other metadata
    lastLoginDate: state.lastLoginDate || new Date().toISOString(),
    isFirstTime: state.isFirstTime ?? true,
    miniGameCooldowns: state.miniGameCooldowns && typeof state.miniGameCooldowns === 'object'
      ? state.miniGameCooldowns
      : {},
  };
}

/**
 * Merge server data with local data
 * Keeps highest values for XP, coins, levels, streaks
 * Uses arrays from server if they have data, otherwise local
 */
export function mergeGameStates(serverData, localData) {
  const normalized = normalizeGameState({
    ...localData,
    ...serverData,
    
    // Keep higher values
    xp: Math.max(
      Number(localData?.xp ?? 0), 
      Number(serverData?.xp ?? 0)
    ),
    level: Math.max(
      Number(localData?.level ?? 1), 
      Number(serverData?.level ?? 1)
    ),
    coins: Math.max(
      Number(localData?.coins ?? 0), 
      Number(serverData?.coins ?? 0)
    ),
    dailyStreak: Math.max(
      Number(localData?.dailyStreak ?? 0), 
      Number(serverData?.dailyStreak ?? serverData?.streaks?.dailyStreak ?? 0)
    ),
    weeklyStreak: Math.max(
      Number(localData?.weeklyStreak ?? 0), 
      Number(serverData?.weeklyStreak ?? serverData?.streaks?.weeklyStreak ?? 0)
    ),
    
    // Use server quests if they exist and have data
    dailyQuests: (serverData?.quests?.daily?.length || serverData?.dailyQuests?.length)
      ? (serverData?.quests?.daily || serverData?.dailyQuests)
      : (localData?.dailyQuests || []),
    weeklyQuests: (serverData?.quests?.weekly?.length || serverData?.weeklyQuests?.length)
      ? (serverData?.quests?.weekly || serverData?.weeklyQuests)
      : (localData?.weeklyQuests || []),
    mainQuest: serverData?.quests?.main || serverData?.mainQuest || localData?.mainQuest || null,
    sideQuests: (serverData?.quests?.side?.length || serverData?.sideQuests?.length)
      ? (serverData?.quests?.side || serverData?.sideQuests)
      : (localData?.sideQuests || []),
    
    // Merge arrays (union)
    inventory: [
      ...toArray(localData?.inventory),
      ...toArray(serverData?.inventory)
    ],
    
    // Tutorial completed if either says so
    tutorialCompleted: Boolean(
      localData?.tutorialCompleted || 
      serverData?.tutorialCompleted || 
      serverData?.settings?.tutorialCompleted
    ),
  });
  
  return normalized;
}
