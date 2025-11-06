import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Plus, Trash2, Undo2, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ConfirmModal from './ConfirmModal';
import InspirationModal from './InspirationModal';
import { canUndoQuest, getUndoTimeRemaining, formatCountdown } from '../utils/timerUtils';
import { formatStreakDisplay } from '../utils/streakSystem';

const SideQuests = ({ sideQuests, questStreaks, usedSuggestions, onAddSide, onToggleSide, onDeleteSide, onUndoSide, onMarkSuggestionUsed }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('5');
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [completeIndex, setCompleteIndex] = useState(null);
  const [undoIndex, setUndoIndex] = useState(null);
  const [undoTimers, setUndoTimers] = useState({});
  const [showInspiration, setShowInspiration] = useState(false);

  // Update undo timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      sideQuests.forEach((quest, index) => {
        if (quest.completed && quest.completedAt && canUndoQuest(quest.completedAt)) {
          const remaining = getUndoTimeRemaining(quest.completedAt);
          newTimers[index] = formatCountdown(remaining);
        }
      });
      setUndoTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [sideQuests]);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddSide({
        text: newTask.trim(),
        xp: parseInt(newXP),
        completed: false,
        completedAt: null
      });
      // Mark suggestion as used
      if (onMarkSuggestionUsed) {
        onMarkSuggestionUsed(newTask.trim());
      }
      setNewTask('');
      setNewXP('5');
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
        data-testid="side-quests-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Side Quests</h3>
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
              className="bg-green-600 hover:bg-green-700"
              data-testid="add-side-quest-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-white/5 rounded-lg space-y-3"
            data-testid="side-quest-form"
          >
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="e.g., Buy groceries"
              className="bg-white/5 border-white/20 text-white"
              data-testid="side-quest-input"
            />
            <div className="space-y-2">
              <Select value={newXP} onValueChange={setNewXP}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white w-32" data-testid="side-quest-xp-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">+5 XP</SelectItem>
                  <SelectItem value="10">+10 XP</SelectItem>
                  <SelectItem value="15">+15 XP</SelectItem>
                </SelectContent>
              </Select>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  💡 <span className="font-bold">Tip:</span> Choose XP based on how hard the task is. Be honest with yourself!
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-green-600 hover:bg-green-700" data-testid="save-side-quest-btn">
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-gray-300" data-testid="cancel-side-quest-btn">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {sideQuests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-lg text-gray-300 mb-2">No side quests yet</p>
            <p className="text-sm text-gray-500">Add optional one-time challenges for extra rewards!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sideQuests.map((quest, index) => {
                const undoTimer = undoTimers[index];
                const showUndo = quest.completed && undoTimer;
                const questId = quest.id || `side-${index}-${quest.text.slice(0, 10)}`;
                const questStreak = questStreaks?.[questId]?.streak || 0;
                const streakDisplay = formatStreakDisplay(questStreak);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                    data-testid={`side-quest-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={quest.completed}
                        onCheckedChange={() => setCompleteIndex(index)}
                        disabled={quest.completed}
                        className="border-white/30 mt-1"
                        data-testid={`side-quest-checkbox-${index}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${quest.completed ? 'text-green-400' : 'text-white'}`}>
                              {quest.text}
                            </span>
                            {questStreak > 0 && (
                              <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                                {streakDisplay}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-green-400 font-medium">+{quest.xp} XP</span>
                        </div>
                        
                        {showUndo && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUndoIndex(index)}
                              className="text-orange-400 hover:text-orange-300 h-6 text-xs p-0"
                              data-testid={`undo-side-quest-${index}`}
                            >
                              <Undo2 className="w-3 h-3 mr-1" />
                              Undo ({undoTimer})
                            </Button>
                          </div>
                        )}
                        
                        {quest.completed && !showUndo && (
                          <div className="mt-1 text-xs text-green-400">
                            ✅ Completed (auto-removing soon...)
                          </div>
                        )}
                      </div>
                      
                      {!quest.completed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteIndex(index)}
                          className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`delete-side-quest-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={completeIndex !== null}
        onClose={() => setCompleteIndex(null)}
        onConfirm={() => {
          onToggleSide(completeIndex);
          setCompleteIndex(null);
        }}
        title="Complete Side Quest?"
        description="Did you complete this task? You'll earn XP."
        confirmText="Yes, Complete"
      />

      <ConfirmModal
        isOpen={undoIndex !== null}
        onClose={() => setUndoIndex(null)}
        onConfirm={() => {
          onUndoSide(undoIndex);
          setUndoIndex(null);
        }}
        title="⚠️ Undo Side Quest?"
        description="Are you sure you want to undo this Side Quest? This will refund the given XP."
        confirmText="Yes, Undo"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          onDeleteSide(deleteIndex);
          setDeleteIndex(null);
        }}
        title="Delete Side Quest?"
        description="Are you sure you want to delete this side quest?"
        confirmText="Delete"
        variant="danger"
      />

      <InspirationModal
        isOpen={showInspiration}
        onClose={() => setShowInspiration(false)}
        questType="sideQuest"
        onSelectSuggestion={handleSelectSuggestion}
        usedSuggestions={usedSuggestions || []}
      />
    </>
  );
};

export default SideQuests;
