import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

const WelcomeModal = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [mainQuestTitle, setMainQuestTitle] = useState('');
  const [objectives, setObjectives] = useState(['', '', '']);

  const handleComplete = () => {
    if (mainQuestTitle.trim() && objectives.filter(o => o.trim()).length >= 3) {
      onComplete({
        title: mainQuestTitle.trim(),
        objectives: objectives.filter(o => o.trim()).map(o => ({ text: o.trim(), completed: false }))
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-lg border border-white/20" data-testid="welcome-modal">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-8xl mb-6"
            >
              🌌
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              Welcome to Ascend
              <Sparkles className="w-10 h-10 text-yellow-400" />
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
              Transform your real-life tasks and goals into an RPG-style progression system.
              Level up in your own life by completing quests and achieving your dreams!
            </p>
            <Button
              onClick={() => setStep(1)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              data-testid="welcome-start-btn"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="py-6"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-white mb-2">Set Your First Main Quest</h2>
              <p className="text-gray-300">
                What's the ONE big goal you're currently working toward?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Your Main Quest</label>
                <Input
                  value={mainQuestTitle}
                  onChange={(e) => setMainQuestTitle(e.target.value)}
                  placeholder="e.g., Launch My Business, Get Fit, Learn Spanish"
                  className="bg-white/10 border-white/20 text-white text-lg"
                  data-testid="welcome-main-quest-input"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Add at least 3 objectives/milestones
                </label>
                {objectives.map((obj, index) => (
                  <Input
                    key={index}
                    value={obj}
                    onChange={(e) => {
                      const newObjectives = [...objectives];
                      newObjectives[index] = e.target.value;
                      setObjectives(newObjectives);
                    }}
                    placeholder={`Objective ${index + 1}`}
                    className="bg-white/10 border-white/20 text-white mb-2"
                    data-testid={`welcome-objective-input-${index}`}
                  />
                ))}
                <Button
                  variant="ghost"
                  onClick={() => setObjectives([...objectives, ''])}
                  className="text-blue-400 hover:text-blue-300 w-full"
                  data-testid="welcome-add-objective-btn"
                >
                  + Add Another Objective
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(0)}
                  className="flex-1 text-gray-300"
                  data-testid="welcome-back-btn"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!mainQuestTitle.trim() || objectives.filter(o => o.trim()).length < 3}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="welcome-complete-btn"
                >
                  Start Adventure! 🚀
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
