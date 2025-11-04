// Level System with Emojis and Rank Titles

export const levelEmojis = {
  1: '🌱', 2: '🔥', 3: '⚡', 4: '💎', 5: '🏆',
  6: '👑', 7: '🦁', 8: '🐉', 9: '🚀', 10: '⭐',
  11: '🌟', 12: '💫', 13: '🔮', 14: '🦅', 15: '🌊',
  16: '🌋', 17: '❄️', 18: '🦄', 19: '🛡️', 20: '⚔️',
  21: '🌙', 22: '🌕', 23: '☀️', 24: '🪐', 25: '🌍',
  26: '🌈', 27: '🎆', 28: '💥', 29: '🌠', 30: '🌌',
  31: '🔱', 32: '🎖️', 33: '🏅', 34: '🦚', 35: '🎇',
  36: '✨', 37: '💠', 38: '🔆', 39: '⚛️', 40: '🧬',
  41: '🌐', 42: '🗺️', 43: '🎭', 44: '🎪', 45: '🎨',
  46: '🦖', 47: '🐺', 48: '🦋', 49: '♾️', 50: '👑'
};

export const rankTitles = {
  1: 'Novice', 2: 'Initiate', 3: 'Apprentice', 4: 'Adept', 5: 'Journeyman',
  6: 'Skilled', 7: 'Expert', 8: 'Elite', 9: 'Master', 10: 'Champion',
  11: 'Hero', 12: 'Warrior', 13: 'Guardian', 14: 'Sentinel', 15: 'Protector',
  16: 'Defender', 17: 'Vanguard', 18: 'Paragon', 19: 'Exemplar', 20: 'Legend',
  21: 'Mythic', 22: 'Fabled', 23: 'Renowned', 24: 'Illustrious', 25: 'Exalted',
  26: 'Transcendent', 27: 'Ascendant', 28: 'Immortal', 29: 'Eternal', 30: 'Divine',
  31: 'Celestial', 32: 'Cosmic', 33: 'Universal', 34: 'Infinite', 35: 'Omnipotent',
  36: 'Supreme', 37: 'Ultimate', 38: 'Absolute', 39: 'Boundless', 40: 'Limitless',
  41: 'Sovereign', 42: 'Emperor', 43: 'Overlord', 44: 'Titan', 45: 'Colossus',
  46: 'Behemoth', 47: 'Leviathan', 48: 'Phoenix', 49: 'Apex', 50: 'Zenith'
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
