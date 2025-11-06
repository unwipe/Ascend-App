import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PhoenixUnlockModal - Celebratory modal for unlocking the Phoenix avatar
 * Triggered when a user reaches a 100-day streak milestone on any quest
 * 
 * Features:
 * - Epic animated reveal of the Phoenix character
 * - Flame particle effects
 * - Motivational message about persistence
 * - Auto-closes after celebration
 */
const PhoenixUnlockModal = ({ isOpen, onClose }) => {
  const [showParticles, setShowParticles] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Start particle animation
      setShowParticles(true);
      
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      setAutoCloseTimer(timer);
    } else {
      setShowParticles(false);
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    }

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen, onClose]);

  // Flame particles
  const FlameParticle = ({ delay, duration, x }) => (
    <motion.div
      className="absolute bottom-0 left-1/2"
      initial={{ 
        y: 0, 
        x: x,
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        y: -200, 
        x: x + (Math.random() - 0.5) * 100,
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
      style={{
        background: `linear-gradient(to top, #f97316, #fbbf24, transparent)`,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        filter: 'blur(2px)'
      }}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-orange-900/95 via-gray-900/95 to-red-900/95 backdrop-blur-xl border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 overflow-hidden">
        <DialogTitle className="sr-only">Phoenix Avatar Unlocked!</DialogTitle>
        
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />
        
        {/* Flame particles */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <FlameParticle 
                key={i} 
                delay={i * 0.2} 
                duration={2 + Math.random() * 2}
                x={(Math.random() - 0.5) * 50}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 p-8 text-center">
          {/* Title */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2
            }}
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
              🐦‍🔥 LEGENDARY UNLOCK 🐦‍🔥
            </h2>
          </motion.div>

          {/* Phoenix Avatar */}
          <motion.div
            className="text-9xl my-8 filter drop-shadow-2xl"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              y: [50, -10, 0],
              opacity: 1,
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1.5,
              delay: 0.5,
              times: [0, 0.6, 1]
            }}
          >
            🦅
          </motion.div>

          {/* Phoenix Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h3 className="text-4xl font-bold text-orange-300 mb-2">
              Phoenix
            </h3>
            <p className="text-xl text-orange-200/80 italic mb-6">
              "Rise from the ashes of defeat, stronger than before"
            </p>
          </motion.div>

          {/* Achievement Message */}
          <motion.div
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <p className="text-2xl font-semibold text-orange-100 mb-3">
              🏆 100-Day Streak Achieved! 🏆
            </p>
            <p className="text-lg text-orange-200/90 leading-relaxed">
              You've demonstrated <span className="font-bold text-orange-300">extraordinary dedication</span> and 
              <span className="font-bold text-orange-300"> unwavering commitment</span>. 
              Your persistence has earned you the legendary <span className="font-bold text-orange-300">Phoenix Avatar</span> – 
              a symbol of resilience and rebirth.
            </p>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="mt-8"
          >
            <p className="text-sm text-orange-300/70 mb-4">
              Visit your Profile → Avatar to equip your new Phoenix avatar!
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                text-white font-bold rounded-lg shadow-lg shadow-orange-500/50 
                transition-all duration-300 hover:scale-105 hover:shadow-orange-500/70"
            >
              Continue Your Journey
            </button>
          </motion.div>

          {/* Auto-close indicator */}
          <motion.div
            className="mt-4 text-xs text-orange-300/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            (Auto-closing in a few seconds...)
          </motion.div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-orange-400/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-orange-400/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-orange-400/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-orange-400/50 rounded-br-lg" />
      </DialogContent>
    </Dialog>
  );
};

export default PhoenixUnlockModal;
