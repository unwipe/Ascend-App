// Sound Effects Manager

class SoundManager {
  constructor() {
    this.sounds = {
      xpGain: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
      coinCollect: new Audio('https://assets.mixkit.co/active_storage/sfx/1998/1998-preview.mp3'),
      levelUp: new Audio('https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3')
    };
    
    // Set volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.3;
    });
    
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
