import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ConfirmModal from './ConfirmModal';

const SideQuests = ({ sideQuests, onAddSide, onToggleSide, onDeleteSide }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newXP, setNewXP] = useState('5');
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [completeIndex, setCompleteIndex] = useState(null);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddSide({
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
        data-testid="side-quests-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Side Quests</h3>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            data-testid="add-side-quest-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
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
            <div className="flex gap-2">
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
          <div className="text-center py-8 text-gray-400">
            <p>No side quests. Add a one-time task!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sideQuests.map((quest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                data-testid={`side-quest-${index}`}
              >
                <Checkbox
                  checked={quest.completed}
                  onCheckedChange={() => setCompleteIndex(index)}
                  className="border-white/30"
                  data-testid={`side-quest-checkbox-${index}`}
                />
                <span className={`flex-1 ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {quest.text}
                </span>
                <span className="text-sm text-green-400 font-medium">+{quest.xp} XP</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteIndex(index)}
                  className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`delete-side-quest-${index}`}
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
          onToggleSide(completeIndex);
          setCompleteIndex(null);
        }}
        title="Complete Side Quest?"
        description="Did you complete this task?"
        confirmText="Yes, Complete"
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
    </>
  );
};

export default SideQuests;
