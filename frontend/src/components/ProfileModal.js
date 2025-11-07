import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit2, Trophy, Package, BarChart3, History, Lock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLevelEmoji, getRankTitle } from '../utils/levelSystem';
import { achievements } from '../utils/achievements';
import { FREE_AVATARS, PAID_AVATARS, MYTHICAL_AVATARS, getUnlockedAvatars, getLockedAvatars } from '../utils/avatars';
import { getActiveStreaks, getMilestoneProgress, STREAK_MILESTONES } from '../utils/streakSystem';
import { toast } from 'sonner';
import ItemUseConfirmModal from './ItemUseConfirmModal';

const ProfileModal = ({ isOpen, onClose, gameState, onUpdateProfile, onUseXPMultiplier, onUseStreakFreeze }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(gameState.username);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(gameState.avatar);
  const [confirmingItem, setConfirmingItem] = useState(null);

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      onUpdateProfile({ username: tempUsername.trim() });
      setIsEditingUsername(false);
    }
  };

  const handleSelectAvatar = (avatarData) => {
    const isUnlocked = !avatarData.locked || gameState.unlockedAvatars?.includes(avatarData.id);
    
    if (isUnlocked) {
      setSelectedAvatar(avatarData.emoji);
    } else {
      toast.error('Purchase this avatar in the Reward Store!');
    }
  };

  const handleSaveAvatar = () => {
    onUpdateProfile({ avatar: selectedAvatar });
    setShowAvatarSelector(false);
    toast.success('Avatar updated!');
  };

  const unlockedAvatars = getUnlockedAvatars(gameState.unlockedAvatars || []);
  const lockedAvatars = getLockedAvatars(gameState.unlockedAvatars || []);
  
  // Separate mythical avatars
  const unlockedMythical = MYTHICAL_AVATARS.filter(avatar => 
    gameState.unlockedAvatars?.includes(avatar.id)
  );
  const lockedMythical = MYTHICAL_AVATARS.filter(avatar => 
    !gameState.unlockedAvatars?.includes(avatar.id)
  );

  const stats = {
    level: gameState.level || 1,
    totalXP: gameState.totalXPEarned || gameState.xp || 0,
    dailyStreak: gameState.dailyStreak || 0,
    weeklyStreak: gameState.weeklyStreak || 0,
    longestDailyStreak: gameState.longestDailyStreak || 0,
    longestWeeklyStreak: gameState.longestWeeklyStreak || 0,
    totalQuests: gameState.totalQuestsCompleted || 0,
    totalCoins: gameState.totalCoinsEarned || gameState.coins || 0,
    coinsSpent: gameState.totalCoinsSpent || 0,
    memberSince: gameState.memberSince 
      ? new Date(gameState.memberSince).toLocaleDateString() 
      : new Date().toLocaleDateString()
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="profile-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Profile</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="flex gap-2 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap sm:grid sm:grid-cols-6 bg-white/5 pb-2">
              <TabsTrigger value="overview" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                Overview
              </TabsTrigger>
              <TabsTrigger value="streaks" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                🔥 Streaks
              </TabsTrigger>
              <TabsTrigger value="achievements" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                <Trophy className="w-4 h-4 mr-1 inline" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">🏆</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                <Package className="w-4 h-4 mr-1 inline" />
                <span className="hidden sm:inline">Inventory</span>
                <span className="sm:hidden">📦</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                <History className="w-4 h-4 mr-1 inline" />
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">📜</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="whitespace-nowrap leading-tight text-sm sm:text-base px-3 py-2 rounded-md flex-shrink-0">
                <BarChart3 className="w-4 h-4 mr-1 inline" />
                <span className="hidden sm:inline">Stats</span>
                <span className="sm:hidden">📊</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-6" ref={tabPanelRef}>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <button
                      onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                      className="text-6xl hover:scale-110 transition-transform"
                      data-testid="avatar-button"
                    >
                      {/* Only show emoji avatars, not URLs */}
                      {gameState.avatar && !gameState.avatar.startsWith('http') ? gameState.avatar : '😊'}
                    </button>
                    <div className="text-xs text-gray-400 mt-1 text-center">Click to change</div>
                  </div>

                  <div className="flex-1">
                    {isEditingUsername ? (
                      <div className="flex gap-2">
                        <Input
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          data-testid="username-edit-input"
                        />
                        <Button onClick={handleSaveUsername} size="sm">Save</Button>
                        <Button variant="ghost" onClick={() => setIsEditingUsername(false)} size="sm">Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold text-white">{gameState.username}</h2>
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="text-gray-400 hover:text-white"
                          data-testid="edit-username-btn"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-4xl">{getLevelEmoji(gameState.level)}</span>
                      <div>
                        <div className="text-2xl font-bold text-white">Level {gameState.level}</div>
                        <div className="text-lg text-blue-400">{getRankTitle(gameState.level)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Total XP Earned</div>
                    <div className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Current Streak</div>
                    <div className="text-2xl font-bold text-orange-400">🔥 {stats.dailyStreak} days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Longest Streak</div>
                    <div className="text-2xl font-bold text-purple-400">⚡ {stats.longestDailyStreak} days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Member Since</div>
                    <div className="text-lg font-bold text-white">{stats.memberSince}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Individual Quest Streaks */}
            <TabsContent value="streaks" className="space-y-6">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  🔥 Your Active Streaks
                </h3>
                <p className="text-gray-400 text-sm mb-4">Complete quests consistently to earn milestone rewards!</p>

                {!gameState.questStreaks || Object.keys(gameState.questStreaks).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-400 text-lg">No streaks yet!</p>
                    <p className="text-gray-500 text-sm mt-2">Complete quests daily to start building your streaks.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {getActiveStreaks(gameState.questStreaks).map((streakData, index) => {
                        const progress = getMilestoneProgress(streakData.streak);
                        const progressPercent = ((streakData.streak - progress.previous) / (progress.next - progress.previous)) * 100;

                        return (
                          <motion.div
                            key={streakData.questId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/10 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="text-white font-bold">{streakData.questText}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-2xl">
                                    {streakData.streak >= 100 ? '🏆' :
                                     streakData.streak >= 60 ? '💎' :
                                     streakData.streak >= 30 ? '⚡' :
                                     streakData.streak >= 14 ? '🔥' :
                                     streakData.streak >= 7 ? '💪' : '🔥'}
                                  </span>
                                  <span className="text-xl font-bold text-orange-400">
                                    {streakData.streak} {streakData.streak === 1 ? 'day' : 'days'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Total Completions</div>
                                <div className="text-lg font-bold text-white">{streakData.totalCompletions}</div>
                              </div>
                            </div>

                            {/* Progress to next milestone */}
                            {progress.next && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>Next Milestone: {progress.next} days</span>
                                  <span>{streakData.streak}/{progress.next}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Completed milestones */}
                            {progress.completed.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {progress.completed.map(milestone => (
                                  <span key={milestone} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    ✓ {milestone} days
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Milestone Rewards Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        🎁 Milestone Rewards
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {STREAK_MILESTONES.map(milestone => {
                          const reward = {
                            3: { xp: 40, coins: 5 },
                            7: { xp: 100, coins: 5 },
                            14: { xp: 200, coins: 5 },
                            30: { xp: 400, coins: 5 },
                            60: { xp: 1000, coins: 5 },
                            100: { xp: 2000, coins: 5, special: 'Phoenix Character 🐦‍🔥' }
                          }[milestone];
                          
                          return (
                            <div key={milestone} className="bg-white/5 rounded p-2">
                              <div className="text-orange-400 font-bold">{milestone} days</div>
                              <div className="text-gray-400 text-xs">
                                +{reward.xp} XP, +{reward.coins} coins
                                {reward.special && (
                                  <div className="text-yellow-400 font-bold mt-1">+ {reward.special}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Achievements */}
            <TabsContent value="achievements">
              {achievements.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-lg text-gray-300 mb-2">No achievements yet</p>
                  <p className="text-sm text-gray-500">Keep playing to unlock amazing achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map(achievement => {
                  const isUnlocked = gameState.unlockedAchievements?.includes(achievement.id);
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border-2 relative ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                          : 'bg-white/5 border-gray-700'
                      }`}
                      style={{ opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'grayscale(100%)' }}
                      data-testid={`achievement-${achievement.id}`}
                    >
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-gray-500">
                          🔒
                        </div>
                      )}
                      <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                      <h3 className="font-bold text-white text-center mb-1">{achievement.title}</h3>
                      <p className="text-xs text-gray-400 text-center">{achievement.description}</p>
                      <div className="mt-2 text-center">
                        {isUnlocked ? (
                          <span className="text-xs text-green-400">✓ Unlocked</span>
                        ) : (
                          <span className="text-xs text-gray-500">🔒 Locked</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Inventory */}
            <TabsContent value="inventory">
              {(!gameState.inventory || !Array.isArray(gameState.inventory) || gameState.inventory.length === 0) ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Your inventory is empty.</p>
                  <p className="text-gray-500">Visit the Reward Store to get items!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.isArray(gameState.inventory) && gameState.inventory.map((item, index) => (
                    <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="text-4xl text-center mb-2">{item.icon}</div>
                      <h3 className="font-bold text-white text-center">{item.name}</h3>
                      <p className="text-sm text-gray-400 text-center mt-2">{item.description}</p>
                      {item.canUse && (
                        <Button 
                          onClick={() => {
                            if (item.id === 'xp_multiplier') {
                              setConfirmingItem({
                                type: 'xp_multiplier',
                                icon: '⚡',
                                title: 'Activate XP Multiplier?',
                                question: 'Are you sure you want to activate it now?',
                                effect: '2x XP for 2 hours',
                              });
                            } else if (item.id === 'streak_freeze' || item.id === 'streak_saver') {
                              setConfirmingItem({
                                type: 'streak_freeze',
                                icon: '❄️',
                                title: 'Activate Streak Freeze?',
                                question: 'Are you sure you want to activate it now?',
                                effect: 'When your streak ends, you have 24 hours to complete your quests and maintain your streak.',
                              });
                            }
                          }}
                          className="w-full mt-3 bg-purple-600 hover:bg-purple-700" 
                          size="sm" 
                          data-testid={`use-${item.id}`}
                        >
                          Use Now
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Main Quest History */}
            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <History className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Main Quest History</h3>
                </div>

                {!gameState.mainQuestHistory || gameState.mainQuestHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="text-lg text-gray-300 mb-2">No quest history yet</p>
                    <p className="text-sm text-gray-500">Complete your first main quest to see it here!</p>
                  </div>
                ) : (
                  <>
                    {gameState.mainQuestHistory.map((quest, index) => {
                      const isCompleted = quest.status === 'completed';
                      const completedObjectives = quest.objectives?.filter(o => o.completed).length || 0;
                      const totalObjectives = quest.objectives?.length || 0;
                      
                      return (
                        <motion.div
                          key={quest.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-white mb-1">{quest.title}</h4>
                              <div className="flex items-center gap-3 text-sm">
                                {isCompleted ? (
                                  <>
                                    <span className="text-green-400 flex items-center gap-1">
                                      ✅ Completed
                                    </span>
                                    <span className="text-gray-400">
                                      {new Date(quest.completedAt).toLocaleDateString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-orange-400 flex items-center gap-1">
                                    ⏳ In Progress
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-400">+{quest.xpEarned || 200} XP</div>
                              <div className="text-sm text-gray-400">{completedObjectives}/{totalObjectives} objectives</div>
                            </div>
                          </div>

                          {quest.objectives && quest.objectives.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm text-gray-400 mb-2">Objectives:</div>
                              {quest.objectives.map((objective, objIndex) => (
                                <div key={objIndex} className="flex items-center gap-2 text-sm">
                                  <span className={objective.completed ? 'text-green-400' : 'text-gray-500'}>
                                    {objective.completed ? '✓' : '○'}
                                  </span>
                                  <span className={objective.completed ? 'text-gray-300' : 'text-gray-500'}>
                                    {objective.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    <div className="mt-6 bg-white/5 rounded-lg p-4 text-center">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-white">{gameState.mainQuestHistory.length}</div>
                          <div className="text-sm text-gray-400">Total Main Quests</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {gameState.mainQuestHistory.filter(q => q.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-400">Completed</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 5: Stats */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Total XP Earned</div>
                  <div className="text-3xl font-bold text-white">{stats.totalXP.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Total Quests Completed</div>
                  <div className="text-3xl font-bold text-white">{stats.totalQuests}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Current Daily Streak</div>
                  <div className="text-3xl font-bold text-orange-400">🔥 {stats.dailyStreak}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Longest Daily Streak</div>
                  <div className="text-3xl font-bold text-purple-400">⚡ {stats.longestDailyStreak}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Total Coins Earned</div>
                  <div className="text-3xl font-bold text-yellow-400">🪙 {stats.totalCoins}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Total Coins Spent</div>
                  <div className="text-3xl font-bold text-gray-400">{stats.coinsSpent}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Avatar Selection Modal */}
      <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Change Avatar</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Unlocked Avatars */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Your Avatars</h3>
              <div className="grid grid-cols-4 gap-3">
                {unlockedAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar)}
                    className={`text-4xl p-4 rounded-lg transition-all ${
                      selectedAvatar === avatar.emoji
                        ? 'bg-blue-600 scale-110 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    data-testid={`avatar-select-${avatar.id}`}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Locked Premium Avatars */}
            {lockedAvatars.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Locked Premium Avatars
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {lockedAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleSelectAvatar(avatar)}
                      className="relative text-4xl p-4 rounded-lg bg-white/5 opacity-50 hover:opacity-70 transition-all"
                      data-testid={`avatar-locked-${avatar.id}`}
                    >
                      {avatar.emoji}
                      <div className="absolute top-1 right-1 text-lg">🔒</div>
                      <div className="absolute bottom-1 left-0 right-0 text-xs text-yellow-400 font-bold">
                        {avatar.price} 🪙
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 bg-blue-500/10 rounded-lg p-3">
                  💡 Purchase locked avatars in the Reward Store!
                </p>
              </div>
            )}

            {/* Mythical Avatars - Unlocked */}
            {unlockedMythical.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">✨</span>
                  Mythical Characters
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {unlockedMythical.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleSelectAvatar(avatar)}
                      className={`relative text-4xl p-4 rounded-lg transition-all border-2 ${
                        selectedAvatar === avatar.emoji
                          ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/50'
                          : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 hover:border-yellow-400/70'
                      }`}
                      data-testid={`avatar-mythical-${avatar.id}`}
                    >
                      {avatar.emoji}
                      <div className="absolute -top-1 -right-1 text-sm">✨</div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-yellow-300 mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  ✨ Mythical characters earned through special achievements!
                </p>
              </div>
            )}

            {/* Mythical Avatars - Locked */}
            {lockedMythical.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  Locked Mythical Characters
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {lockedMythical.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="relative text-4xl p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-2 border-yellow-500/30 opacity-50"
                      title="These characters can only be obtained through special achievements, not purchasable."
                      data-testid={`avatar-mythical-locked-${avatar.id}`}
                    >
                      {avatar.emoji}
                      <div className="absolute top-1 right-1 text-lg">🔒</div>
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] text-yellow-400 font-bold text-center bg-black/50 py-1 rounded-b-lg">
                        Achievement
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  🏆 These characters can only be obtained through special achievements, not purchasable.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSaveAvatar} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Avatar
            </Button>
            <Button variant="ghost" onClick={() => setShowAvatarSelector(false)} className="text-gray-300">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Use Confirmation Modal */}
      <ItemUseConfirmModal
        isOpen={confirmingItem !== null}
        onClose={() => setConfirmingItem(null)}
        onConfirm={() => {
          if (confirmingItem?.type === 'xp_multiplier') {
            onUseXPMultiplier();
          } else if (confirmingItem?.type === 'streak_freeze') {
            onUseStreakFreeze();
          }
          setConfirmingItem(null);
        }}
        itemData={confirmingItem}
      />
    </>
  );
};

export default ProfileModal;
