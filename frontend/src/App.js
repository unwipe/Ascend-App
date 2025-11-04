import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Settings as SettingsIcon } from 'lucide-react';
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
import WelcomeModal from './components/WelcomeModal';
import XPGainAnimation from './components/XPGainAnimation';
import StreakBrokenModal from './components/StreakBrokenModal';
import { loadGameData, saveGameData, getInitialGameState } from './utils/localStorage';
import { checkLevelUp, getRequiredXP, checkStreakStatus, getWeekStart } from './utils/gameLogic';
import '@/App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [xpAnimation, setXpAnimation] = useState({ visible: false, amount: 0 });
  const [streakBroken, setStreakBroken] = useState(null);

  // Initialize game state
  useEffect(() => {
    const savedData = loadGameData();
    if (savedData) {
      // Check streak status
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
      
      // Handle weekly reset (Monday)
      const lastWeekStart = getWeekStart(new Date(savedData.lastLoginDate));
      const currentWeekStart = getWeekStart(new Date());
      
      if (lastWeekStart.getTime() !== currentWeekStart.getTime()) {
        // Check if all weeklies were completed last week
        const allCompleted = updatedState.weeklyQuests.every(q => q.current >= q.target);
        
        if (!allCompleted && updatedState.weeklyQuests.length > 0) {
          setStreakBroken('weekly');
          updatedState.weeklyStreak = 0;
        }
        
        // Reset weekly progress
        updatedState.weeklyQuests = updatedState.weeklyQuests.map(q => ({ ...q, current: 0 }));
      }
      
      setGameState(updatedState);
      saveGameData(updatedState);
    } else {
      const initialState = getInitialGameState();
      setGameState(initialState);
      setShowWelcome(true);
    }
  }, []);

  // Auto-save whenever game state changes
  useEffect(() => {
    if (gameState && !gameState.isFirstTime) {
      saveGameData(gameState);
    }
  }, [gameState]);

  // Add XP with animation and level up check
  const addXP = (amount) => {
    setXpAnimation({ visible: true, amount });
    
    setGameState(prev => {
      const newXP = prev.xp + amount;
      const levelCheck = checkLevelUp(newXP, prev.level);
      
      if (levelCheck.shouldLevelUp) {
        setLevelUpData({ oldLevel: prev.level, newLevel: levelCheck.newLevel });
        return {
          ...prev,
          xp: levelCheck.remainingXP,
          level: levelCheck.newLevel
        };
      }
      
      return { ...prev, xp: newXP };
    });
  };

  // Add Coins
  const addCoins = (amount) => {
    setGameState(prev => ({ ...prev, coins: prev.coins + amount }));
    toast.success(`+${amount} Coins earned! 🚧`, {
      description: 'Keep playing mini-games to earn more!'
    });
  };

  // Main Quest handlers
  const handleAddMainQuest = (quest) => {
    setGameState(prev => ({ ...prev, mainQuest: quest, isFirstTime: false }));
    toast.success('Main Quest Set! 🎯', {
      description: 'Your epic journey begins!'
    });
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
    addXP(200);
    setGameState(prev => ({ ...prev, mainQuest: null }));
    toast.success('Main Quest Completed! 🎉', {
      description: '+200 XP earned!'
    });
  };

  const handleToggleObjective = (index) => {
    setGameState(prev => ({
      ...prev,
      mainQuest: {
        ...prev.mainQuest,
        objectives: prev.mainQuest.objectives.map((obj, i) => 
          i === index ? { ...obj, completed: !obj.completed } : obj
        )
      }
    }));
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
        i === index ? { ...q, completed: !q.completed } : q
      );
      
      // Check if this is the first completion of the day
      const wasAnyCompleted = prev.dailyQuests.some(q => q.completed);
      const isAnyCompleted = updatedQuests.some(q => q.completed);
      
      let newStreak = prev.dailyStreak;
      if (!wasAnyCompleted && isAnyCompleted) {
        newStreak = prev.dailyStreak + 1;
      }
      
      return {
        ...prev,
        dailyQuests: updatedQuests,
        dailyStreak: newStreak
      };
    });
    
    if (!wasCompleted) {
      addXP(quest.xp);
      toast.success('Daily Quest Completed! ✅', {
        description: `+${quest.xp} XP earned!`
      });
    }
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
        i === index ? { ...q, current: Math.min(q.current + 1, q.target) } : q
      );
      
      // Check if all weeklies are now complete
      const allComplete = updatedQuests.every(q => q.current >= q.target);
      const wereAllComplete = prev.weeklyQuests.every(q => q.current >= q.target);
      
      let newStreak = prev.weeklyStreak;
      if (allComplete && !wereAllComplete) {
        newStreak = prev.weeklyStreak + 1;
        addXP(10); // Bonus XP
        toast.success('All Weekly Quests Completed! 🎉', {
          description: '+10 Bonus XP!'
        });
      }
      
      return {
        ...prev,
        weeklyQuests: updatedQuests,
        weeklyStreak: newStreak
      };
    });
    
    addXP(quest.xpPerIncrement);
    toast.success('Progress Updated! 💪', {
      description: `+${quest.xpPerIncrement} XP earned!`
    });
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
    addXP(quest.xp);
    
    setGameState(prev => ({
      ...prev,
      sideQuests: prev.sideQuests.filter((_, i) => i !== index)
    }));
    
    toast.success('Side Quest Completed! ✅', {
      description: `+${quest.xp} XP earned!`
    });
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
    addCoins(coins);
  };

  // Settings handlers
  const handleResetAll = () => {
    const initialState = getInitialGameState();
    setGameState(initialState);
    saveGameData(initialState);
    setShowWelcome(true);
    toast.success('All data has been reset!');
  };

  // Welcome modal handler
  const handleWelcomeComplete = (mainQuest) => {
    handleAddMainQuest(mainQuest);
    setShowWelcome(false);
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
          />
        </div>
      </main>

      {/* Modals */}
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
      
      <WelcomeModal
        isOpen={showWelcome}
        onComplete={handleWelcomeComplete}
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
