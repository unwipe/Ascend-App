// Quest Templates

export const questCategories = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#3B82F6' },
  { id: 'health', name: 'Health', emoji: '💪', color: '#10B981' },
  { id: 'learning', name: 'Learning', emoji: '📚', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#F97316' },
  { id: 'creative', name: 'Creative', emoji: '🎨', color: '#EC4899' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#F59E0B' },
  { id: 'wellness', name: 'Wellness', emoji: '🧘', color: '#14B8A6' },
  { id: 'leisure', name: 'Leisure', emoji: '🎮', color: '#EF4444' }
];

export const dailyQuestTemplates = {
  health: [
    { text: 'Exercise 30 min', xp: 10 },
    { text: 'Go for a walk', xp: 5 },
    { text: 'Meditate 10 min', xp: 5 },
    { text: 'Drink 8 glasses of water', xp: 5 },
    { text: 'Eat healthy meal', xp: 5 },
    { text: 'Sleep 8 hours', xp: 10 }
  ],
  work: [
    { text: 'Complete top priority task', xp: 15 },
    { text: 'Clear email inbox', xp: 10 },
    { text: 'Plan tomorrow', xp: 5 },
    { text: 'Clean workspace', xp: 5 },
    { text: 'Review daily goals', xp: 5 }
  ],
  learning: [
    { text: 'Read 20 pages', xp: 10 },
    { text: 'Language practice 15 min', xp: 10 },
    { text: 'Study 30 min', xp: 10 },
    { text: 'Watch educational video', xp: 5 },
    { text: 'Learn something new', xp: 10 }
  ],
  wellness: [
    { text: 'Journal 10 min', xp: 5 },
    { text: 'Gratitude practice', xp: 5 },
    { text: 'No social media before noon', xp: 10 },
    { text: 'Phone-free hour', xp: 10 },
    { text: 'Morning routine', xp: 10 }
  ],
  personal: [
    { text: 'Make bed', xp: 5 },
    { text: 'Tidy living space', xp: 5 },
    { text: 'Cook a meal', xp: 10 },
    { text: 'Call family/friend', xp: 10 }
  ]
};

export const getCategoryColor = (categoryId) => {
  const category = questCategories.find(c => c.id === categoryId);
  return category?.color || '#6B7280';
};

export const getCategoryEmoji = (categoryId) => {
  const category = questCategories.find(c => c.id === categoryId);
  return category?.emoji || '📋';
};
