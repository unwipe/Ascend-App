import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit2, Trophy, Package, BarChart3, History, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLevelEmoji, getRankTitle } from '../utils/levelSystem';
import { achievements } from '../utils/achievements';
import { FREE_AVATARS, PAID_AVATARS, getUnlockedAvatars, getLockedAvatars } from '../utils/avatars';
import { toast } from 'sonner';

const ProfileModal = ({ isOpen, onClose, gameState, onUpdateProfile }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(gameState.username);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(gameState.avatar);

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

  const stats = {
    level: gameState.level,
    totalXP: gameState.totalXPEarned,
    dailyStreak: gameState.dailyStreak,
    weeklyStreak: gameState.weeklyStreak,
    longestDailyStreak: gameState.longestDailyStreak,
    longestWeeklyStreak: gameState.longestWeeklyStreak,
    totalQuests: gameState.totalQuestsCompleted,
    totalCoins: gameState.totalCoinsEarned,
    coinsSpent: gameState.totalCoinsSpent,
    memberSince: new Date(gameState.memberSince).toLocaleDateString()
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="profile-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Profile</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5 bg-white/5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" />Achievements</TabsTrigger>
              <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-2" />Inventory</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />Main Quest History</TabsTrigger>
              <TabsTrigger value="stats"><BarChart3 className="w-4 h-4 mr-2" />Stats</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <button
                      onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                      className="text-6xl hover:scale-110 transition-transform"
                      data-testid="avatar-button"
                    >
                      {gameState.avatar}
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

            {/* Tab 2: Achievements */}
            <TabsContent value="achievements">
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
            </TabsContent>

            {/* Tab 3: Inventory */}
            <TabsContent value="inventory">
              {gameState.inventory?.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Your inventory is empty.</p>
                  <p className="text-gray-500">Visit the Reward Store to get items!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gameState.inventory?.map((item, index) => (
                    <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="text-4xl text-center mb-2">{item.icon}</div>
                      <h3 className="font-bold text-white text-center">{item.name}</h3>
                      <p className="text-sm text-gray-400 text-center mt-2">{item.description}</p>
                      {item.canUse && (
                        <Button className="w-full mt-3" size="sm" data-testid={`use-${item.id}`}>
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
                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No Main Quests completed yet.</p>
                    <p className="text-gray-500">Start your first Main Quest to see it here!</p>
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

            {/* Locked Avatars */}
            {lockedAvatars.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Locked Avatars
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
    </>
  );
};

export default ProfileModal;
