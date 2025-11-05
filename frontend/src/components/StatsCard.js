import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap } from 'lucide-react';
import { Progress } from './ui/progress';
import { getLevelEmoji, getRankTitle, getXPProgress } from '../utils/gameLogic';

const StatsCard = ({ level, xp, coins }) => {
  const xpProgress = getXPProgress(xp);
  const progress = xpProgress.progress;
  const xpNeededForNextLevel = xpProgress.xpNeededForNextLevel;
  const currentXP = xpProgress.currentXP;
  const emoji = getLevelEmoji(level);
  const rankTitle = getRankTitle(level);

  return (
    <motion.div
      data-testid="stats-card"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 mb-6"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              key={level}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-4xl"
            >
              {emoji}
            </motion.div>
            <div>
              <div className="text-sm text-gray-400">Level</div>
              <motion.div
                key={level}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-white"
                data-testid="level-display"
              >
                {level}
              </motion.div>
              <div className="text-sm text-blue-400 font-medium">{rankTitle}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/40">
            <Coins className="w-5 h-5 text-yellow-400" />
            <motion.span
              key={coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-yellow-400"
              data-testid="coins-display"
            >
              {coins}
            </motion.span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-400" />
              XP Progress
            </span>
            <span className="text-gray-300 font-medium" data-testid="xp-display">
              {currentXP} / {xpNeededForNextLevel} XP
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" data-testid="xp-progress-bar" />
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
