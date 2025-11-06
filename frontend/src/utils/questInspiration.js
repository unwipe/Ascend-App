// Quest Inspiration System - Suggestions for all quest types

export const QUEST_DEFINITIONS = {
  mainQuest: "Your ultimate goal. A big, long-term achievement that takes weeks or months to complete. This is your North Star—what you're working toward every day.",
  dailyQuest: "A habit you want to build by doing it every single day. Consistency is key! Track your streak and watch your progress grow over time.",
  weeklyQuest: "A goal you commit to completing multiple times per week. Perfect for activities that don't need to be daily but still require regular effort.",
  sideQuest: "A one-time task or small goal. Quick wins that move you forward! Complete it once and earn your reward."
};

export const MAIN_QUEST_SUGGESTIONS = {
  "💼 Career & Finance": [
    "Launch my own business or side hustle",
    "Get promoted to a leadership position",
    "Save $10,000 for an emergency fund",
    "Learn a high-income skill (coding, design, marketing)",
    "Build a professional portfolio website",
    "Negotiate a 20% salary increase",
    "Become debt-free",
    "Start investing in stocks or real estate"
  ],
  "🏋️ Health & Fitness": [
    "Lose 20 pounds and maintain it",
    "Run a half marathon or full marathon",
    "Build visible muscle and strength",
    "Complete a 30-day fitness challenge",
    "Achieve a specific fitness milestone (pull-up, handstand, etc.)",
    "Transform my diet to whole foods only"
  ],
  "📚 Learning & Skills": [
    "Become fluent in a new language",
    "Master a musical instrument",
    "Complete a professional certification course",
    "Read 50 books this year",
    "Learn advanced photography or videography",
    "Build a complex coding project from scratch"
  ],
  "🎨 Creative & Personal": [
    "Write and publish a book or blog",
    "Create and launch a YouTube channel",
    "Complete a 365-day creative challenge",
    "Build a meaningful personal brand",
    "Renovate or redesign my living space",
    "Travel to 5 new countries"
  ],
  "🧘 Mindfulness & Growth": [
    "Complete a 100-day meditation streak",
    "Overcome a major fear or phobia",
    "Build unshakeable confidence",
    "Develop a morning routine that transforms my life"
  ]
};

export const DAILY_QUEST_SUGGESTIONS = {
  "🌅 Morning Routine": [
    "Wake up at 6 AM",
    "Make my bed immediately after waking",
    "Drink a glass of water first thing",
    "Do 10 minutes of stretching or yoga",
    "Write in my gratitude journal",
    "Review my goals for the day"
  ],
  "💪 Health & Fitness": [
    "Exercise for 30 minutes",
    "Do 50 push-ups",
    "Walk 10,000 steps",
    "Drink 8 glasses of water",
    "Eat a healthy breakfast",
    "Take my vitamins and supplements",
    "No junk food today",
    "7+ hours of sleep"
  ],
  "🧠 Productivity & Focus": [
    "Complete my #1 priority task",
    "Work distraction-free for 2 hours (deep work)",
    "Review and plan tomorrow's tasks",
    "Inbox zero (clear all emails)",
    "No social media scrolling",
    "Learn something new for 15 minutes",
    "Read for 20 minutes"
  ],
  "🧘 Self-Care & Mindfulness": [
    "Meditate for 10 minutes",
    "Practice deep breathing exercises",
    "Write 3 things I'm grateful for",
    "Spend 30 minutes on a hobby I love",
    "Call or text a friend/family member",
    "No phone 1 hour before bed",
    "Evening skincare routine"
  ],
  "🎯 Personal Growth": [
    "Practice a new skill for 20 minutes",
    "Listen to an educational podcast",
    "Journal about my day",
    "Compliment someone genuinely",
    "Do one thing that scares me"
  ]
};

