import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

const StreakBrokenModal = ({ isOpen, onClose, type }) => {
  const isDaily = type === 'daily';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-red-900/95 to-gray-900/95 backdrop-blur-lg border border-red-500/30" data-testid="streak-broken-modal">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4"
          >
            💔
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Streak Broken!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-6"
          >
            Your {isDaily ? 'daily' : 'weekly'} streak was broken! Don't worry, every day is a chance to start fresh. 💪
          </motion.p>
          
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-8"
            data-testid="streak-broken-close-btn"
          >
            Start New Streak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakBrokenModal;
