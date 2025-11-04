import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { formatCountdown, getTimeUntilMidnight } from '../utils/timerUtils';

const DailyCheckIn = ({ lastCheckIn, onCheckIn }) => {
  const [cooldownTimer, setCooldownTimer] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(true);

  useEffect(() => {
    if (lastCheckIn) {
      const checkCooldown = () => {
        const now = new Date();
        const checkInDate = new Date(lastCheckIn);
        
        // Check if last check-in was today
        const isToday = now.toDateString() === checkInDate.toDateString();
        
        if (isToday) {
          // Already checked in today, show time until midnight (00:01 AM)
          const timeUntilMidnight = getTimeUntilMidnight();
          setCanCheckIn(false);
          setCooldownTimer(formatCountdown(timeUntilMidnight));
        } else {
          // Last check-in was yesterday or earlier, can check in again
          setCanCheckIn(true);
          setCooldownTimer('');
        }
      };

      checkCooldown();
      const interval = setInterval(checkCooldown, 1000);
      return () => clearInterval(interval);
    } else {
      setCanCheckIn(true);
      setCooldownTimer('');
    }
  }, [lastCheckIn]);

  const handleCheckIn = () => {
    if (canCheckIn) {
      onCheckIn();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg border-2 border-blue-500/30 rounded-2xl p-6 shadow-xl mb-8"
      data-testid="daily-check-in-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">📅</div>
          <div>
            <h3 className="text-xl font-bold text-white">Daily Check-In</h3>
            <p className="text-sm text-gray-300">Claim your daily bonus!</p>
          </div>
        </div>

        {canCheckIn ? (
          <Button
            onClick={handleCheckIn}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg"
            data-testid="check-in-btn"
          >
            <Gift className="w-4 h-4 mr-2" />
            Check In (+10 XP)
          </Button>
        ) : (
          <div className="text-center">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Next check-in in:</span>
            </div>
            <div className="text-xl font-bold text-white" data-testid="check-in-timer">
              {cooldownTimer}
            </div>
          </div>
        )}
      </div>

      {!canCheckIn && lastCheckIn && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Last check-in: {new Date(lastCheckIn).toLocaleString()}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DailyCheckIn;
