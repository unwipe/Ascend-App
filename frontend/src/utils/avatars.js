// Avatar data for Ascend

export const FREE_AVATARS = [
  { id: 'professional-person', emoji: '🧑‍💼', name: 'Professional', locked: false },
  { id: 'professional-woman', emoji: '👩‍💼', name: 'Professional Woman', locked: false },
  { id: 'person-pouting', emoji: '🙎', name: 'Person', locked: false },
  { id: 'man-pouting', emoji: '🙎‍♂️', name: 'Man', locked: false },
  { id: 'woman-pouting', emoji: '🙎‍♀️', name: 'Woman', locked: false },
  { id: 'person-headscarf', emoji: '🧕', name: 'Person with Headscarf', locked: false },
  { id: 'male-teacher', emoji: '👨‍🏫', name: 'Teacher', locked: false },
  { id: 'female-teacher', emoji: '👩‍🏫', name: 'Teacher Woman', locked: false },
];

// Sorted by price: Low to High (5 → 10 → 15 → 25 → 50)
export const PAID_AVATARS = [
  // 5 coins - Cheapest
  { id: 'troll', emoji: '🧌', name: 'Troll', price: 5, category: 'Troll', locked: true },
  
  // 10 coins - Most affordable premium avatars
  { id: 'vampire-male', emoji: '🧛‍♂️', name: 'Vampire', price: 10, category: 'Vampire', locked: true },
  { id: 'vampire-female', emoji: '🧛‍♀️', name: 'Vampire Woman', price: 10, category: 'Vampire', locked: true },
  { id: 'prince', emoji: '🤴', name: 'Prince', price: 10, category: 'Royal', locked: true },
  { id: 'princess', emoji: '👸', name: 'Princess', price: 10, category: 'Royal', locked: true },
  { id: 'superhero-male', emoji: '🦸‍♂️', name: 'Superhero', price: 10, category: 'Superhero', locked: true },
  { id: 'superhero-female', emoji: '🦸‍♀️', name: 'Superhero Woman', price: 10, category: 'Superhero', locked: true },
  { id: 'fairy', emoji: '🧚‍♀️', name: 'Fairy', price: 10, category: 'Fairy', locked: true },
  { id: 'zombie-male', emoji: '🧟', name: 'Zombie', price: 10, category: 'Zombie', locked: true },
  { id: 'zombie-female', emoji: '🧟‍♀️', name: 'Zombie Woman', price: 10, category: 'Zombie', locked: true },
  
  // 15 coins - Mid-tier
  { id: 'levitating-male', emoji: '🧘‍♂️', name: 'Levitating', price: 15, category: 'Levitating', locked: true },
  { id: 'levitating-female', emoji: '🧘‍♀️', name: 'Levitating Woman', price: 15, category: 'Levitating', locked: true },
  
  // 45 coins - High-tier (UPDATED from 25 to 45)
  { id: 'ninja', emoji: '🥷', name: 'Ninja', price: 45, category: 'Ninja', locked: true },
  
  // 50 coins - Most Expensive (Ultimate unlock)
  { id: 'mage', emoji: '🧙‍♂️', name: 'Mage', price: 50, category: 'Mage', locked: true },
];

export const ALL_AVATARS = [...FREE_AVATARS, ...PAID_AVATARS];

// Helper function to get avatar by ID
export const getAvatarById = (id) => {
  return ALL_AVATARS.find(avatar => avatar.id === id);
};

// Helper function to get avatar emoji by ID
export const getAvatarEmoji = (id) => {
  const avatar = getAvatarById(id);
  return avatar ? avatar.emoji : '😊';
};

// Helper function to check if avatar is unlocked
export const isAvatarUnlocked = (avatarId, unlockedAvatars) => {
  const avatar = getAvatarById(avatarId);
  if (!avatar) return false;
  
  // Free avatars are always unlocked
  if (!avatar.locked) return true;
  
  // Check if paid avatar is in unlocked list
  return unlockedAvatars.includes(avatarId);
};

// Get all unlocked avatars for a user
export const getUnlockedAvatars = (unlockedAvatars) => {
  return ALL_AVATARS.filter(avatar => 
    !avatar.locked || unlockedAvatars.includes(avatar.id)
  );
};

// Get all locked avatars for a user
export const getLockedAvatars = (unlockedAvatars) => {
  return PAID_AVATARS.filter(avatar => 
    !unlockedAvatars.includes(avatar.id)
  );
};
