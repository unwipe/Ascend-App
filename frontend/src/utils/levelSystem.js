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
 * Calculate XP required for a specific level using gradual exponential curve
 * Formula: Each level's increment grows gradually
 * Level 1: 100 XP
 * Level 2: 110 XP (increment: 10)
 * Level 3: 122 XP (increment: 12)
 * Level 4: 136 XP (increment: 14)
 * The increment itself increases by 2 every level for early levels,
 * then gradually increases more for higher levels
 */
export const getXPForLevel = (level) => {
  if (level <= 1) return 100;
  
  let totalXP = 100; // Level 1 base
  let increment = 10; // Starting increment
  
  for (let i = 2; i <= level; i++) {
    totalXP += increment;
    
    // Gradually increase the increment itself
    // Early levels (2-20): increment grows by 2 each level
    // Mid levels (21-40): increment grows by 3 each level
    // High levels (41+): increment grows by 4 each level
    if (i <= 20) {
      increment += 2;
    } else if (i <= 40) {
      increment += 3;
    } else {
      increment += 4;
    }
  }
  
  return totalXP;
};

/**
 * Calculate current level based on total XP
 */
export const calculateLevel = (totalXP) => {
  let level = 1;
  let xpForNextLevel = getXPForLevel(2);
  
  while (totalXP >= xpForNextLevel) {
    level++;
    xpForNextLevel = getXPForLevel(level + 1);
  }
  
  return level;
};

/**
 * Calculate XP progress for current level
 * Returns: { currentLevelXP, xpForCurrentLevel, xpForNextLevel, progress }
 */
export const getXPProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const xpNeededForCurrentLevel = xpForNextLevel - xpForCurrentLevel;
  const currentLevelXP = totalXP - xpForCurrentLevel;
  const progress = (currentLevelXP / xpNeededForCurrentLevel) * 100;
  
  return {
    currentLevel,
    currentLevelXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpNeededForCurrentLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
};