export const WEEKLY_QUEST_SUGGESTIONS = {
  "🏋️ Fitness & Health": [
    "Work out 4 times this week",
    "Meal prep for the entire week",
    "Try a new healthy recipe",
    "Attend 2 fitness classes",
    "Hit 70,000 steps this week",
    "No alcohol this week"
  ],
  "📚 Learning & Growth": [
    "Finish one online course module",
    "Read 100 pages of a book",
    "Practice a new language for 3 hours total",
    "Watch 3 educational videos",
    "Complete a coding challenge"
  ],
  "🎨 Creative & Hobbies": [
    "Create one piece of art or content",
    "Practice my instrument for 5 hours total",
    "Take 50 new photos",
    "Write 2,000 words",
    "Learn a new song or recipe"
  ],
  "🧹 Organization & Productivity": [
    "Deep clean one room in my house",
    "Organize my digital files",
    "Declutter and donate 10 items",
    "Meal plan for next week",
    "Review and update my budget"
  ],
  "👥 Social & Relationships": [
    "Meet up with 2 friends",
    "Call a family member I haven't spoken to",
    "Attend a social event or meetup",
    "Send 5 thoughtful messages to people I care about",
    "Plan a date night or quality time"
  ],
  "💼 Career & Finance": [
    "Apply to 5 jobs",
    "Network with 3 new people",
    "Update my resume or LinkedIn",
    "Save $100 this week",
    "Complete 3 work projects ahead of schedule"
  ]
};

export const SIDE_QUEST_SUGGESTIONS = {
  "✅ Quick Wins (5-15 min)": [
    "Unsubscribe from 10 unwanted emails",
    "Update my phone apps",
    "Backup important files",
    "Clean out my wallet or purse",
    "Water all my plants",
    "Take out the trash and recycling",
    "Organize my desk",
    "Delete old photos from my phone"
  ],
  "🧹 Organization (15-30 min)": [
    "Organize my closet",
    "Clean out the fridge",
    "Sort through old paperwork",
    "Reorganize my bookshelf",
    "Create a to-do list system",
    "Set up a budget tracker"
  ],
  "💼 Productive Tasks (30-60 min)": [
    "Schedule doctor/dentist appointment",
    "Pay all my bills for the month",
    "Research and book a trip",
    "Update my passwords",
    "Write a thank-you note",
    "Plan next week's meals",
    "Fix something that's been broken"
  ],
  "🎉 Fun & Social": [
    "Try a new restaurant or café",
    "Watch a highly-rated movie",
    "Explore a new part of my city",
    "Start a new hobby or craft",
    "Bake something delicious",
    "Have a game night with friends",
    "Visit a museum or gallery"
  ],
  "🌱 Self-Improvement (30+ min)": [
    "Research a topic I'm curious about",
    "Create a vision board",
    "Write a letter to my future self",
    "Learn a new recipe and cook it",
    "Take a personality or strengths test",
    "Reflect on my goals and adjust them"
  ]
};

/**
 * Get all suggestions for a quest type
 */
export const getSuggestionsForType = (questType) => {
  switch (questType) {
    case 'mainQuest':
      return MAIN_QUEST_SUGGESTIONS;
    case 'dailyQuest':
      return DAILY_QUEST_SUGGESTIONS;
    case 'weeklyQuest':
      return WEEKLY_QUEST_SUGGESTIONS;
    case 'sideQuest':
      return SIDE_QUEST_SUGGESTIONS;
    default:
      return {};
  }
};

/**
 * Get a random suggestion from all categories for a quest type
 */
export const getRandomSuggestion = (questType) => {
  const suggestions = getSuggestionsForType(questType);
  const allSuggestions = Object.values(suggestions).flat();
  const randomIndex = Math.floor(Math.random() * allSuggestions.length);
  return allSuggestions[randomIndex];
};

/**
 * Get quest type title for display
 */
export const getQuestTypeTitle = (questType) => {
  const titles = {
    mainQuest: 'Main Quest Inspiration',
    dailyQuest: 'Daily Quest Inspiration',
    weeklyQuest: 'Weekly Quest Inspiration',
    sideQuest: 'Side Quest Inspiration'
  };
  return titles[questType] || 'Quest Inspiration';
};
