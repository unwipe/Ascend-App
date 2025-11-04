import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { getLevelEmoji, getRankTitle } from '../utils/gameLogic';

const LevelUpModal = ({ isOpen, onClose, oldLevel, newLevel }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const emoji = getLevelEmoji(newLevel);
  const oldEmoji = getLevelEmoji(oldLevel);
  const oldRank = getRankTitle(oldLevel);
  const newRank = getRankTitle(newLevel);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-lg border-2 border-yellow-400/50 shadow-2xl" data-testid="level-up-modal">
        <div className="relative text-center py-8">
          {/* Confetti Effect */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.random() * 400 - 200,
                      y: -20,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{
                      y: 600,
                      rotate: Math.random() * 360,
                      opacity: 0
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      ease: 'easeOut',
                      delay: Math.random() * 0.5
                    }}
                    className="absolute left-1/2 top-0"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                      borderRadius: Math.random() > 0.5 ? '50%' : '0%'
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Sparkles */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Level Up!
          </motion.h2>

          {/* Level Transition */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 0.8, opacity: 0.5 }}
              transition={{ delay: 0.3 }}
              className="text-5xl"
            >
              {getLevelEmoji(oldLevel)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl text-yellow-400"
            >
              →
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className="text-7xl"
            >
              {emoji}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-2"
          >
            <div className="text-6xl font-bold text-yellow-400" data-testid="new-level-display">
              Level {newLevel}
            </div>
            <p className="text-xl text-gray-300">You're getting stronger! Keep going! 💪</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all transform hover:scale-105"
            data-testid="level-up-close-btn"
          >
            Continue
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
