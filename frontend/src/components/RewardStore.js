import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Coins, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const storeItems = [
  {
    id: 'streak_saver',
    icon: '🛡️',
    name: 'Streak Saver Token',
    description: 'Save a broken streak! Use this token to restore your daily or weekly streak when you miss a day.',
    price: 50,
    available: true
  },
  {
    id: 'xp_multiplier',
    icon: '⚡',
    name: 'XP Multiplier',
    description: '2x XP for 24 hours! All quests give double experience points.',
    price: 75,
    available: true
  },
  {
    id: 'theme_ocean',
    icon: '🌊',
    name: 'Ocean Blue Theme',
    description: 'Transform your dashboard with soothing ocean colors.',
    price: 100,
    available: false,
    comingSoon: true
  },
  {
    id: 'avatar_pack',
    icon: '👤',
    name: 'Avatar Cosmetics',
    description: 'Unlock premium avatars and customization options.',
    price: 150,
    available: false,
    comingSoon: true
  }
];

const RewardStore = ({ isOpen, onClose, coins, onPurchase }) => {
  const [purchasingItem, setPurchasingItem] = useState(null);

  const handlePurchaseClick = (item) => {
    if (coins >= item.price) {
      setPurchasingItem(item);
    }
  };

  const confirmPurchase = () => {
    if (purchasingItem) {
      onPurchase(purchasingItem);
      setPurchasingItem(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="reward-store-modal">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={purchasingItem !== null}
        onClose={() => setPurchasingItem(null)}
        onConfirm={confirmPurchase}
        title="Confirm Purchase"
        description={`Buy ${purchasingItem?.name} for ${purchasingItem?.price} coins?`}
        confirmText="Buy Now"
      />
    </>
  );
};

export default RewardStore;
