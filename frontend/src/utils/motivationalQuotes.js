// Motivational Quotes

export const quotes = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: null },
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The harder you work for something, the greater you\'ll feel when you achieve it.', author: null },
  { text: 'Dream bigger. Do bigger.', author: null },
  { text: 'Success doesn\'t just find you. You have to go out and get it.', author: null },
  { text: 'Great things never come from comfort zones.', author: null },
  { text: 'Dream it. Wish it. Do it.', author: null },
  { text: 'Success is what comes after you stop making excuses.', author: null },
  { text: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: null },
  { text: 'Wake up with determination. Go to bed with satisfaction.', author: null },
  { text: 'Do something today that your future self will thank you for.', author: null },
  { text: 'Little things make big days.', author: null },
  { text: 'It\'s going to be hard, but hard does not mean impossible.', author: null }
];

export const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getDailyQuote = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return quotes[dayOfYear % quotes.length];
};
