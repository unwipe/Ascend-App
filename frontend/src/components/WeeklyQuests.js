import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2, Calendar, Clock, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ConfirmModal from './ConfirmModal';
import InspirationModal from './InspirationModal';
import { getTimeUntilMidnight, getTimeUntilMonday, formatCountdown, canCompleteQuest } from '../utils/timerUtils';
import { formatStreakDisplay } from '../utils/streakSystem';

const WeeklyQuests = ({ weeklyQuests, weeklyStreak, questStreaks, weeklyQuestCreation, tutorialCompleted, usedSuggestions, onAddWeekly, onIncrementWeekly, onDeleteWeekly, onMarkSuggestionUsed }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTarget, setNewTarget] = useState('3');
  const [newXP, setNewXP] = useState('10');
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [incrementIndex, setIncrementIndex] = useState(null);
  const [mondayTimer, setMondayTimer] = useState('');
  const [progressTimers, setProgressTimers] = useState({});
  const [showInspiration, setShowInspiration] = useState(false);

  // Update Monday reset timer
  useEffect(() => {
    const updateMondayTimer = () => {
      const timeUntilMonday = getTimeUntilMonday();
      setMondayTimer(formatCountdown(timeUntilMonday));
    };

    updateMondayTimer();
    const interval = setInterval(updateMondayTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update per-progress timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      weeklyQuests.forEach((quest, index) => {
        if (quest.lastProgressAt && quest.current < quest.target) {
          const canProgress = canCompleteQuest(quest.lastProgressAt);
          if (!canProgress) {
            const timeUntilNext = getTimeUntilMidnight();
            newTimers[index] = formatCountdown(timeUntilNext);
          }
        }
      });
      setProgressTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [weeklyQuests]);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddWeekly({
        text: newTask.trim(),
        target: parseInt(newTarget),
        current: 0,
        xpPerIncrement: parseInt(newXP),
        lastProgressAt: null
      });
      // Mark suggestion as used
      if (onMarkSuggestionUsed) {
        onMarkSuggestionUsed(newTask.trim());
      }
      setNewTask('');
      setNewTarget('3');
      setNewXP('10');
      setIsAdding(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setNewTask(suggestion);
    setIsAdding(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
        data-testid="weekly-quests-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-xl font-bold text-white">Weekly Quests</h3>
              <div className="flex items-center gap-2 text-purple-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium" data-testid="weekly-streak">
                  {weeklyStreak}-week streak
                </span>
              </div>
              {tutorialCompleted && weeklyQuestCreation && (
                <div className="text-xs text-gray-400 mt-1">
                  {(() => {
                    const today = new Date().toDateString();
                    const lastResetDate = weeklyQuestCreation.lastResetDate 
                      ? new Date(weeklyQuestCreation.lastResetDate).toDateString() 
                      : null;
                    const count = lastResetDate === today ? weeklyQuestCreation.count : 0;
                    return `Created today: ${count}/1`;
                  })()}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowInspiration(true)}
              size="sm"
              variant="ghost"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              title="Need Inspiration?"
            >
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="add-weekly-quest-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Monday Reset Timer */}
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 rounded-lg p-3">
          <Calendar className="w-4 h-4" />
          <span>Weekly quests reset in: <strong>{mondayTimer}</strong> (Monday 00:01 AM)</span>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-white/5 rounded-lg space-y-3"
            data-testid="weekly-quest-form"
          >
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="e.g., Go to gym"
              className="bg-white/5 border-white/20 text-white"
              data-testid="weekly-quest-input"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Times per week</label>
                <Select value={newTarget} onValueChange={setNewTarget}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="weekly-quest-target-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x/week</SelectItem>
                    <SelectItem value="2">2x/week</SelectItem>
                    <SelectItem value="3">3x/week</SelectItem>
                    <SelectItem value="4">4x/week</SelectItem>
                    <SelectItem value="5">5x/week</SelectItem>
                    <SelectItem value="6">6x/week</SelectItem>
                    <SelectItem value="7">7x/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">XP per progress</label>
                <Select value={newXP} onValueChange={setNewXP}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="weekly-quest-xp-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">+5 XP</SelectItem>
                    <SelectItem value="10">+10 XP</SelectItem>
                    <SelectItem value="15">+15 XP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                💡 <span className="font-bold">Tip:</span> Choose XP based on how hard the task is. Be honest with yourself!
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-purple-600 hover:bg-purple-700" data-testid="save-weekly-quest-btn">
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-gray-300" data-testid="cancel-weekly-quest-btn">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {weeklyQuests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No weekly quests yet. Add your first goal!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {weeklyQuests.map((quest, index) => {
              const progress = (quest.current / quest.target) * 100;
              const isComplete = quest.current >= quest.target;
              const canProgress = !quest.lastProgressAt || canCompleteQuest(quest.lastProgressAt);
              const timer = progressTimers[index];
              const questId = quest.id || `weekly-${index}-${quest.text.slice(0, 10)}`;
              const questStreak = questStreaks?.[questId]?.streak || 0;
              const streakDisplay = formatStreakDisplay(questStreak);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                  data-testid={`weekly-quest-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isComplete ? 'text-green-400' : 'text-white'}`}>
                            {quest.text}
                          </span>
                          {questStreak > 0 && (
                            <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                              {streakDisplay}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-purple-400">+{quest.xpPerIncrement || 5} XP per visit</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteIndex(index)}
                      className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      data-testid={`delete-weekly-quest-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-purple-500"
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 w-16 text-right" data-testid={`weekly-quest-progress-${index}`}>
                        {quest.current}/{quest.target}
                      </span>
                      <Button
                        onClick={() => setIncrementIndex(index)}
                        disabled={isComplete || !canProgress}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid={`increment-weekly-quest-${index}`}
                      >
                        +
                      </Button>
                    </div>
                    
                    {!isComplete && !canProgress && timer && (
                      <div className="flex items-center gap-2 text-xs text-orange-400">
                        <Clock className="w-3 h-3" />
                        <span>Next progress available in {timer}</span>
                      </div>
                    )}
                    
                    {isComplete && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        ✅ Completed this week
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={incrementIndex !== null}
        onClose={() => setIncrementIndex(null)}
        onConfirm={() => {
          onIncrementWeekly(incrementIndex);
          setIncrementIndex(null);
        }}
        title="Complete Activity?"
        description="Did you complete this activity? You'll earn XP."
        confirmText="Yes, Complete"
      />

      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          onDeleteWeekly(deleteIndex);
          setDeleteIndex(null);
        }}
        title="Delete Weekly Quest?"
        description="Are you sure you want to delete this weekly quest?"
        confirmText="Delete"
        variant="danger"
      />

      <InspirationModal
        isOpen={showInspiration}
        onClose={() => setShowInspiration(false)}
        questType="weeklyQuest"
        onSelectSuggestion={handleSelectSuggestion}
        usedSuggestions={usedSuggestions || []}
      />
    </>
  );
};

export default WeeklyQuests;
