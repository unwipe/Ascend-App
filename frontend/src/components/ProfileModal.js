import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit2, Trophy, Package, BarChart3, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLevelEmoji, getRankTitle } from '../utils/levelSystem';
import { achievements } from '../utils/achievements';

const ProfileModal = ({ isOpen, onClose, gameState, onUpdateProfile }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(gameState.username);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const avatarOptions = ['😊', '🦸', '🧑‍💻', '🎨', '🏃', '🧠', '🎮', '🌟', '🦁', '🐉', '🚀', '⚡'];

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      onUpdateProfile({ username: tempUsername.trim() });
      setIsEditingUsername(false);
    }
  };

  const handleSelectAvatar = (emoji) => {
    onUpdateProfile({ avatar: emoji });
    setShowAvatarSelector(false);
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" />Achievements</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-2" />Inventory</TabsTrigger>
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
                  {showAvatarSelector && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg p-3 grid grid-cols-4 gap-2 z-50">
                      {avatarOptions.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleSelectAvatar(emoji)}
                          className="text-3xl hover:bg-white/10 p-2 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
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
                    className={`p-4 rounded-xl border-2 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                        : 'bg-white/5 border-gray-700 opacity-50'
                    }`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                    <h3 className="font-bold text-white text-center mb-1">{achievement.title}</h3>
                    <p className="text-xs text-gray-400 text-center">{achievement.description}</p>
                    {isUnlocked && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-400">✓ Unlocked</span>
                      </div>
                    )}
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

          {/* Tab 4: Stats */}
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
  );
};

export default ProfileModal;
