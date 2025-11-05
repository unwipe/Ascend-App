import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

const ItemUseConfirmModal = ({ isOpen, onClose, onConfirm, itemData }) => {
  if (!itemData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-lg border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            {itemData.icon} {itemData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-gray-300">
            {itemData.question || "Are you sure you want to activate it now?"}
          </p>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-300">
                You can only use this item once.
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              <strong>Effect:</strong> {itemData.effect}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid="confirm-use-item"
          >
            Activate Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemUseConfirmModal;
