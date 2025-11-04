import React, { useState } from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import ConfirmModal from './ConfirmModal';
import { APP_VERSION, APP_NAME } from '../utils/constants';

const SettingsModal = ({ isOpen, onClose, settings = {}, onResetAll, onToggleStreakMode }) => {
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [showStreakModeConfirm, setShowStreakModeConfirm] = useState(false);
  const [pendingStreakMode, setPendingStreakMode] = useState(null);

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleFinalConfirm = () => {
    onResetAll();
    setShowSecondConfirm(false);
    onClose();
  };

  const handleStreakModeToggle = (newValue) => {
    setPendingStreakMode(newValue);
    setShowStreakModeConfirm(true);
  };

  const confirmStreakModeChange = () => {
    if (pendingStreakMode !== null) {
      onToggleStreakMode(pendingStreakMode);
      setPendingStreakMode(null);
      setShowStreakModeConfirm(false);
    }
  };

  const cancelStreakModeChange = () => {
    setPendingStreakMode(null);
    setShowStreakModeConfirm(false);
  };

  const individualStreaksEnabled = settings.individualDailyStreaks || false;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-lg border border-white/20" data-testid="settings-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-white">
              <Settings className="w-6 h-6 text-gray-400" />
              Settings
            </DialogTitle>
          </DialogHeader>

          {/* Version Info - At Top */}
          <div className="text-center text-sm text-gray-400 border-b border-gray-700/50 pb-4">
            {APP_NAME} {APP_VERSION}
          </div>

          <div className="space-y-6 mt-4">
            {/* Daily Streak Mode */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Daily Streak Mode</h3>
                <Switch
                  checked={individualStreaksEnabled}
                  onCheckedChange={handleStreakModeToggle}
                  data-testid="individual-streaks-toggle"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-300 font-medium">
                  {individualStreaksEnabled ? '✅ Individual Streaks Enabled' : '🔥 Global Streak Mode (Default)'}
                </p>
                
                {individualStreaksEnabled ? (
                  <p className="text-gray-400">
                    Each Daily Quest tracks its own streak separately. Missing one quest won't break your other streaks.
                  </p>
                ) : (
                  <p className="text-gray-400">
                    All daily quests share one streak. Missing ANY daily quest breaks ALL daily streaks.
                  </p>
                )}
              </div>

              <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-xs text-orange-300">
                  ⚠️ Changing streak modes will reset all current daily streaks to 0.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                This will reset Level (to 1), XP (to 0), Coins (to 0), and clear all Main/Side/Daily/Weekly quests and streaks.
              </p>
              <Button
                onClick={() => setShowFirstConfirm(true)}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
                data-testid="reset-all-data-btn"
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Data Confirmations */}
      <ConfirmModal
        isOpen={showFirstConfirm}
        onClose={() => setShowFirstConfirm(false)}
        onConfirm={handleFirstConfirm}
        title="Reset All Data?"
        description="Are you sure? This will reset Level, XP, Coins, and all quests."
        confirmText="Yes, Reset"
        variant="danger"
      />

      <ConfirmModal
        isOpen={showSecondConfirm}
        onClose={() => setShowSecondConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="Final Confirmation"
        description="This action cannot be undone. Reset everything now?"
        confirmText="Reset Everything Now"
        variant="danger"
      />

      {/* Streak Mode Change Confirmation */}
      <ConfirmModal
        isOpen={showStreakModeConfirm}
        onClose={cancelStreakModeChange}
        onConfirm={confirmStreakModeChange}
        title="⚠️ Change Streak Mode?"
        description={`Switching to ${pendingStreakMode ? 'Individual' : 'Global'} streak mode will reset all current daily streaks to 0. Are you sure you want to continue?`}
        confirmText="Yes, Change Mode"
        variant="danger"
      />
    </>
  );
};

export default SettingsModal;
