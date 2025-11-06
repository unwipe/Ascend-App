import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Lightbulb, Shuffle, Check, X } from 'lucide-react';
import { 
  getSuggestionsForType, 
  getRandomSuggestion, 
  getQuestTypeTitle,
  QUEST_DEFINITIONS 
} from '../utils/questInspiration';

const InspirationModal = ({ isOpen, onClose, questType, onSelectSuggestion, usedSuggestions = [] }) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  const suggestions = getSuggestionsForType(questType);
  const title = getQuestTypeTitle(questType);
  const definition = QUEST_DEFINITIONS[questType];

  const handleRandomSuggestion = () => {
    const random = getRandomSuggestion(questType);
    setSelectedSuggestion(random);
    onSelectSuggestion(random);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    onSelectSuggestion(suggestion);
  };

  const isSuggestionUsed = (suggestion) => {
    return usedSuggestions.includes(suggestion.toLowerCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-lg border border-purple-500/30 overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Definition Section */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <p className="text-gray-200 text-sm leading-relaxed">
              <span className="font-bold text-blue-300">What is this?</span> {definition}
            </p>
          </div>

          {/* Random Suggestion Button */}
          <Button
            onClick={handleRandomSuggestion}
            className="w-full mb-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            🎲 Random Suggestion
          </Button>

          {/* Suggestions Section */}
          <div className="space-y-4">
            {Object.entries(suggestions).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-white mb-2">{category}</h3>
                <div className="space-y-2">
                  {items.map((suggestion, index) => {
                    const isUsed = isSuggestionUsed(suggestion);
                    const isSelected = selectedSuggestion === suggestion;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                          isSelected
                            ? 'bg-green-500/30 border-green-500/50 text-white'
                            : isUsed
                            ? 'bg-white/5 border-white/10 text-gray-400 opacity-60'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex-1">{suggestion}</span>
                          {isUsed && (
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-white/10 flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspirationModal;
