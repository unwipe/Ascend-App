import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { getActiveEffects } from '../utils/effectsUtils';

const ActiveEffects = () => {
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    updateEffects();
    
    // Update every second
    const interval = setInterval(updateEffects, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateEffects = () => {
    const activeEffects = getActiveEffects();
    setEffects(activeEffects);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg border-2 border-purple-500/30 rounded-2xl p-4 shadow-xl mb-6"
      data-testid="active-effects-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Active Effects</h3>
      </div>

      {effects.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-2">No active effects</p>
          <p className="text-xs text-gray-500">
            💡 Use items from your Inventory to boost your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {effects.map((effect) => (
              <motion.div
                key={effect.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
                data-testid={`effect-${effect.type}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{effect.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{effect.name}</div>
                    <div className="text-xs text-purple-300 flex items-center gap-1">
                      ⏱️ {effect.timeRemaining}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ActiveEffects;
