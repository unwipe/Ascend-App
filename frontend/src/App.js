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
import ActiveEffects from './components/ActiveEffects';
import { loadGameData, saveGameData, getInitialGameState } from './utils/localStorage';
import { checkLevelUp, checkStreakStatus, getWeekStart, calculateLevel } from './utils/gameLogic';
import { checkAchievements } from './utils/achievements';
import { soundManager } from './utils/soundEffects';
import { getXPMultiplier, activateXPMultiplier, activateStreakFreeze, isStreakFreezeActive, useStreakFreeze, migrateStreakSaverToFreeze } from './utils/effectsUtils';
import { updateQuestStreak, checkMilestoneRewards, getActiveStreaks } from './utils/streakSystem';
import { redeemPromoCode } from './utils/promoCodes';
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
    // Migrate old Streak Saver to Streak Freeze (Phase 2 - Prompt 10)
    migrateStreakSaverToFreeze();
    
    const savedData = loadGameData();
    if (savedData) {
      // Check if tutorial completed
      if (!savedData.tutorialCompleted) {
        setShowOnboarding(true);
      }

      const streakStatus = checkStreakStatus(savedData.lastLoginDate);
      let updatedState = { ...savedData, lastLoginDate: new Date().toISOString() };
      
      // Recalculate level based on total XP (for new exponential system)
      // This ensures existing users get correct level after system update
      const correctLevel = calculateLevel(updatedState.xp);
      if (correctLevel !== updatedState.level) {
        updatedState.level = correctLevel;
      }
      
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
    // Apply multiplier if active (from effectsUtils)
    const multiplier = getXPMultiplier();
    const finalAmount = amount * multiplier;
    
    setXpAnimation({ visible: true, amount: finalAmount });
    soundManager.play('xpGain');
    
    // Show multiplier notification if active
    if (multiplier > 1) {
      toast.success(`+${finalAmount} XP (${multiplier}x multiplier)  🔥`);
    }
    
    setGameState(prev => {
      const newXP = prev.xp + finalAmount;
      const newTotalXP = prev.totalXPEarned + finalAmount;
      const levelCheck = checkLevelUp(newXP, prev.level);
      
      if (levelCheck.shouldLevelUp) {
        soundManager.play('levelUp');
        setLevelUpData({ 
          oldLevel: prev.level, 
          newLevel: levelCheck.newLevel,
          levelsGained: levelCheck.levelsGained || 1
        });
        return {
          ...prev,
          xp: newXP, // Keep total XP accumulating
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

    // Handle multiple daily quests from onboarding
    if (data.dailyQuests && data.dailyQuests.length > 0) {
      updatedState.dailyQuests = data.dailyQuests;
    }

    // Handle multiple weekly quests from onboarding
    if (data.weeklyQuests && data.weeklyQuests.length > 0) {
      updatedState.weeklyQuests = data.weeklyQuests;
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

  // Avatar purchase handler
  const handlePurchaseAvatar = (avatar) => {
    if (gameState.coins < avatar.price) {
      toast.error('Not enough coins!');
      return;
    }

    if (gameState.unlockedAvatars?.includes(avatar.id)) {
      toast.info('You already own this avatar!');
      return;
    }

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - avatar.price,
      totalCoinsSpent: prev.totalCoinsSpent + avatar.price,
      totalPurchases: prev.totalPurchases + 1,
      unlockedAvatars: [...(prev.unlockedAvatars || []), avatar.id]
    }));

    toast.success(`${avatar.name} avatar unlocked! 🎉`, {
      description: 'Change it in your Profile!'
    });
  };

  // Streak mode toggle handler
  const handleToggleStreakMode = (enabled) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        individualDailyStreaks: enabled
      },
      // Reset all daily streaks when mode changes
      dailyStreak: 0,
      dailyQuests: prev.dailyQuests.map(q => ({ ...q, streak: 0 }))
    }));

    toast.success(enabled ? 'Individual streak mode enabled!' : 'Global streak mode enabled!', {
      description: 'All daily streaks have been reset.'
    });
  };

  // Use XP Multiplier from inventory
  const handleUseXPMultiplier = () => {
    // Check if already active
    if (getXPMultiplier() > 1) {
      toast.error('XP Multiplier is already active!');
      return;
    }

    // Activate multiplier
    activateXPMultiplier();

    // Remove from inventory (filter out one xp_multiplier item)
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const itemIndex = newInventory.findIndex(item => item.id === 'xp_multiplier');
      if (itemIndex !== -1) {
        newInventory.splice(itemIndex, 1); // Remove the item
      }
      return {
        ...prev,
        inventory: newInventory,
      };
    });

    toast.success('XP Multiplier activated! 🔥', {
      description: '2x XP for 2 hours!'
    });
  };

  // Use Streak Freeze from inventory
  const handleUseStreakFreeze = () => {
    // Check if already active
    if (isStreakFreezeActive()) {
      toast.error('Streak Freeze is already active!');
      return;
    }

    // Activate streak freeze
    activateStreakFreeze();

    // Remove from inventory (filter out one streak_freeze item)
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const itemIndex = newInventory.findIndex(item => item.id === 'streak_freeze' || item.id === 'streak_saver');
      if (itemIndex !== -1) {
        newInventory.splice(itemIndex, 1); // Remove the item
      }
      return {
        ...prev,
        inventory: newInventory,
      };
    });

    toast.success('Streak Freeze activated! ❄️', {
      description: 'Your streak will be frozen if you miss a day. You\'ll have 24 hours to complete your quests.'
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
    const completedQuest = { 
      ...gameState.mainQuest, 
      completedAt: new Date().toISOString(),
      id: `mq-${Date.now()}`,
      xpEarned: 200,
      status: 'completed'
    };
    
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
    setGameState(prev => {
      // Check daily quest creation limit (only enforced after tutorial)
      if (prev.tutorialCompleted) {
        const today = new Date().toDateString();
        const lastResetDate = prev.dailyQuestCreation?.lastResetDate 
          ? new Date(prev.dailyQuestCreation.lastResetDate).toDateString() 
          : null;
        
        let creationCount = prev.dailyQuestCreation?.count || 0;
        
        // Reset count if it's a new day
        if (lastResetDate !== today) {
          creationCount = 0;
        }
        
        // Check if limit reached (2 per day)
        if (creationCount >= 2) {
          toast.error('Daily Quest creation limit reached (2/day). You can create more tomorrow!');
          return prev; // Don't add the quest
        }
        
        // Increment creation count
        return {
          ...prev,
          dailyQuests: [...prev.dailyQuests, quest],
          dailyQuestCreation: {
            count: creationCount + 1,
            lastResetDate: new Date().toISOString()
          }
        };
      }
      
      // During tutorial, allow unlimited creation
      return {
        ...prev,
        dailyQuests: [...prev.dailyQuests, quest]
      };
    });
    
    toast.success('Daily Quest Added! 🔥');
  };

  const handleToggleDaily = (index) => {
    const quest = gameState.dailyQuests[index];
    const wasCompleted = quest.completed;
    
    // Get multiplier and calculate XP
    const baseXP = quest.xp;
    const multiplier = getXPMultiplier();
    const totalXP = baseXP * multiplier;
    
    // Generate quest ID if not exists
    const questId = quest.id || `daily-${index}-${quest.text.slice(0, 10)}`;
    
    setGameState(prev => {
      const updatedQuests = prev.dailyQuests.map((q, i) =>
        i === index ? { 
          ...q,
          id: questId, // Ensure quest has an ID
          completed: !q.completed, 
          completedAt: !q.completed ? new Date().toISOString() : null,
          baseXP: !q.completed ? baseXP : null, // Store base XP for refund
          totalXP: !q.completed ? totalXP : null, // Store total XP for display
          multiplierApplied: !q.completed ? multiplier : null
        } : q
      );
      
      const wasAnyCompleted = prev.dailyQuests.some(q => q.completed);
      const isAnyCompleted = updatedQuests.some(q => q.completed);
      
      let newStreak = prev.dailyStreak;
      if (!wasAnyCompleted && isAnyCompleted) {
        newStreak = prev.dailyStreak + 1;
      }
      
      // Update individual quest streak (Phase 1 - Prompt 10)
      let updatedQuestStreaks = prev.questStreaks || {};
      let milestoneRewards = [];
      
      if (!wasCompleted) {
        const oldStreak = updatedQuestStreaks[questId]?.streak || 0;
        updatedQuestStreaks = updateQuestStreak(updatedQuestStreaks, questId, quest.text);
        const newStreak = updatedQuestStreaks[questId].streak;
        
        // Check for milestone rewards
        milestoneRewards = checkMilestoneRewards(oldStreak, newStreak);
        
        // Award milestone rewards
        if (milestoneRewards.length > 0) {
          milestoneRewards.forEach(reward => {
            setTimeout(() => {
              let description = `+${reward.xp} XP & +${reward.coins} Coins for ${reward.milestone}-day streak!`;
              
              // Special Phoenix Character unlock for 100-day milestone
              if (reward.unlockPhoenix) {
                description = `+${reward.xp} XP, +${reward.coins} Coins, and Phoenix Character unlocked! 🐦‍🔥`;
              }
              
              toast.success(`🎉 ${reward.title}`, { description });
              soundManager.play('achievement');
            }, 500);
          });
        }
      }
      
      // Calculate total milestone rewards
      const totalMilestoneXP = milestoneRewards.reduce((sum, r) => sum + r.xp, 0);
      const totalMilestoneCoins = milestoneRewards.reduce((sum, r) => sum + r.coins, 0);
      
      // Check if Phoenix Avatar should be unlocked (100-day milestone)
      const shouldUnlockPhoenix = milestoneRewards.some(r => r.unlockPhoenix);
      let updatedUnlockedAvatars = prev.unlockedAvatars || [];
      
      if (shouldUnlockPhoenix && !updatedUnlockedAvatars.includes('phoenix')) {
        updatedUnlockedAvatars = [...updatedUnlockedAvatars, 'phoenix'];
      }
      
      return {
        ...prev,
        dailyQuests: updatedQuests,
        dailyStreak: newStreak,
        questStreaks: updatedQuestStreaks,
        totalQuestsCompleted: wasCompleted ? prev.totalQuestsCompleted : prev.totalQuestsCompleted + 1,
        xp: prev.xp + totalMilestoneXP,
        coins: prev.coins + totalMilestoneCoins,
        totalXPEarned: prev.totalXPEarned + totalMilestoneXP,
        totalCoinsEarned: prev.totalCoinsEarned + totalMilestoneCoins,
        unlockedAvatars: updatedUnlockedAvatars
      };
    });
    
    if (!wasCompleted) {
      addXP(baseXP); // addXP will apply the multiplier internally
      // Don't show manual multiplier toast here since addXP handles it
    }
  };

  const handleUndoDaily = (index) => {
    const quest = gameState.dailyQuests[index];
    
    // Refund ONLY base XP, not multiplied XP (anti-farming fix)
    const refundXP = quest.baseXP || quest.xp;
    const hadMultiplier = quest.multiplierApplied && quest.multiplierApplied > 1;
    
    setGameState(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.map((q, i) =>
        i === index ? { ...q, completed: false, completedAt: null, baseXP: null, totalXP: null, multiplierApplied: null } : q
      ),
      xp: Math.max(0, prev.xp - refundXP),
      totalXPEarned: Math.max(0, prev.totalXPEarned - refundXP),
      totalQuestsCompleted: Math.max(0, prev.totalQuestsCompleted - 1)
    }));
    
    // Show appropriate message based on whether multiplier was active
    if (hadMultiplier) {
      toast.info(`Daily task undone. -${refundXP} XP refunded (base XP only)`, {
        description: '⚠️ Multiplier bonus not refunded'
      });
    } else {
      toast.info(`Daily task undone. ${refundXP} XP refunded.`);
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
    setGameState(prev => {
      // Check weekly quest creation limit (only enforced after tutorial)
      if (prev.tutorialCompleted) {
        const today = new Date().toDateString();
        const lastResetDate = prev.weeklyQuestCreation?.lastResetDate 
          ? new Date(prev.weeklyQuestCreation.lastResetDate).toDateString() 
          : null;
        
        let creationCount = prev.weeklyQuestCreation?.count || 0;
        
        // Reset count if it's a new day
        if (lastResetDate !== today) {
          creationCount = 0;
        }
        
        // Check if limit reached (1 per day)
        if (creationCount >= 1) {
          toast.error('Weekly Quest creation limit reached (1/day). You can create more tomorrow!');
          return prev; // Don't add the quest
        }
        
        // Increment creation count
        return {
          ...prev,
          weeklyQuests: [...prev.weeklyQuests, quest],
          weeklyQuestCreation: {
            count: creationCount + 1,
            lastResetDate: new Date().toISOString()
          }
        };
      }
      
      // During tutorial, allow unlimited creation
      return {
        ...prev,
        weeklyQuests: [...prev.weeklyQuests, quest]
      };
    });
    
    toast.success('Weekly Quest Added! ⚡');
  };

  const handleIncrementWeekly = (index) => {
    const quest = gameState.weeklyQuests[index];
    const questId = quest.id || `weekly-${index}-${quest.text.slice(0, 10)}`;
    
    setGameState(prev => {
      const updatedQuests = prev.weeklyQuests.map((q, i) =>
        i === index ? { 
          ...q,
          id: questId, // Ensure quest has an ID
          current: Math.min(q.current + 1, q.target),
          lastProgressAt: new Date().toISOString()
        } : q
      );
      
      const allComplete = updatedQuests.every(q => q.current >= q.target);
      const wereAllComplete = prev.weeklyQuests.every(q => q.current >= q.target);
      
      let newStreak = prev.weeklyStreak;
      if (allComplete && !wereAllComplete) {
        newStreak = prev.weeklyStreak + 1;
        addXP(10);
        toast.success('All Weekly Quests Completed! 🎉', { description: '+10 Bonus XP!' });
      }
      
      // Update individual quest streak (Phase 1 - Prompt 10)
      let updatedQuestStreaks = prev.questStreaks || {};
      let milestoneRewards = [];
      
      const oldStreak = updatedQuestStreaks[questId]?.streak || 0;
      updatedQuestStreaks = updateQuestStreak(updatedQuestStreaks, questId, quest.text);
      const newQuestStreak = updatedQuestStreaks[questId].streak;
      
      // Check for milestone rewards
      milestoneRewards = checkMilestoneRewards(oldStreak, newQuestStreak);
      
      // Award milestone rewards
      if (milestoneRewards.length > 0) {
        milestoneRewards.forEach(reward => {
          setTimeout(() => {
            let description = `+${reward.xp} XP & +${reward.coins} Coins for ${reward.milestone}-day streak!`;
            
            // Special Phoenix Avatar unlock for 100-day milestone
            if (reward.unlockPhoenix) {
              description = `+${reward.xp} XP, +${reward.coins} Coins, and Phoenix Avatar unlocked! 🔥`;
            }
            
            toast.success(`🎉 ${reward.title}`, { description });
            soundManager.play('achievement');
          }, 500);
        });
      }
      
      // Calculate total milestone rewards
      const totalMilestoneXP = milestoneRewards.reduce((sum, r) => sum + r.xp, 0);
      const totalMilestoneCoins = milestoneRewards.reduce((sum, r) => sum + r.coins, 0);
      
      // Check if Phoenix Avatar should be unlocked (100-day milestone)
      const shouldUnlockPhoenix = milestoneRewards.some(r => r.unlockPhoenix);
      let updatedUnlockedAvatars = prev.unlockedAvatars || [];
      
      if (shouldUnlockPhoenix && !updatedUnlockedAvatars.includes('phoenix')) {
        updatedUnlockedAvatars = [...updatedUnlockedAvatars, 'phoenix'];
      }
      
      return {
        ...prev,
        weeklyQuests: updatedQuests,
        weeklyStreak: newStreak,
        questStreaks: updatedQuestStreaks,
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        xp: prev.xp + totalMilestoneXP,
        coins: prev.coins + totalMilestoneCoins,
        totalXPEarned: prev.totalXPEarned + totalMilestoneXP,
        totalCoinsEarned: prev.totalCoinsEarned + totalMilestoneCoins,
        unlockedAvatars: updatedUnlockedAvatars
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
    const questId = quest.id || `side-${index}-${quest.text.slice(0, 10)}`;
    
    setGameState(prev => {
      // Update individual quest streak (Phase 1 - Prompt 10)
      let updatedQuestStreaks = prev.questStreaks || {};
      let milestoneRewards = [];
      
      const oldStreak = updatedQuestStreaks[questId]?.streak || 0;
      updatedQuestStreaks = updateQuestStreak(updatedQuestStreaks, questId, quest.text);
      const newStreak = updatedQuestStreaks[questId].streak;
      
      // Check for milestone rewards
      milestoneRewards = checkMilestoneRewards(oldStreak, newStreak);
      
      // Award milestone rewards
      if (milestoneRewards.length > 0) {
        milestoneRewards.forEach(reward => {
          setTimeout(() => {
            let description = `+${reward.xp} XP & +${reward.coins} Coins for ${reward.milestone}-day streak!`;
            
            // Special Phoenix Avatar unlock for 100-day milestone
            if (reward.unlockPhoenix) {
              description = `+${reward.xp} XP, +${reward.coins} Coins, and Phoenix Avatar unlocked! 🔥`;
            }
            
            toast.success(`🎉 ${reward.title}`, { description });
            soundManager.play('achievement');
          }, 500);
        });
      }
      
      // Calculate total milestone rewards
      const totalMilestoneXP = milestoneRewards.reduce((sum, r) => sum + r.xp, 0);
      const totalMilestoneCoins = milestoneRewards.reduce((sum, r) => sum + r.coins, 0);
      
      // Check if Phoenix Avatar should be unlocked (100-day milestone)
      const shouldUnlockPhoenix = milestoneRewards.some(r => r.unlockPhoenix);
      let updatedUnlockedAvatars = prev.unlockedAvatars || [];
      
      if (shouldUnlockPhoenix && !updatedUnlockedAvatars.includes('phoenix')) {
        updatedUnlockedAvatars = [...updatedUnlockedAvatars, 'phoenix'];
      }
      
      return {
        ...prev,
        sideQuests: prev.sideQuests.map((q, i) =>
          i === index ? { ...q, id: questId, completed: true, completedAt: new Date().toISOString() } : q
        ),
        questStreaks: updatedQuestStreaks,
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        xp: prev.xp + totalMilestoneXP,
        coins: prev.coins + totalMilestoneCoins,
        totalXPEarned: prev.totalXPEarned + totalMilestoneXP,
        totalCoinsEarned: prev.totalCoinsEarned + totalMilestoneCoins,
        unlockedAvatars: updatedUnlockedAvatars
      };
    });
    
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

  // Daily Check-In handler
  const handleCheckIn = () => {
    const now = new Date().toISOString();
    setGameState(prev => ({
      ...prev,
      lastCheckIn: now
    }));
    addXP(10);
    toast.success('Daily Check-In Complete! ✅', { description: '+10 XP earned!' });
  };

  // View Main Quest History handler
  const handleViewHistory = () => {
    setShowProfile(true);
  };

  // Settings handlers
  const handleResetAll = () => {
    const initialState = getInitialGameState();
    setGameState(initialState);
    saveGameData(initialState);
    setShowOnboarding(true);
    toast.success('All data has been reset!');
  };

  // Promo code redemption
  const handleRedeemPromoCode = (code) => {
    const result = redeemPromoCode(code, gameState.usedPromoCodes || []);
    
    if (result.success) {
      const reward = result.reward;
      
      setGameState(prev => {
        const updates = {};
        
        // Apply reward based on type
        if (reward.type === 'xp') {
          updates.xp = prev.xp + reward.amount;
          updates.totalXPEarned = (prev.totalXPEarned || 0) + reward.amount;
          
          // Check for level up
          const levelCheck = checkLevelUp(updates.xp, prev.level);
          if (levelCheck.shouldLevelUp) {
            soundManager.play('levelUp');
            setLevelUpData({ 
              oldLevel: prev.level, 
              newLevel: levelCheck.newLevel,
              levelsGained: levelCheck.levelsGained || 1
            });
            updates.level = levelCheck.newLevel;
          }
        } else if (reward.type === 'coins') {
          updates.coins = prev.coins + reward.amount;
          updates.totalCoinsEarned = (prev.totalCoinsEarned || 0) + reward.amount;
        } else if (reward.type === 'item') {
          updates.inventory = [...prev.inventory, { id: reward.itemId, name: reward.itemId }];
        }
        
        // Track used promo code (only if not reusable)
        if (!result.reward.reusable) {
          updates.usedPromoCodes = [...(prev.usedPromoCodes || []), reward.code];
        }
        
        return { ...prev, ...updates };
      });
      
      // Show success toast with sound
      soundManager.play('coins');
      toast.success(result.message);
    }
    
    return result;
  };

  // Mark suggestion as used
  const handleMarkSuggestionUsed = (suggestion) => {
    setGameState(prev => ({
      ...prev,
      usedSuggestions: [...(prev.usedSuggestions || []), suggestion.toLowerCase()]
    }));
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
        
        <ActiveEffects />
        
        <MotivationalQuote />
        
        <DailyCheckIn 
          lastCheckIn={gameState.lastCheckIn}
          onCheckIn={handleCheckIn}
        />
        
        <div className="space-y-6">
          <MainQuest
            mainQuest={gameState.mainQuest}
            mainQuestCooldown={gameState.mainQuestCooldown}
            onAddMainQuest={handleAddMainQuest}
            onEditMainQuest={handleEditMainQuest}
            onAbandonMainQuest={handleAbandonMainQuest}
            onCompleteMainQuest={handleCompleteMainQuest}
            onToggleObjective={handleToggleObjective}
            onViewHistory={handleViewHistory}
          />
          
          <DailyQuests
            dailyQuests={gameState.dailyQuests}
            dailyStreak={gameState.dailyStreak}
            questStreaks={gameState.questStreaks}
            dailyQuestCreation={gameState.dailyQuestCreation}
            tutorialCompleted={gameState.tutorialCompleted}
            usedSuggestions={gameState.usedSuggestions}
            onAddDaily={handleAddDaily}
            onToggleDaily={handleToggleDaily}
            onDeleteDaily={handleDeleteDaily}
            onUndoDaily={handleUndoDaily}
            onMarkSuggestionUsed={handleMarkSuggestionUsed}
          />
          
          <WeeklyQuests
            weeklyQuests={gameState.weeklyQuests}
            weeklyStreak={gameState.weeklyStreak}
            questStreaks={gameState.questStreaks}
            weeklyQuestCreation={gameState.weeklyQuestCreation}
            tutorialCompleted={gameState.tutorialCompleted}
            usedSuggestions={gameState.usedSuggestions}
            onAddWeekly={handleAddWeekly}
            onIncrementWeekly={handleIncrementWeekly}
            onDeleteWeekly={handleDeleteWeekly}
            onMarkSuggestionUsed={handleMarkSuggestionUsed}
          />
          
          <SideQuests
            sideQuests={gameState.sideQuests}
            questStreaks={gameState.questStreaks}
            usedSuggestions={gameState.usedSuggestions}
            onAddSide={handleAddSide}
            onToggleSide={handleToggleSide}
            onDeleteSide={handleDeleteSide}
            onUndoSide={handleUndoSide}
            onMarkSuggestionUsed={handleMarkSuggestionUsed}
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
        onUseXPMultiplier={handleUseXPMultiplier}
        onUseStreakFreeze={handleUseStreakFreeze}
      />
      
      <RewardStore
        isOpen={showStore}
        onClose={() => setShowStore(false)}
        coins={gameState.coins}
        unlockedAvatars={gameState.unlockedAvatars || []}
        onPurchase={handlePurchase}
        onPurchaseAvatar={handlePurchaseAvatar}
      />
      
      <MiniGames
        isOpen={showMiniGames}
        onClose={() => setShowMiniGames(false)}
        onClaimReward={handleClaimReward}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={gameState.settings || {}}
        onResetAll={handleResetAll}
        onToggleStreakMode={handleToggleStreakMode}
        onRedeemPromoCode={handleRedeemPromoCode}
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
