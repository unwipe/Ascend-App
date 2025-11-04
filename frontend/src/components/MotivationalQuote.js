import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { getDailyQuote } from '../utils/motivationalQuotes';

const MotivationalQuote = () => {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  if (!quote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-6 mb-6"
      data-testid="motivational-quote"
    >
      <div className="flex gap-4">
        <Quote className="w-8 h-8 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-lg text-white italic mb-2">"{quote.text}"</p>
          {quote.author && (
            <p className="text-sm text-gray-400">— {quote.author}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MotivationalQuote;
