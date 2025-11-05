// Effects management utilities for Ascend

/**
 * Get all currently active effects
 * @returns {array} Array of active effects with details
 */
export const getActiveEffects = () => {
  const effects = [];
  const activeEffectsData = JSON.parse(localStorage.getItem('activeEffects') || '{}');

  // Check XP Multiplier
  if (activeEffectsData.xpMultiplier?.active) {
    const expiresAt = new Date(activeEffectsData.xpMultiplier.expiresAt);
    const now = new Date();
    const timeRemaining = expiresAt - now;

    if (timeRemaining > 0) {
      effects.push({
        type: 'xpMultiplier',
        name: 'XP Multiplier (2x)',
        icon: '🔥',
        timeRemaining: formatTimeRemaining(timeRemaining),
        expiresAt: activeEffectsData.xpMultiplier.expiresAt,
      });
    } else {
      // Expired - remove from localStorage
      deactivateEffect('xpMultiplier');
    }
  }

  // Check Streak Saver
  if (activeEffectsData.streakSaver?.active && activeEffectsData.streakSaver?.usesLeft > 0) {
    effects.push({
      type: 'streakSaver',
      name: 'Streak Saver',
      icon: '🛡️',
      timeRemaining: `${activeEffectsData.streakSaver.usesLeft} use(s) left`,
      usesLeft: activeEffectsData.streakSaver.usesLeft,
    });
  }

  return effects;
};

/**
 * Format time remaining in human-readable format
 */
export const formatTimeRemaining = (milliseconds) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
};

/**
 * Activate XP Multiplier
 */
export const activateXPMultiplier = () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 HOURS (not 1)

  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  activeEffects.xpMultiplier = {
    active: true,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    multiplier: 2,
  };
  localStorage.setItem('activeEffects', JSON.stringify(activeEffects));
};

/**
 * Check if XP Multiplier is active and return multiplier value
 */
export const getXPMultiplier = () => {
  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  
  if (activeEffects.xpMultiplier?.active) {
    const expiresAt = new Date(activeEffects.xpMultiplier.expiresAt);
    const now = new Date();
    
    if (now < expiresAt) {
      return activeEffects.xpMultiplier.multiplier; // Return 2
    } else {
      // Expired
      deactivateEffect('xpMultiplier');
      return 1;
    }
  }
  
  return 1; // No multiplier active
};

/**
 * Deactivate an effect
 */
export const deactivateEffect = (effectType) => {
  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  if (activeEffects[effectType]) {
    activeEffects[effectType].active = false;
  }
  localStorage.setItem('activeEffects', JSON.stringify(activeEffects));
};

/**
 * Activate Streak Saver
 */
export const activateStreakSaver = () => {
  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  activeEffects.streakSaver = {
    active: true,
    usesLeft: 1,
    activatedAt: new Date().toISOString(),
  };
  localStorage.setItem('activeEffects', JSON.stringify(activeEffects));
};

/**
 * Check if Streak Saver is active
 */
export const isStreakSaverActive = () => {
  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  return activeEffects.streakSaver?.active && activeEffects.streakSaver?.usesLeft > 0;
};

/**
 * Use Streak Saver (decrement uses)
 */
export const useStreakSaver = () => {
  const activeEffects = JSON.parse(localStorage.getItem('activeEffects') || '{}');
  
  if (activeEffects.streakSaver?.active && activeEffects.streakSaver?.usesLeft > 0) {
    activeEffects.streakSaver.usesLeft -= 1;
    
    if (activeEffects.streakSaver.usesLeft === 0) {
      activeEffects.streakSaver.active = false;
    }
    
    localStorage.setItem('activeEffects', JSON.stringify(activeEffects));
    return true;
  }
  
  return false;
};

/**
 * Get GLOBAL mini-game cooldown status (applies to ALL mini-games)
 * @returns {object} { isAvailable, timeRemaining, formattedTime }
 */
export const getGlobalMiniGameCooldown = () => {
  const cooldownData = JSON.parse(localStorage.getItem('miniGameCooldown') || '{}');
  
  if (!cooldownData.lastPlayedAt) {
    return { isAvailable: true, timeRemaining: 0, formattedTime: null };
  }

  const lastPlayed = new Date(cooldownData.lastPlayedAt);
  const now = new Date();
  const cooldownMs = (cooldownData.cooldownMinutes || 30) * 60 * 1000;
  const nextAvailable = new Date(lastPlayed.getTime() + cooldownMs);
  const timeRemaining = nextAvailable - now;

  if (timeRemaining <= 0) {
    return { isAvailable: true, timeRemaining: 0, formattedTime: null };
  }

  // Format time remaining
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  let formattedTime;
  if (hours > 0) {
    formattedTime = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    formattedTime = `${minutes}m ${seconds}s`;
  } else {
    formattedTime = `${seconds}s`;
  }

  return {
    isAvailable: false,
    timeRemaining,
    formattedTime,
  };
};

/**
 * Set GLOBAL mini-game cooldown after completing ANY mini-game
 */
export const setGlobalMiniGameCooldown = () => {
  const cooldownData = {
    lastPlayedAt: new Date().toISOString(),
    cooldownMinutes: 30,
  };
  localStorage.setItem('miniGameCooldown', JSON.stringify(cooldownData));
};
