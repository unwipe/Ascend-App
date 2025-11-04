import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Settings as SettingsIcon, User, ShoppingBag } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import StatsCard from './components/StatsCard';
import MainQuest from './components/MainQuest';
import DailyQuests from './components/DailyQuests';
import WeeklyQuests from './components/WeeklyQuests';
import SideQuests from './components/SideQuests';
import MiniGames from './components/MiniGames';
import LevelUpModal from './components/LevelUpModal';
import SettingsModal from './components/SettingsModal';
import OnboardingWizard from './components/OnboardingWizard';
import ProfileModal from './components/ProfileModal';
import RewardStore from './components/RewardStore';
import MotivationalQuote from './components/MotivationalQuote';
import XPGainAnimation from './components/XPGainAnimation';
import StreakBrokenModal from './components/StreakBrokenModal';
import DailyCheckIn from './components/DailyCheckIn';
import { loadGameData, saveGameData, getInitialGameState } from './utils/localStorage';
import { checkLevelUp, checkStreakStatus, getWeekStart } from './utils/gameLogic';
import { checkAchievements } from './utils/achievements';
import { soundManager } from './utils/soundEffects';
import '@/App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [xpAnimation, setXpAnimation] = useState({ visible: false, amount: 0 });
  const [streakBroken, setStreakBroken] = useState(null);

  // Initialize game state
  useEffect(() => {
    const savedData = loadGameData();
    if (savedData) {
      // Check if tutorial completed
      if (!savedData.tutorialCompleted) {
        setShowOnboarding(true);
      }

      const streakStatus = checkStreakStatus(savedData.lastLoginDate);
      let updatedState = { ...savedData, lastLoginDate: new Date().toISOString() };
      
      // Handle daily reset
      if (streakStatus.isNewDay) {
        updatedState.dailyQuests = updatedState.dailyQuests.map(q => ({ ...q, completed: false }));
        
        if (streakStatus.shouldResetDaily) {
          setStreakBroken('daily');
          updatedState.dailyStreak = 0;
        }
      }
      
      // Handle weekly reset
      const lastWeekStart = getWeekStart(new Date(savedData.lastLoginDate));
      const currentWeekStart = getWeekStart(new Date());
      
      if (lastWeekStart.getTime() !== currentWeekStart.getTime()) {
        const allCompleted = updatedState.weeklyQuests.every(q => q.current >= q.target);
        
        if (!allCompleted && updatedState.weeklyQuests.length > 0) {
          setStreakBroken('weekly');
          updatedState.weeklyStreak = 0;
        }
        
        updatedState.weeklyQuests = updatedState.weeklyQuests.map(q => ({ ...q, current: 0 }));
      }
      
      // Update longest streaks
      if (updatedState.dailyStreak > updatedState.longestDailyStreak) {
        updatedState.longestDailyStreak = updatedState.dailyStreak;
      }
      if (updatedState.weeklyStreak > updatedState.longestWeeklyStreak) {
        updatedState.longestWeeklyStreak = updatedState.weeklyStreak;
      }
      
      setGameState(updatedState);
      saveGameData(updatedState);
    } else {
      const initialState = getInitialGameState();
      setGameState(initialState);
      setShowOnboarding(true);
    }
  }, []);

  // Auto-save whenever game state changes
  useEffect(() => {
    if (gameState && gameState.tutorialCompleted) {
      saveGameData(gameState);
      
      // Check for new achievements
      const newAchievements = checkAchievements(gameState, gameState.unlockedAchievements);
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast.success(`Achievement Unlocked! ${achievement.icon}`, {
            description: achievement.title
          });
        });
        
        setGameState(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, ...newAchievements.map(a => a.id)]
        }));
      }
    }
  }, [gameState]);

  // Add XP with animation, sound, and level up check
  const addXP = (amount) => {
    // Apply multiplier if active
    const multiplier = gameState.activeMultiplier ? 2 : 1;
    const finalAmount = amount * multiplier;
    
    setXpAnimation({ visible: true, amount: finalAmount });
    soundManager.play('xpGain');
    
    setGameState(prev => {
      const newXP = prev.xp + finalAmount;
      const newTotalXP = prev.totalXPEarned + finalAmount;
      const levelCheck = checkLevelUp(newXP, prev.level);
      
      if (levelCheck.shouldLevelUp) {
        soundManager.play('levelUp');
        setLevelUpData({ oldLevel: prev.level, newLevel: levelCheck.newLevel });
        return {
          ...prev,
          xp: levelCheck.remainingXP,
          level: levelCheck.newLevel,
          totalXPEarned: newTotalXP
        };
      }
      
      return { ...prev, xp: newXP, totalXPEarned: newTotalXP };
    });
  };

  // Add Coins with sound
  const addCoins = (amount) => {
    soundManager.play('coinCollect');
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount
    }));
    toast.success(`+${amount} Coins earned! 🪙`);
  };

  // Onboarding completion
  const handleOnboardingComplete = (data) => {
    const updatedState = {
      ...gameState,
      username: data.username,
      avatar: data.avatar,
      tutorialCompleted: true,
      isFirstTime: false
    };

    if (data.mainQuest) {
      updatedState.mainQuest = data.mainQuest;
    }

    if (data.firstDaily) {
      updatedState.dailyQuests = [data.firstDaily];
    }

    if (data.firstWeekly) {
      updatedState.weeklyQuests = [data.firstWeekly];
    }

    setGameState(updatedState);
    setShowOnboarding(false);
    saveGameData(updatedState);
    toast.success('Welcome to Ascend! 🌟', {
      description: 'Your journey begins now!'
    });
  };

  const handleSkipOnboarding = () => {
    setGameState(prev => ({
      ...prev,
      tutorialCompleted: true,
      isFirstTime: false
    }));
    setShowOnboarding(false);
  };

  // Profile updates
  const handleUpdateProfile = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
    toast.success('Profile updated!');
  };

  // Store purchase
  const handlePurchase = (item) => {
    if (gameState.coins < item.price) {
      toast.error('Not enough coins!');
      return;
    }

    const newItem = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      description: item.description,
      canUse: true
    };

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      totalCoinsSpent: prev.totalCoinsSpent + item.price,
      totalPurchases: prev.totalPurchases + 1,
      inventory: [...prev.inventory, newItem]
    }));

    toast.success(`${item.name} added to inventory! ✨`, {
      description: 'Check your profile to use it.'
    });
  };

  // Main Quest handlers
  const handleAddMainQuest = (quest) => {
    setGameState(prev => ({ ...prev, mainQuest: quest }));
    toast.success('Main Quest Set! 🎯');
  };

  const handleEditMainQuest = (quest) => {
    setGameState(prev => ({ ...prev, mainQuest: quest }));
    toast.success('Main Quest Updated! ✏️');
  };

  const handleAbandonMainQuest = () => {
    setGameState(prev => ({ ...prev, mainQuest: null }));
    toast.info('Main Quest Abandoned');
  };

  const handleCompleteMainQuest = () => {
    const completedQuest = { ...gameState.mainQuest, completedAt: new Date().toISOString() };
    
    // Set 7-day cooldown (7 days from now)
    const cooldownEnd = new Date();
    cooldownEnd.setDate(cooldownEnd.getDate() + 7);
    
    setGameState(prev => ({
      ...prev,
      mainQuest: null,
      mainQuestCooldown: cooldownEnd.toISOString(),
      mainQuestHistory: [...(prev.mainQuestHistory || []), completedQuest],
      mainQuestsCompleted: prev.mainQuestsCompleted + 1,
      totalQuestsCompleted: prev.totalQuestsCompleted + 1
    }));
    
    addXP(200);
    toast.success('Main Quest Completed! 🎉', { description: '+200 XP earned!' });
  };

  const handleToggleObjective = (index) => {
    const wasCompleted = gameState.mainQuest.objectives[index].completed;
    
    setGameState(prev => ({
      ...prev,
      mainQuest: {
        ...prev.mainQuest,
        objectives: prev.mainQuest.objectives.map((obj, i) =>
          i === index ? { ...obj, completed: !obj.completed } : obj
        )
      }
    }));
    
    if (!wasCompleted) {
      addXP(25);
      toast.success('Objective Completed! ✅', { description: '+25 XP earned!' });
    } else {
      // Refund XP when unchecking
      setGameState(prev => ({
        ...prev,
        xp: Math.max(0, prev.xp - 25),
        totalXPEarned: Math.max(0, prev.totalXPEarned - 25)
      }));
      toast.info('Objective undone. 25 XP refunded.');
    }
  };

  // Daily Quest handlers
  const handleAddDaily = (quest) => {
    setGameState(prev => ({
      ...prev,
      dailyQuests: [...prev.dailyQuests, quest]
    }));
    toast.success('Daily Quest Added! 🔥');
  };

  const handleToggleDaily = (index) => {
    const quest = gameState.dailyQuests[index];
    const wasCompleted = quest.completed;
    
    setGameState(prev => {
      const updatedQuests = prev.dailyQuests.map((q, i) =>
        i === index ? { ...q, completed: !q.completed, completedAt: !q.completed ? new Date().toISOString() : null } : q
      );
      
      const wasAnyCompleted = prev.dailyQuests.some(q => q.completed);
      const isAnyCompleted = updatedQuests.some(q => q.completed);
      
      let newStreak = prev.dailyStreak;
      if (!wasAnyCompleted && isAnyCompleted) {
        newStreak = prev.dailyStreak + 1;
      }
      
      return {
        ...prev,
        dailyQuests: updatedQuests,
        dailyStreak: newStreak,
        totalQuestsCompleted: wasCompleted ? prev.totalQuestsCompleted : prev.totalQuestsCompleted + 1
      };
    });
    
    if (!wasCompleted) {
      addXP(quest.xp);
      toast.success('Daily Quest Completed! ✅', { description: `+${quest.xp} XP earned!` });
    }
  };

  const handleUndoDaily = (index) => {
    const quest = gameState.dailyQuests[index];
    
    setGameState(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.map((q, i) =>
        i === index ? { ...q, completed: false, completedAt: null } : q
      ),
      xp: Math.max(0, prev.xp - quest.xp),
      totalXPEarned: Math.max(0, prev.totalXPEarned - quest.xp),
      totalQuestsCompleted: Math.max(0, prev.totalQuestsCompleted - 1)
    }));
    
    toast.info(`Daily task undone. ${quest.xp} XP refunded.`);
  };

  const handleDeleteDaily = (index) => {
    setGameState(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.filter((_, i) => i !== index)
    }));
    toast.info('Daily Quest Deleted');
  };

  // Weekly Quest handlers
  const handleAddWeekly = (quest) => {
    setGameState(prev => ({
      ...prev,
      weeklyQuests: [...prev.weeklyQuests, quest]
    }));
    toast.success('Weekly Quest Added! ⚡');
  };

  const handleIncrementWeekly = (index) => {
    const quest = gameState.weeklyQuests[index];
    
    setGameState(prev => {
      const updatedQuests = prev.weeklyQuests.map((q, i) =>
        i === index ? { ...q, current: Math.min(q.current + 1, q.target), lastProgressAt: new Date().toISOString() } : q
      );
      
      const allComplete = updatedQuests.every(q => q.current >= q.target);
      const wereAllComplete = prev.weeklyQuests.every(q => q.current >= q.target);
      
      let newStreak = prev.weeklyStreak;
      if (allComplete && !wereAllComplete) {
        newStreak = prev.weeklyStreak + 1;
        addXP(10);
        toast.success('All Weekly Quests Completed! 🎉', { description: '+10 Bonus XP!' });
      }
      
      return {
        ...prev,
        weeklyQuests: updatedQuests,
        weeklyStreak: newStreak,
        totalQuestsCompleted: prev.totalQuestsCompleted + 1
      };
    });
    
    addXP(quest.xpPerIncrement || 5);
    toast.success('Progress Updated! 💪', { description: `+${quest.xpPerIncrement || 5} XP earned!` });
  };

  const handleDeleteWeekly = (index) => {
    setGameState(prev => ({
      ...prev,
      weeklyQuests: prev.weeklyQuests.filter((_, i) => i !== index)
    }));
    toast.info('Weekly Quest Deleted');
  };

  // Side Quest handlers
  const handleAddSide = (quest) => {
    setGameState(prev => ({
      ...prev,
      sideQuests: [...prev.sideQuests, quest]
    }));
    toast.success('Side Quest Added! 📋');
  };

  const handleToggleSide = (index) => {
    const quest = gameState.sideQuests[index];
    
    setGameState(prev => ({
      ...prev,
      sideQuests: prev.sideQuests.map((q, i) =>
        i === index ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
      ),
      totalQuestsCompleted: prev.totalQuestsCompleted + 1
    }));
    
    addXP(quest.xp);
    toast.success('Side Quest Completed! ✅', { description: `+${quest.xp} XP earned!` });
    
    // Auto-remove after 5 minutes
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        sideQuests: prev.sideQuests.filter((_, i) => i !== index)
      }));
    }, 5 * 60 * 1000);
  };

  const handleUndoSide = (index) => {
    const quest = gameState.sideQuests[index];
    
    setGameState(prev => ({
      ...prev,
      sideQuests: prev.sideQuests.map((q, i) =>
        i === index ? { ...q, completed: false, completedAt: null } : q
      ),
      xp: Math.max(0, prev.xp - quest.xp),
      totalXPEarned: Math.max(0, prev.totalXPEarned - quest.xp),
      totalQuestsCompleted: Math.max(0, prev.totalQuestsCompleted - 1)
    }));
    
    toast.info(`Side quest undone. ${quest.xp} XP refunded.`);
  };

  const handleDeleteSide = (index) => {
    setGameState(prev => ({
      ...prev,
      sideQuests: prev.sideQuests.filter((_, i) => i !== index)
    }));
    toast.info('Side Quest Deleted');
  };

  // Mini-game handlers
  const handleClaimReward = (coins) => {
    const gameId = 'general'; // You can track specific games if needed
    
    // Set cooldown
    const cooldownEnd = Date.now() + (60 * 60 * 1000); // 1 hour
    setGameState(prev => ({
      ...prev,
      miniGameCooldowns: {
        ...prev.miniGameCooldowns,
        [gameId]: cooldownEnd
      },
      miniGamesPlayed: {
        ...prev.miniGamesPlayed,
        [gameId]: (prev.miniGamesPlayed?.[gameId] || 0) + 1
      }
    }));
    
    addCoins(coins);
  };

  // Settings handlers
  const handleResetAll = () => {
    const initialState = getInitialGameState();
    setGameState(initialState);
    saveGameData(initialState);
    setShowOnboarding(true);
    toast.success('All data has been reset!');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🌌
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Ascend</h1>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStore(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all"
              data-testid="store-header-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Store</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMiniGames(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              data-testid="mini-games-header-btn"
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="hidden sm:inline">Mini-Games</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(true)}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-2xl"
              data-testid="profile-header-btn"
            >
              {gameState.avatar}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              data-testid="settings-header-btn"
            >
              <SettingsIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <StatsCard 
          level={gameState.level} 
          xp={gameState.xp} 
          coins={gameState.coins} 
        />
        
        <MotivationalQuote />
        
        <div className="space-y-6">
          <MainQuest
            mainQuest={gameState.mainQuest}
            onAddMainQuest={handleAddMainQuest}
            onEditMainQuest={handleEditMainQuest}
            onAbandonMainQuest={handleAbandonMainQuest}
            onCompleteMainQuest={handleCompleteMainQuest}
            onToggleObjective={handleToggleObjective}
          />
          
          <DailyQuests
            dailyQuests={gameState.dailyQuests}
            dailyStreak={gameState.dailyStreak}
            onAddDaily={handleAddDaily}
            onToggleDaily={handleToggleDaily}
            onDeleteDaily={handleDeleteDaily}
            onUndoDaily={handleUndoDaily}
          />
          
          <WeeklyQuests
            weeklyQuests={gameState.weeklyQuests}
            weeklyStreak={gameState.weeklyStreak}
            onAddWeekly={handleAddWeekly}
            onIncrementWeekly={handleIncrementWeekly}
            onDeleteWeekly={handleDeleteWeekly}
          />
          
          <SideQuests
            sideQuests={gameState.sideQuests}
            onAddSide={handleAddSide}
            onToggleSide={handleToggleSide}
            onDeleteSide={handleDeleteSide}
            onUndoSide={handleUndoSide}
          />
        </div>
      </main>

      {/* Modals */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
      
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        gameState={gameState}
        onUpdateProfile={handleUpdateProfile}
      />
      
      <RewardStore
        isOpen={showStore}
        onClose={() => setShowStore(false)}
        coins={gameState.coins}
        onPurchase={handlePurchase}
      />
      
      <MiniGames
        isOpen={showMiniGames}
        onClose={() => setShowMiniGames(false)}
        onClaimReward={handleClaimReward}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetAll={handleResetAll}
      />
      
      <LevelUpModal
        isOpen={levelUpData !== null}
        onClose={() => setLevelUpData(null)}
        oldLevel={levelUpData?.oldLevel}
        newLevel={levelUpData?.newLevel}
      />
      
      <StreakBrokenModal
        isOpen={streakBroken !== null}
        onClose={() => setStreakBroken(null)}
        type={streakBroken}
      />
      
      <XPGainAnimation
        xp={xpAnimation.amount}
        visible={xpAnimation.visible}
        onComplete={() => setXpAnimation({ visible: false, amount: 0 })}
      />
    </div>
  );
}

export default App;
