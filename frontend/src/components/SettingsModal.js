import React, { useState } from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import ConfirmModal from './ConfirmModal';

const SettingsModal = ({ isOpen, onClose, onResetAll }) => {
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleFinalConfirm = () => {
    onResetAll();
    setShowSecondConfirm(false);
    onClose();
  };

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

          <div className="space-y-6 mt-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">General</h3>
              <div className="text-white">
                <p className="text-sm">Ascend v1.0</p>
                <p className="text-xs text-gray-500 mt-1">Gamified Productivity App</p>
              </div>
            </div>

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
    </>
  );
};

export default SettingsModal;
