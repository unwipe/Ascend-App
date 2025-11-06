// Sound Effects Manager

class SoundManager {
  constructor() {
    this.sounds = {
      xpGain: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
      coinCollect: new Audio('https://assets.mixkit.co/active_storage/sfx/1998/1998-preview.mp3'),
      levelUp: new Audio('https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3'),
      questComplete: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'), // Achievement notification
      streakMilestone: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'), // Positive achievement
      phoenixUnlock: new Audio('https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3'), // Epic achievement (same as levelUp but louder)
      itemPurchase: new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'), // Cash register sound
      itemUse: new Audio('https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3'), // Power up sound
      promoRedeem: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'), // Success notification
      click: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3') // UI click sound
    };
    
    // Set volumes for each sound
    this.sounds.xpGain.volume = 0.3;
    this.sounds.coinCollect.volume = 0.2; // Quieter coin sound
    this.sounds.levelUp.volume = 0.3;
    this.sounds.questComplete.volume = 0.25;
    this.sounds.streakMilestone.volume = 0.35; // Slightly louder for emphasis
    this.sounds.phoenixUnlock.volume = 0.5; // Epic moment deserves louder sound
    this.sounds.itemPurchase.volume = 0.25;
    this.sounds.itemUse.volume = 0.3;
    this.sounds.promoRedeem.volume = 0.3;
    this.sounds.click.volume = 0.15; // Very subtle for UI feedback
    
    // Speed up coin sound to make it shorter
    this.sounds.coinCollect.playbackRate = 1.3; // 30% faster = shorter duration
    
    this.enabled = true;
  }
  
  play(soundName) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Sound play failed:', err));
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
