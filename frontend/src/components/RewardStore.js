import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Coins, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmModal from './ConfirmModal';
import { PAID_AVATARS } from '../utils/avatars';

const storeItems = [
  {
    id: 'streak_freeze',
    icon: '❄️',
    name: 'Streak Freeze',
    description: 'Freeze your streak! When your streak would break, you have 24 hours to complete your quests and maintain it.',
    price: 30,
    available: true,
    type: 'item'
  },
  {
    id: 'xp_multiplier',
    icon: '⚡',
    name: 'XP Multiplier',
    description: '2x XP for 2 Hours! All quests give double experience points.',
    price: 50,
    available: true,
    type: 'item'
  },
];

const RewardStore = ({ isOpen, onClose, coins, unlockedAvatars = [], onPurchase, onPurchaseAvatar }) => {
  const [purchasingItem, setPurchasingItem] = useState(null);
  const [purchasingAvatar, setPurchasingAvatar] = useState(null);

  const handlePurchaseClick = (item) => {
    if (coins >= item.price) {
      setPurchasingItem(item);
    }
  };

  const handleAvatarPurchaseClick = (avatar) => {
    if (coins >= avatar.price && !unlockedAvatars.includes(avatar.id)) {
      setPurchasingAvatar(avatar);
    }
  };

  const confirmPurchase = () => {
    if (purchasingItem) {
      onPurchase(purchasingItem);
      setPurchasingItem(null);
    }
  };

  const confirmAvatarPurchase = () => {
    if (purchasingAvatar) {
      onPurchaseAvatar(purchasingAvatar);
      setPurchasingAvatar(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="reward-store-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-white">
              <ShoppingBag className="w-8 h-8 text-yellow-400" />
              Reward Store
            </DialogTitle>
            <div className="flex items-center gap-2 text-xl font-bold text-yellow-400 mt-2">
              <Coins className="w-6 h-6" />
              Your Coins: {coins}
            </div>
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {/* Power-ups Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                ⚡ Power-ups & Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storeItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 ${
                      item.comingSoon
                        ? 'border-gray-700 opacity-60'
                        : coins >= item.price
                        ? 'border-yellow-500/50 hover:border-yellow-500'
                        : 'border-red-500/30'
                    }`}
                    data-testid={`store-item-${item.id}`}
                  >
                    {item.comingSoon && (
                      <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full font-bold">
                        Coming Soon
                      </div>
                    )}

                    <div className="text-6xl text-center mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-300 text-center mb-4">{item.description}</p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-400">{item.price}</span>
                    </div>

                    <Button
                      onClick={() => handlePurchaseClick(item)}
                      disabled={!item.available || coins < item.price}
                      className={`w-full ${
                        item.available && coins >= item.price
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                      data-testid={`buy-${item.id}`}
                    >
                      {item.comingSoon
                        ? 'Coming Soon'
                        : coins < item.price
                        ? `Need ${item.price - coins} more coins`
                        : `Buy for ${item.price} 🪙`}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Premium Avatars Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                🎭 Premium Avatars
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {PAID_AVATARS.map((avatar, index) => {
                  const isOwned = unlockedAvatars.includes(avatar.id);
                  const canAfford = coins >= avatar.price;
                  
                  return (
                    <motion.div
                      key={avatar.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 ${
                        isOwned
                          ? 'border-green-500/50'
                          : canAfford
                          ? 'border-purple-500/50 hover:border-purple-500'
                          : 'border-gray-700'
                      }`}
                      data-testid={`avatar-store-${avatar.id}`}
                    >
                      <div className="text-5xl text-center mb-2">{avatar.emoji}</div>
                      <h4 className="text-sm font-bold text-white text-center mb-1">{avatar.name}</h4>
                      
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-lg font-bold text-yellow-400">{avatar.price}</span>
                      </div>

                      <Button
                        onClick={() => handleAvatarPurchaseClick(avatar)}
                        disabled={isOwned || !canAfford}
                        size="sm"
                        className={`w-full text-xs ${
                          isOwned
                            ? 'bg-green-600 cursor-default'
                            : canAfford
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                        data-testid={`buy-avatar-${avatar.id}`}
                      >
                        {isOwned ? 'Owned ✓' : canAfford ? 'Purchase' : 'Not enough coins'}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4 bg-blue-500/10 rounded-lg p-3">
                💡 Purchased avatars can be changed in your Profile!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Purchase Confirmation */}
      <ConfirmModal
        isOpen={purchasingItem !== null}
        onClose={() => setPurchasingItem(null)}
        onConfirm={confirmPurchase}
        title="Confirm Purchase"
        description={`Buy ${purchasingItem?.name} for ${purchasingItem?.price} coins?`}
        confirmText="Buy Now"
      />

      {/* Avatar Purchase Confirmation */}
      <ConfirmModal
        isOpen={purchasingAvatar !== null}
        onClose={() => setPurchasingAvatar(null)}
        onConfirm={confirmAvatarPurchase}
        title={`Purchase ${purchasingAvatar?.name}?`}
        description={`Unlock the ${purchasingAvatar?.name} avatar for ${purchasingAvatar?.price} coins? You can change to it anytime in your Profile.`}
        confirmText="Yes, Purchase"
      />
    </>
  );
};

export default RewardStore;
