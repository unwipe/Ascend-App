import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Coins, Target, Zap, CheckCircle2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const TodaySummaryCard = ({ gameState }) => {
  const [todayStats, setTodayStats] = useState({
    xpGained: 0,
    coinsEarned: 0,
    questsCompleted: {
      daily: 0,
      weekly: 0,
      side: 0,
      main: 0
    },
    streakChanges: {
      daily: 0,
      weekly: 0
    }
  });
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  useEffect(() => {
    if (!gameState) return;

    // Get today's date string
    const today = new Date().toISOString().split('T')[0];

    // Load daily logs from localStorage
    const logsStr = localStorage.getItem('ascend_daily_logs');
    const logs = logsStr ? JSON.parse(logsStr) : {};
    const todayLog = logs[today] || {
      xp: 0,
      coins: 0,
      completed: { daily: 0, weekly: 0, side: 0, main: 0 },
      streakChanges: { daily: 0, weekly: 0 }
    };

    setTodayStats(todayLog);

    // Show confetti if XP gained today and haven't shown yet
    if (todayLog.xp > 0 && !hasShownConfetti) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#60a5fa', '#34d399', '#fbbf24']
      });
      setHasShownConfetti(true);
    }
  }, [gameState, hasShownConfetti]);

  const totalQuests = todayStats.questsCompleted 
    ? Object.values(todayStats.questsCompleted).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Today's Progress</h2>
        </div>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* XP Gained */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">XP Gained</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {(todayStats.xpGained || 0) > 0 ? '+' : ''}{(todayStats.xpGained || 0).toLocaleString()}
          </p>
        </motion.div>

        {/* Coins Earned */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400">Coins Earned</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {(todayStats.coinsEarned || 0) > 0 ? '+' : ''}{(todayStats.coinsEarned || 0).toLocaleString()}
          </p>
        </motion.div>

        {/* Quests Completed */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Quests Done</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{totalQuests}</p>
          {totalQuests > 0 && todayStats.questsCompleted && (
            <div className="flex gap-1 mt-1 text-xs text-gray-500">
              {todayStats.questsCompleted.daily > 0 && <span>📅{todayStats.questsCompleted.daily}</span>}
              {todayStats.questsCompleted.weekly > 0 && <span>⚡{todayStats.questsCompleted.weekly}</span>}
              {todayStats.questsCompleted.side > 0 && <span>⭐{todayStats.questsCompleted.side}</span>}
              {todayStats.questsCompleted.main > 0 && <span>🎯{todayStats.questsCompleted.main}</span>}
            </div>
          )}
        </motion.div>

        {/* Streak Status */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="text-xs text-gray-400">Streaks</p>
          </div>
          <div className="flex gap-3">
            <div>
              <p className="text-sm text-gray-400">Daily</p>
              <p className="text-lg font-bold text-orange-400">
                {gameState?.dailyStreak || 0}
                {todayStats.streakChanges?.daily !== 0 && (
                  <span className={`text-xs ml-1 ${todayStats.streakChanges.daily > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {todayStats.streakChanges.daily > 0 ? '+' : ''}{todayStats.streakChanges.daily}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Weekly</p>
              <p className="text-lg font-bold text-purple-400">
                {gameState?.weeklyStreak || 0}
                {todayStats.streakChanges?.weekly !== 0 && (
                  <span className={`text-xs ml-1 ${todayStats.streakChanges.weekly > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {todayStats.streakChanges.weekly > 0 ? '+' : ''}{todayStats.streakChanges.weekly}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress message */}
      {totalQuests === 0 && todayStats.xpGained === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Start your day by completing quests! 🚀
          </p>
        </div>
      )}

      {totalQuests > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            {totalQuests >= 5 
              ? "Amazing progress! Keep it up! 🔥" 
              : "Great start! Keep going! 💪"}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TodaySummaryCard;
