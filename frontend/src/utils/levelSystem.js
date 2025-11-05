// Level System with Emojis and Rank Titles (x1.5 Exponential Curve)

export const levelEmojis = {
  1: '🌱', 2: '🌿', 3: '🍀', 4: '🌾', 5: '🌳',
  6: '🔥', 7: '🌟', 8: '⚡', 9: '💫', 10: '🔮',
  11: '🗡️', 12: '⚔️', 13: '💎', 14: '🛡️', 15: '🎯',
  16: '🏹', 17: '🌊', 18: '🌪️', 19: '🔱', 20: '🦁',
  21: '🐺', 22: '🦅', 23: '🐉', 24: '🦂', 25: '🐅',
  26: '⚡', 27: '🌋', 28: '❄️', 29: '🌙', 30: '☀️',
  31: '🐉', 32: '👑', 33: '🔥', 34: '💠', 35: '🌌',
  36: '⭐', 37: '🌠', 38: '🪐', 39: '🌀', 40: '🔆',
  41: '⚡', 42: '🌋', 43: '🗿', 44: '🦾', 45: '🔱',
  46: '🐦‍🔥', 47: '👁️', 48: '🌟', 49: '💫', 50: '🌌'
};

export const rankTitles = {
  1: 'Seedling', 2: 'Sprout', 3: 'Wanderer', 4: 'Pathfinder', 5: 'Trailblazer',
  6: 'Ignited', 7: 'Radiant', 8: 'Charged', 9: 'Stellar', 10: 'Mystic',
  11: 'Duelist', 12: 'Gladiator', 13: 'Crystalline', 14: 'Defender', 15: 'Sharpshooter',
  16: 'Huntmaster', 17: 'Tidebreaker', 18: 'Stormcaller', 19: 'Waveborn', 20: 'Lionheart',
  21: 'Wolfpack', 22: 'Skyward', 23: 'Dragonkin', 24: 'Venomstrike', 25: 'Tigerclaw',
  26: 'Thunderborn', 27: 'Magmaforged', 28: 'Frostbound', 29: 'Moonlit', 30: 'Sunforged',
  31: 'Wyrmslayer', 32: 'Sovereign', 33: 'Infernal', 34: 'Voidwalker', 35: 'Starborn',
  36: 'Luminary', 37: 'Celestial', 38: 'Cosmic', 39: 'Eternal', 40: 'Radiant Soul',
  41: 'Stormlord', 42: 'Titan', 43: 'Colossus', 44: 'Unstoppable', 45: 'Godslayer',
  46: 'Phoenix', 47: 'Omniscient', 48: 'Transcendent', 49: 'Legendary', 50: 'Ascendant'
};

export const getLevelEmoji = (level) => {
  if (level <= 50) return levelEmojis[level] || '🌱';
  // For levels above 50, cycle through epic emojis
  const cycleLevel = ((level - 51) % 10) + 41;
  return levelEmojis[cycleLevel] || '👑';
};

export const getRankTitle = (level) => {
  if (level <= 50) return rankTitles[level] || 'Novice';
  // For levels above 50, add Roman numerals
  const baseTitle = rankTitles[50];
  const tier = Math.floor((level - 50) / 10) + 1;
  return `${baseTitle} ${toRoman(tier)}`;
};

const toRoman = (num) => {
  const romanNumerals = [
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let result = '';
  for (const [roman, value] of romanNumerals) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result;
};

/**
 * Calculate XP required to reach a specific level (x1.5 exponential curve)
 * Formula: XP_needed = Math.round(100 * Math.pow(1.5, level - 1))
 * 
 * Level 1: 100 XP (100 * 1.5^0 = 100)
 * Level 2: 150 XP (100 * 1.5^1 = 150)
 * Level 3: 225 XP (100 * 1.5^2 = 225)
 * Level 4: 338 XP (100 * 1.5^3 = 337.5 ≈ 338)
 * Level 5: 507 XP (100 * 1.5^4 = 506.25 ≈ 507)
 */
export const getXPForLevel = (level) => {
  return Math.round(100 * Math.pow(1.5, level - 1));
};

/**
 * Calculate current level based on current XP
 * User starts at Level 1 with 0 XP
 * When XP reaches threshold, level up and carry over excess
 */
export const calculateLevel = (currentXP) => {
  if (currentXP < 0) return 1; // Safety check
  
  let level = 1;
  let xpNeededForNextLevel = getXPForLevel(level);
  
  // Keep leveling up while XP exceeds the threshold
  while (currentXP >= xpNeededForNextLevel) {
    level++;
    xpNeededForNextLevel = getXPForLevel(level);
  }
  
  return level;
};

/**
 * Calculate XP progress for current level
 * Returns progress bar data showing: currentXP / xpNeededForNextLevel
 */
export const getXPProgress = (currentXP) => {
  if (currentXP < 0) currentXP = 0; // Safety check
  
  const currentLevel = calculateLevel(currentXP);
  const xpNeededForCurrentLevel = getXPForLevel(currentLevel);
  const xpNeededForNextLevel = getXPForLevel(currentLevel + 1);
  
  // Calculate XP within current level (for progress bar)
  const xpInCurrentLevel = currentLevel === 1 ? currentXP : currentXP - xpNeededForCurrentLevel;
  const xpRequiredForLevelUp = xpNeededForNextLevel - xpNeededForCurrentLevel;
  
  const progress = (xpInCurrentLevel / xpRequiredForLevelUp) * 100;
  
  return {
    currentLevel,
    currentXP: Math.max(0, xpInCurrentLevel), // XP toward next level
    xpNeededForNextLevel: xpRequiredForLevelUp, // XP required for next level
    progress: Math.min(100, Math.max(0, progress))
  };
};
