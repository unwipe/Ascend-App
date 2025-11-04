import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const XPGainAnimation = ({ xp, visible, onComplete }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 1 }}
          animate={{ opacity: 1, y: -50, scale: 1.2 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1.5 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          data-testid="xp-gain-animation"
        >
          <div className="text-4xl font-bold text-blue-400 drop-shadow-lg">
            +{xp} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPGainAnimation;
