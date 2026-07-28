// Web Audio API Synthesizer (Zero External Assets)
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.voidHumOsc = null;
    this.voidHumGain = null;
    this.lastVoidDeg = -1;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playJump() {
    this.playTone(320, 'sine', 0.12, 0.15);
  }

  playDoubleJump() {
    this.playTone(480, 'triangle', 0.15, 0.18);
  }

  playLand() {
    this.playTone(120, 'square', 0.08, 0.1);
  }

  playSpikeHit() {
    this.playTone(90, 'sawtooth', 0.35, 0.25);
  }

  playLapComplete() {
    this.playTone(523.25, 'sine', 0.12, 0.15);
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.15), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.2), 200);
  }

  startVoidHum() {
    if (this.voidHumOsc || !this.ctx || this.isMuted) return;
    try {
      this.voidHumOsc = this.ctx.createOscillator();
      this.voidHumGain = this.ctx.createGain();

      this.voidHumOsc.type = 'sawtooth';
      this.voidHumOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.voidHumGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.voidHumOsc.connect(this.voidHumGain);
      this.voidHumGain.connect(this.ctx.destination);

      this.voidHumOsc.start();
    } catch (e) {}
  }

  updateVoidProximity(degDiff) {
    if (!this.ctx || this.isMuted) return;

    // Throttle audio parameter updates to avoid CPU overhead
    if (Math.abs(degDiff - this.lastVoidDeg) < 2) return;
    this.lastVoidDeg = degDiff;

    if (!this.voidHumOsc) {
      this.startVoidHum();
    }

    if (this.voidHumGain && this.voidHumOsc) {
      const urgency = Math.max(0, 1 - (degDiff / 90));
      const targetGain = urgency * 0.12;
      const targetFreq = 55 + (urgency * 90);

      this.voidHumGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
      this.voidHumOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }
  }

  stopVoidHum() {
    if (this.voidHumOsc) {
      try {
        this.voidHumOsc.stop();
        this.voidHumOsc.disconnect();
      } catch (e) {}
      this.voidHumOsc = null;
      this.voidHumGain = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopVoidHum();
    }
    return this.isMuted;
  }
}

export const sounds = new SoundSystem();
