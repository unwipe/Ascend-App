import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ConfirmModal from './ConfirmModal';

const DailyQuests = ({ dailyQuests, dailyStreak, onAddDaily, onToggleDaily, onDeleteDaily }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('5');
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [completeIndex, setCompleteIndex] = useState(null);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddDaily({
        text: newTask.trim(),
        xp: parseInt(newXP),
        completed: false
      });
      setNewTask('');
      setNewXP('5');
      setIsAdding(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
        data-testid="daily-quests-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <h3 className="text-xl font-bold text-white">Daily Quests</h3>
              <div className="flex items-center gap-2 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium" data-testid="daily-streak">
                  {dailyStreak}-day streak
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
            data-testid="add-daily-quest-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-white/5 rounded-lg space-y-3"
            data-testid="daily-quest-form"
          >
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="e.g., Meditate 10 min"
              className="bg-white/5 border-white/20 text-white"
              data-testid="daily-quest-input"
            />
            <div className="flex gap-2">
              <Select value={newXP} onValueChange={setNewXP}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white w-32" data-testid="daily-quest-xp-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">+5 XP</SelectItem>
                  <SelectItem value="10">+10 XP</SelectItem>
                  <SelectItem value="15">+15 XP</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} className="flex-1 bg-orange-600 hover:bg-orange-700" data-testid="save-daily-quest-btn">
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-gray-300" data-testid="cancel-daily-quest-btn">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {dailyQuests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No daily quests yet. Add your first habit!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dailyQuests.map((quest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                data-testid={`daily-quest-${index}`}
              >
                <Checkbox
                  checked={quest.completed}
                  onCheckedChange={() => setCompleteIndex(index)}
                  className="border-white/30"
                  data-testid={`daily-quest-checkbox-${index}`}
                />
                <span className={`flex-1 ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {quest.text}
                </span>
                <span className="text-sm text-blue-400 font-medium">+{quest.xp} XP</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteIndex(index)}
                  className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`delete-daily-quest-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={completeIndex !== null}
        onClose={() => setCompleteIndex(null)}
        onConfirm={() => {
          onToggleDaily(completeIndex);
          setCompleteIndex(null);
        }}
        title="Complete Daily Quest?"
        description="Did you complete this task as needed?"
        confirmText="Yes, Complete"
      />

      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          onDeleteDaily(deleteIndex);
          setDeleteIndex(null);
        }}
        title="Delete Daily Quest?"
        description="Are you sure you want to delete this daily quest?"
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default DailyQuests;
