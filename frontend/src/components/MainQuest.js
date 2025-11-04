import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import ConfirmModal from './ConfirmModal';

const MainQuest = ({ mainQuest, onAddMainQuest, onEditMainQuest, onAbandonMainQuest, onCompleteMainQuest, onToggleObjective }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [objectives, setObjectives] = useState(['', '', '']);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [pendingObjectiveIndex, setPendingObjectiveIndex] = useState(null);

  const handleAdd = () => {
    if (title.trim() && objectives.filter(o => o.trim()).length >= 3) {
      onAddMainQuest({
        title: title.trim(),
        objectives: objectives.filter(o => o.trim()).map(o => ({ text: o.trim(), completed: false }))
      });
      setTitle('');
      setObjectives(['', '', '']);
      setIsAdding(false);
    }
  };

  const handleEdit = () => {
    if (title.trim() && objectives.filter(o => o.trim()).length >= 3) {
      onEditMainQuest({
        title: title.trim(),
        objectives: objectives.filter(o => o.trim()).map((o, i) => ({
          text: o.trim(),
          completed: mainQuest?.objectives[i]?.completed || false
        }))
      });
      setIsEditing(false);
    }
  };

  const startEdit = () => {
    setTitle(mainQuest.title);
    setObjectives(mainQuest.objectives.map(o => o.text));
    setIsEditing(true);
  };

  const handleComplete = () => {
    const allCompleted = mainQuest.objectives.every(o => o.completed);
    if (allCompleted) {
      setShowCompleteModal(true);
    }
  };

  const confirmComplete = () => {
    onCompleteMainQuest();
    setShowCompleteModal(false);
  };

  const completedCount = mainQuest?.objectives.filter(o => o.completed).length || 0;
  const totalCount = mainQuest?.objectives.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!mainQuest && !isAdding) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl text-center"
        data-testid="main-quest-empty"
      >
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Current Main Quest</h3>
        <p className="text-gray-300 mb-6">Set your biggest goal and start your journey!</p>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="add-main-quest-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Main Quest
        </Button>
      </motion.div>
    );
  }

  if (isAdding || isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
        data-testid="main-quest-form"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Main Quest' : 'Add Main Quest'}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Quest Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Launch My Business"
              className="bg-white/5 border-white/20 text-white"
              data-testid="main-quest-title-input"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Objectives (minimum 3)</label>
            {objectives.map((obj, index) => (
              <div key={index} className="mb-2">
                <Input
                  value={obj}
                  onChange={(e) => {
                    const newObjectives = [...objectives];
                    newObjectives[index] = e.target.value;
                    setObjectives(newObjectives);
                  }}
                  placeholder={`Objective ${index + 1}`}
                  className="bg-white/5 border-white/20 text-white"
                  data-testid={`main-quest-objective-input-${index}`}
                />
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={() => setObjectives([...objectives, ''])}
              className="text-blue-400 hover:text-blue-300 mt-2"
              data-testid="add-objective-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Objective
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={isEditing ? handleEdit : handleAdd}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
              data-testid="save-main-quest-btn"
            >
              {isEditing ? 'Save Changes' : 'Create Main Quest'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setIsEditing(false);
                setTitle('');
                setObjectives(['', '', '']);
              }}
              className="text-gray-300 hover:text-white"
              data-testid="cancel-main-quest-btn"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
        data-testid="main-quest-card"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎯</div>
            <div>
              <div className="text-sm text-gray-400">Main Quest</div>
              <h3 className="text-2xl font-bold text-white" data-testid="main-quest-title">{mainQuest.title}</h3>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={startEdit}
              className="text-gray-300 hover:text-white"
              data-testid="edit-main-quest-btn"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAbandonModal(true)}
              className="text-red-400 hover:text-red-300"
              data-testid="abandon-main-quest-btn"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Progress</span>
            <span className="text-gray-300 font-medium" data-testid="main-quest-progress">
              {completedCount} / {totalCount} objectives
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {mainQuest.objectives.map((objective, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              data-testid={`main-quest-objective-${index}`}
            >
              <Checkbox
                checked={objective.completed}
                onCheckedChange={() => {
                  if (!objective.completed) {
                    setPendingObjectiveIndex(index);
                    setShowObjectiveModal(true);
                  } else {
                    onToggleObjective(index);
                  }
                }}
                className="border-white/30"
                data-testid={`main-quest-objective-checkbox-${index}`}
              />
              <span className={`flex-1 ${objective.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                {objective.text}
              </span>
              {objective.completed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </motion.div>
          ))}
        </div>

        {completedCount === totalCount && (
          <Button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            data-testid="complete-main-quest-btn"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Main Quest (+200 XP)
          </Button>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
        onConfirm={() => {
          onAbandonMainQuest();
          setShowAbandonModal(false);
        }}
        title="Abandon Main Quest?"
        description="Are you sure you want to abandon your Main Quest? All progress will be lost."
        confirmText="Abandon Quest"
        variant="danger"
      />

      <ConfirmModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmComplete}
        title="Complete Main Quest?"
        description="Did you complete all objectives for this Main Quest? You'll earn 200 XP!"
        confirmText="Complete Quest"
      />
    </>
  );
};

export default MainQuest;
