import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Coins, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import ConfirmModal from './ConfirmModal';
import { getGlobalMiniGameCooldown, setGlobalMiniGameCooldown } from '../utils/effectsUtils';

const miniGamesData = [
  {
    id: 'dice',
    icon: '🎲',
    name: 'Dice Game',
    reward: 5,
    description: 'Beat choice paralysis by letting a die pick your next move. Add a little fun and randomness so you stop overthinking and start doing.',
    instructions: [
      'Grab a 6-sided die (or use a dice app)',
      'Write down 6 tasks/categories. One MUST be pure leisure. Example:',
      '  1 = Work task',
      '  2 = Laundry',
      '  3 = Study',
      '  4 = Cleaning',
      '  5 = Language practice',
      '  6 = Leisure (YouTube, gaming, phone time)',
      'Roll once: do whatever you rolled',
      'Roll again: multiply the result by 10 → focus that many minutes',
      'Repeat if you want to keep going',
      'Golden Rule: Always include one leisure number. It keeps the game sustainable and reduces pressure.'
    ]
  },
  {
    id: 'focus-hunt',
    icon: '🎯',
    name: 'Focus Hunt',
    reward: 5,
    description: 'Turn one avoided task into a micro-mission. Short, focused effort with zero multitasking to break resistance fast.',
    instructions: [
      'Pick one small task you\'ve been avoiding',
      'Set a short focus timer (10–15 minutes)',
      'Hunt only that task—no switching, no multitasking',
      'When the timer ends and you stayed focused, you\'ve completed the hunt'
    ]
  },
  {
    id: 'race-clock',
    icon: '⏱️',
    name: 'Race the Clock',
    reward: 5,
    description: 'Use Parkinson\'s Law to your advantage: give yourself less time than you think you need and sprint to the finish.',
    instructions: [
      'Choose a clear, measurable task (e.g., clean your room)',
      'Set a timer that\'s slightly tighter than feels comfortable',
      'Start and go full speed until the timer ends',
      'If you finish within the time, you beat the clock'
    ]
  },
  {
    id: 'boss-battle',
    icon: '🐉',
    name: 'Boss Battle',
    reward: 10,
    description: 'Face the one big, uncomfortable task you\'ve been putting off. Commit, focus, and slay the boss.',
    instructions: [
      'Identify your "boss" (the task that stresses you by just existing)',
      'Treat it like a mission: no distractions, full focus',
      'Do the task and finish the fight',
      'Tip: Name your boss for extra commitment—it makes the challenge tangible.'
    ]
  }
];

const MiniGames = ({ isOpen, onClose, onClaimReward }) => {
  const [expandedGame, setExpandedGame] = useState(null);
  const [claimingGame, setClaimingGame] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  // Update cooldowns every second
  useEffect(() => {
    if (!isOpen) return;

    const updateCooldowns = () => {
      const newCooldowns = {};
      miniGamesData.forEach(game => {
        const lastPlayed = localStorage.getItem(`miniGame_${game.id}_lastPlayed`);
        const cooldownInfo = getMiniGameCooldown(lastPlayed, 30); // 30 minute cooldown
        newCooldowns[game.id] = cooldownInfo;
      });
      setCooldowns(newCooldowns);
    };

    updateCooldowns();
    const interval = setInterval(updateCooldowns, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = (gameId, reward) => {
    setClaimingGame({ id: gameId, reward });
  };

  const confirmClaim = () => {
    if (claimingGame) {
      // Save completion timestamp
      const now = new Date().toISOString();
      localStorage.setItem(`miniGame_${claimingGame.id}_lastPlayed`, now);
      
      // Award coins
      onClaimReward(claimingGame.reward);
      
      // Update cooldowns immediately
      const cooldownInfo = getMiniGameCooldown(now, 30);
      setCooldowns(prev => ({ ...prev, [claimingGame.id]: cooldownInfo }));
      
      setClaimingGame(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="mini-games-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-white">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              Mini-Games 🎮
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {miniGamesData.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
                data-testid={`mini-game-${game.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{game.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{game.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Coins className="w-4 h-4" />
                          <span>+{game.reward} Coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{game.description}</p>

                  <Collapsible
                    open={expandedGame === game.id}
                    onOpenChange={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full text-blue-400 hover:text-blue-300 mb-2"
                        data-testid={`show-instructions-${game.id}`}
                      >
                        {expandedGame === game.id ? 'Hide Instructions' : 'Show How to Play'}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-white/5 rounded-lg p-4 mb-3">
                        <h4 className="font-semibold text-white mb-2">How to Play:</h4>
                        <ol className="space-y-2 text-gray-300 text-sm">
                          {game.instructions.map((instruction, index) => (
                            <li key={index} className="flex gap-2">
                              {instruction.startsWith('  ') ? (
                                <span className="pl-6">{instruction.trim()}</span>
                              ) : instruction.match(/^\d+/) ? (
                                <><span className="font-medium text-blue-400">{index + 1}.</span> {instruction}</>
                              ) : (
                                <span>{instruction}</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                      {cooldowns[game.id] && !cooldowns[game.id].isAvailable ? (
                        <div className="w-full">
                          <div className="flex items-center justify-center gap-2 text-orange-400 mb-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Available in: {cooldowns[game.id].formattedTime}</span>
                          </div>
                          <Button
                            disabled
                            className="w-full bg-gray-600 cursor-not-allowed"
                            data-testid={`claim-reward-${game.id}`}
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            On Cooldown
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleClaim(game.id, game.reward)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          data-testid={`claim-reward-${game.id}`}
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Claim {game.reward} Coins
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={claimingGame !== null}
        onClose={() => setClaimingGame(null)}
        onConfirm={confirmClaim}
        title="Claim Mini-Game Reward?"
        description="Did you complete this mini-game as described?"
        confirmText="Yes, Claim Reward"
      />
    </>
  );
};

export default MiniGames;
