import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { dailyQuestTemplates, questCategories } from '../utils/questTemplates';

const QuestTemplateSelector = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('health');

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="template-selector">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-white">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Quest Templates
          </DialogTitle>
          <p className="text-gray-400 text-sm">Choose a template to quickly add a quest</p>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {questCategories.map(category => {
            const hasTemplates = dailyQuestTemplates[category.id];
            if (!hasTemplates) return null;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                style={{
                  borderColor: selectedCategory === category.id ? category.color : 'transparent',
                  borderWidth: '2px'
                }}
                data-testid={`category-${category.id}`}
              >
                <span>{category.emoji}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {dailyQuestTemplates[selectedCategory]?.map((template, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectTemplate(template)}
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-all border border-white/10 hover:border-blue-500/50"
              data-testid={`template-${index}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{template.text}</span>
                <span className="text-sm font-bold text-blue-400">+{template.xp} XP</span>
              </div>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestTemplateSelector;
