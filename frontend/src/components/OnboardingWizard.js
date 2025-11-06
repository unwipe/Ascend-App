import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Sparkles, Plus, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FREE_AVATARS } from '../utils/avatars';
import InspirationModal from './InspirationModal';

const OnboardingWizard = ({ isOpen, onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('😊');
  const [mainQuest, setMainQuest] = useState('');
  const [objectives, setObjectives] = useState(['', '', '']);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [currentDailyHabit, setCurrentDailyHabit] = useState('');
  const [currentDailyXP, setCurrentDailyXP] = useState('10');
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [currentWeeklyGoal, setCurrentWeeklyGoal] = useState('');
  const [currentWeeklyTarget, setCurrentWeeklyTarget] = useState('3');
  const [currentWeeklyXP, setCurrentWeeklyXP] = useState('10');
  const [showInspiration, setShowInspiration] = useState(false);
  const [inspirationQuestType, setInspirationQuestType] = useState('daily');

  const totalSteps = 11;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete({
      username: username || 'Ascendant',
      avatar,
      mainQuest: mainQuest ? {
        title: mainQuest,
        objectives: objectives.filter(o => o.trim()).map(o => ({ text: o, completed: false }))
      } : null,
      dailyQuests: dailyQuests,
      weeklyQuests: weeklyQuests
    });
  };

  const canProceed = () => {
    switch (step) {
      case 2: return username.trim() !== '';
      case 3: return mainQuest.trim() !== '';
      case 4: return dailyQuests.length > 0; // At least one daily quest added
      case 5: return weeklyQuests.length > 0; // At least one weekly quest added
      default: return true;
    }
  };

  // Add daily quest to the list
  const handleAddDailyQuest = () => {
    if (currentDailyHabit.trim()) {
      setDailyQuests([...dailyQuests, {
        text: currentDailyHabit,
        xp: parseInt(currentDailyXP),
        completed: false,
        completedAt: null
      }]);
      setCurrentDailyHabit('');
      setCurrentDailyXP('10');
    }
  };

  // Remove daily quest from the list
  const handleRemoveDailyQuest = (index) => {
    setDailyQuests(dailyQuests.filter((_, i) => i !== index));
  };

  // Add weekly quest to the list
  const handleAddWeeklyQuest = () => {
    if (currentWeeklyGoal.trim()) {
      setWeeklyQuests([...weeklyQuests, {
        text: currentWeeklyGoal,
        target: parseInt(currentWeeklyTarget),
        current: 0,
        xpPerIncrement: parseInt(currentWeeklyXP),
        lastProgressAt: null
      }]);
      setCurrentWeeklyGoal('');
      setCurrentWeeklyTarget('3');
      setCurrentWeeklyXP('10');
    }
  };

  // Remove weekly quest from the list
  const handleRemoveWeeklyQuest = (index) => {
    setWeeklyQuests(weeklyQuests.filter((_, i) => i !== index));
  };

  // Handle inspiration suggestion
  const handleSelectSuggestion = (suggestion) => {
    if (inspirationQuestType === 'dailyQuest') {
      setCurrentDailyHabit(suggestion);
    } else if (inspirationQuestType === 'weeklyQuest') {
      setCurrentWeeklyGoal(suggestion);
    } else if (inspirationQuestType === 'mainQuest') {
      setMainQuest(suggestion);
    }
    setShowInspiration(false);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-lg border border-white/20 overflow-hidden flex flex-col" data-testid="onboarding-wizard">
        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-sm z-50"
          data-testid="skip-tutorial-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-6 flex-shrink-0">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all ${
                i <= step ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🧙
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Hey Ascendant... <Sparkles className="inline w-8 h-8 text-yellow-400" />
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                You're about to embark on an epic journey where you level up in REAL LIFE by completing quests and achieving your goals.
              </p>
            </motion.div>
          )}

          {/* Step 1: Set Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧙</div>
                <h2 className="text-3xl font-bold text-white mb-2">Set Your Identity</h2>
                <p className="text-gray-300">First, let's create your identity.</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Choose your username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="username-input"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Select your avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {FREE_AVATARS.map((avatarOption) => (
                      <button
                        key={avatarOption.id}
                        onClick={() => setAvatar(avatarOption.emoji)}
                        className={`text-4xl p-3 rounded-lg transition-all ${
                          avatar === avatarOption.emoji
                            ? 'bg-blue-600 scale-110'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        data-testid={`avatar-${avatarOption.id}`}
                      >
                        {avatarOption.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-blue-300 mt-3 bg-blue-500/10 rounded-lg p-2">
                    💡 Unlock special character avatars in the Reward Store!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Explain Stats Card */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧙</div>
                <h2 className="text-3xl font-bold text-white mb-4">Your Stats Card</h2>
              </div>

              {/* Mock Stats Card */}
              <div className="bg-white/10 backdrop-blur-lg border border-yellow-400/50 rounded-2xl p-6 max-w-md mx-auto mb-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🌱</div>
                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className="text-3xl font-bold text-white">1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
                    <span className="text-xl">🪙</span>
                    <span className="text-xl font-bold text-yellow-400">0</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>XP Progress</span>
                    <span>0 / 500 XP</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-blue-500" />
                  </div>
                </div>
              </div>

              <div className="text-center max-w-xl mx-auto">
                <p className="text-gray-300 mb-4">
                  This is your <span className="text-blue-400 font-bold">Stats Card</span>. It shows your Level, XP (experience points), and Coins.
                </p>
                <p className="text-gray-300 mb-4">
                  Every time you complete a quest, you earn XP. Earn enough XP, and you'll level up! 🚀
                </p>
                <p className="text-gray-300">
                  Coins are earned from mini-games and can be spent in the Reward Store.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Set Main Quest */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-white mb-2">Set Your Main Quest</h2>
                <p className="text-gray-300">Your biggest goal right now - your "boss battle"</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <div className="flex gap-2">
                    <Input
                      value={mainQuest}
                      onChange={(e) => setMainQuest(e.target.value)}
                      placeholder="Get Healthy / Learn Spanish / Read More Books"
                      className="bg-white/10 border-white/20 text-white flex-1"
                      data-testid="main-quest-input"
                    />
                    <button
                      onClick={() => {
                        setInspirationQuestType('mainQuest');
                        setShowInspiration(true);
                      }}
                      className="py-2 px-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-lg transition-all flex items-center justify-center"
                      title="Need Inspiration?"
                    >
                      <Lightbulb className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Add 3 objectives to break it down:
                  </label>
                  {objectives.map((obj, i) => (
                    <Input
                      key={i}
                      value={obj}
                      onChange={(e) => {
                        const newObjs = [...objectives];
                        newObjs[i] = e.target.value;
                        setObjectives(newObjs);
                      }}
                      placeholder={i === 0 ? 'Exercise 3x per week' : i === 1 ? 'Eat healthy for 30 days' : 'Lose 5 pounds'}
                      className="bg-white/10 border-white/20 text-white mb-2"
                      data-testid={`objective-input-${i}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-400 text-center">
                  Completing an objective gives you <span className="text-green-400 font-bold">+25 XP</span>. Completing the entire Main Quest gives you <span className="text-green-400 font-bold">+200 XP</span>! 🏆
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Add Daily Habit */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔥</div>
                <h2 className="text-3xl font-bold text-white mb-2">Add Daily Habits</h2>
                <p className="text-gray-300">Add all your daily habits now</p>
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 max-w-lg mx-auto">
                  <p className="text-sm text-yellow-300">
                    ⚠️ <span className="font-bold">Add ALL your daily habits now!</span> After the tutorial, you can only create 2 new daily quests per day.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                {/* Added Daily Quests List */}
                {dailyQuests.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-2">Your Daily Quests ({dailyQuests.length}):</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {dailyQuests.map((quest, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 rounded p-2">
                          <span className="text-white text-sm">{quest.text} (+{quest.xp} XP)</span>
                          <button
                            onClick={() => handleRemoveDailyQuest(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Daily Quest Form */}
                <Input
                  value={currentDailyHabit}
                  onChange={(e) => setCurrentDailyHabit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDailyQuest()}
                  placeholder="Meditate 10 min / Read 20 pages / Exercise 30 min"
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="daily-habit-input"
                />

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Choose XP value (based on difficulty):
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['10', '15', '20'].map((xp) => (
                      <button
                        key={xp}
                        onClick={() => setCurrentDailyXP(xp)}
                        className={`py-3 rounded-lg font-bold transition-all ${
                          currentDailyXP === xp
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                        data-testid={`xp-${xp}`}
                      >
                        {xp} XP
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Quest Button with Inspiration */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddDailyQuest}
                    disabled={!currentDailyHabit.trim()}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Daily Quest
                  </button>
                  <button
                    onClick={() => {
                      setInspirationQuestType('dailyQuest');
                      setShowInspiration(true);
                    }}
                    className="py-3 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    title="Need Inspiration?"
                  >
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    💡 <span className="font-bold">Tip:</span> Choose XP based on how hard the task is. Be honest with yourself!
                  </p>
                </div>

                <p className="text-sm text-gray-400 text-center">
                  Complete at least 1 daily every day to maintain your streak! 🔥
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Add Weekly Quest */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-3xl font-bold text-white mb-2">Set Up Weekly Quests</h2>
                <p className="text-gray-300">Add all your weekly goals now</p>
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 max-w-lg mx-auto">
                  <p className="text-sm text-yellow-300">
                    ⚠️ <span className="font-bold">Add ALL your weekly goals now!</span> After the tutorial, you can only create 1 new weekly quest per day.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                {/* Added Weekly Quests List */}
                {weeklyQuests.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-white mb-2">Your Weekly Quests ({weeklyQuests.length}):</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {weeklyQuests.map((quest, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 rounded p-2">
                          <span className="text-white text-sm">{quest.text} ({quest.target}x/week, +{quest.xpPerIncrement} XP)</span>
                          <button
                            onClick={() => handleRemoveWeeklyQuest(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Weekly Quest Form */}
                <Input
                  value={currentWeeklyGoal}
                  onChange={(e) => setCurrentWeeklyGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWeeklyQuest()}
                  placeholder="Go to gym / Clean Apartment / Study coding"
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="weekly-goal-input"
                />

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    How many times per week?
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7'].map((target) => (
                      <button
                        key={target}
                        onClick={() => setCurrentWeeklyTarget(target)}
                        className={`py-3 rounded-lg font-bold transition-all ${
                          currentWeeklyTarget === target
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                        data-testid={`target-${target}`}
                      >
                        {target}x
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Choose XP per completion:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['5', '10', '15'].map((xp) => (
                      <button
                        key={xp}
                        onClick={() => setCurrentWeeklyXP(xp)}
                        className={`py-3 rounded-lg font-bold transition-all ${
                          currentWeeklyXP === xp
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                        data-testid={`weekly-xp-${xp}`}
                      >
                        {xp} XP
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Quest Button with Inspiration */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddWeeklyQuest}
                    disabled={!currentWeeklyGoal.trim()}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Weekly Quest
                  </button>
                  <button
                    onClick={() => {
                      setInspirationQuestType('weeklyQuest');
                      setShowInspiration(true);
                    }}
                    className="py-3 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    title="Need Inspiration?"
                  >
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    💡 <span className="font-bold">Tip:</span> Choose XP based on how hard the task is. Be honest with yourself!
                  </p>
                </div>

                <p className="text-sm text-gray-400 text-center">
                  Example: "Go to gym 3x/week" at 10 XP = 30 XP total per week
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 6: Other Quest Types */}
          {step === 6 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧙</div>
                <h2 className="text-3xl font-bold text-white mb-4">Other Quest Types</h2>
              </div>

              <div className="space-y-4 max-w-xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⚡</span>
                    <h3 className="text-xl font-bold text-white">Weekly Quests</h3>
                  </div>
                  <p className="text-gray-300">
                    Goals you want to hit multiple times per week (e.g., "Gym 3x/week")
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">📋</span>
                    <h3 className="text-xl font-bold text-white">Side Quests</h3>
                  </div>
                  <p className="text-gray-300">
                    One-time tasks that don't repeat (e.g., "Buy groceries", "Call dentist")
                  </p>
                </div>

                <p className="text-center text-gray-400 text-sm">
                  You can add these anytime from your dashboard!
                </p>
              </div>
            </motion.div>
          )}

          {/* Steps 7-10: Quick Info Screens */}
          {step >= 7 && step <= 10 && (
            <motion.div
              key={`step${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6 text-center"
            >
              <div className="text-6xl mb-4">
                {step === 7 ? '🎮' : step === 8 ? '🏪' : step === 9 ? '👤' : '🧙'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {step === 7 ? 'Mini-Games' : step === 8 ? 'Reward Store' : step === 9 ? 'Profile & Achievements' : 'Ready to Ascend!'}
              </h2>
              <div className="max-w-xl mx-auto text-gray-300">
                {step === 7 && (
                  <>
                    <p className="mb-4">Need a productivity boost? Try our Mini-Games! 🎮</p>
                    <p className="mb-4">Complete mini-games to earn coins. Each game has a 1-hour cooldown.</p>
                    <div className="flex justify-center gap-4 text-4xl mb-4">
                      <span>🎲</span>
                      <span>🎯</span>
                      <span>⏱️</span>
                      <span>🐉</span>
                    </div>
                  </>
                )}
                {step === 8 && (
                  <>
                    <p className="mb-4">Spend your coins in the Reward Store!</p>
                    <p>Buy power-ups like XP Multipliers, Streak Freeze, and cosmetics.</p>
                  </>
                )}
                {step === 9 && (
                  <>
                    <p className="mb-4">Track your progress in your Profile!</p>
                    <p>View your Achievements, Inventory, Stats, and Main Quest History.</p>
                  </>
                )}
                {step === 10 && (
                  <>
                    <p className="text-xl mb-4">You're all set, Ascendant! 🌟</p>
                    <p className="mb-4">Remember: Every quest you complete brings you closer to your goals.</p>
                    <p className="text-lg font-bold text-blue-400">Now go out there and level up your life!</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Navigation Buttons - Fixed at Bottom */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="text-gray-300"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="continue-btn"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="start-journey-btn"
            >
              Start My Journey! 🚀
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Inspiration Modal */}
    <InspirationModal
      isOpen={showInspiration}
      onClose={() => setShowInspiration(false)}
      questType={inspirationQuestType}
      onSelectSuggestion={handleSelectSuggestion}
      usedSuggestions={[]}
    />
    </>
  );
};

export default OnboardingWizard;
