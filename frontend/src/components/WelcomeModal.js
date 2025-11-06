import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react';

const WelcomeModal = ({ isOpen, onGoogleLogin, onContinueWithoutAccount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('🔵 [WelcomeModal] Google popup returned successfully');
    console.log('🔵 [WelcomeModal] Credential response:', { 
      hasCredential: !!credentialResponse.credential,
      credentialPreview: credentialResponse.credential ? credentialResponse.credential.substring(0, 50) + '...' : 'none'
    });
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = credentialResponse.credential;
      console.log('🔵 [WelcomeModal] Calling onGoogleLogin with token');
      await onGoogleLogin(token);
      console.log('🟢 [WelcomeModal] onGoogleLogin completed successfully');
    } catch (err) {
      console.error('🔴 [WelcomeModal] Login error:', {
        message: err.message,
        stack: err.stack,
        fullError: err
      });
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again or continue without an account.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-lg border border-white/20"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center py-8">
          {/* Animated Hero */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🧙
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            Welcome to Ascend
            <Sparkles className="w-10 h-10 text-yellow-400" />
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Transform your life into an epic RPG adventure. Level up by completing real-world quests and achieving your goals!
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Daily Quests & Goals</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Level Up System</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Earn XP & Coins</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Unlock Rewards</p>
            </div>
          </div>

          {/* Google Login Section */}
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-300">
                <span className="font-bold">💾 Save your progress:</span> Login with Google to sync your data across all devices!
              </p>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center mb-4">
              {isLoading ? (
                <div className="bg-white rounded-lg px-6 py-3">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : isOpen ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="filled_blue"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              ) : null}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
              >
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

            {/* Continue Without Account */}
            <Button
              onClick={onContinueWithoutAccount}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              disabled={isLoading}
            >
              Continue without account
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              Without an account, your progress is saved locally and won't sync across devices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
