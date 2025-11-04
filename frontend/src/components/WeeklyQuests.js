import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ConfirmModal from './ConfirmModal';

const WeeklyQuests = ({ weeklyQuests, weeklyStreak, onAddWeekly, onIncrementWeekly, onDeleteWeekly }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTarget, setNewTarget] = useState('3');
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [incrementIndex, setIncrementIndex] = useState(null);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddWeekly({
        text: newTask.trim(),
        target: parseInt(newTarget),
        current: 0,
        xpPerIncrement: 5
      });
      setNewTask('');
      setNewTarget('3');
      setIsAdding(false);
    }
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
            </div>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="add-weekly-quest-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
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
            <div className="flex gap-2">
              <Select value={newTarget} onValueChange={setNewTarget}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white w-32" data-testid="weekly-quest-target-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x/week</SelectItem>
                  <SelectItem value="3">3x/week</SelectItem>
                  <SelectItem value="4">4x/week</SelectItem>
                  <SelectItem value="5">5x/week</SelectItem>
                  <SelectItem value="7">7x/week</SelectItem>
                </SelectContent>
              </Select>
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
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                  data-testid={`weekly-quest-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isComplete ? 'text-green-400' : 'text-white'}`}>
                      {quest.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteIndex(index)}
                      className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-weekly-quest-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
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
                      disabled={isComplete}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      data-testid={`increment-weekly-quest-${index}`}
                    >
                      +
                    </Button>
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
        description="Did you complete this activity?"
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
    </>
  );
};

export default WeeklyQuests;
