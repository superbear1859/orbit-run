import { sounds } from './audio.js';
import { PLANET_RADIUS, getLapData } from './levels.js';
import {
  CHARACTERS,
  loadPurchasedCharacters,
  savePurchasedCharacters,
  loadCrystalBank,
  saveCrystalBank,
  loadSelectedCharacter,
  saveSelectedCharacter,
  loadMaxDistanceMeters,
  saveMaxDistanceMeters
} from './characters.js';

// Game Constants
const CANVAS_SIZE = 900;
const CENTER_X = CANVAS_SIZE / 2; // 450
const VIEW_CENTER_Y = 780;

const GRAVITY = 0.45;
const JUMP_IMPULSE_BASE = 11.2;
const DOUBLE_JUMP_IMPULSE_BASE = 9.8;
const MAX_RUN_SPEED_BASE = 0.024;
const RUN_ACCEL_BASE = 0.0020;
const FRICTION = 0.86;

const COYOTE_TIME_MAX = 8;
const JUMP_BUFFER_MAX = 6;

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Character State, Crystal Bank & Persistence
    this.purchasedCharIds = loadPurchasedCharacters();
    this.selectedCharId = loadSelectedCharacter();
    this.selectedChar = CHARACTERS.find(c => c.id === this.selectedCharId) || CHARACTERS[0];
    this.crystalBank = loadCrystalBank();
    this.maxDistanceMeters = loadMaxDistanceMeters();
    this.isMobileMode = false;

    // Characters whose distance requirement has been met in any run
    this.availableShopCharIds = this.loadAvailableShopCharacters();

    // Ability & Shield Protection State
    this.dashCooldownTimerMs = 0;
    this.solarCooldownTimerMs = 0;
    this.phaseCooldownTimerMs = 0;
    this.phaseActiveTimerMs = 0;
    this.shieldCharges = 0;
    this.shieldInvulnerableTimerMs = 0;

    // Toast Notification
    this.toastTimerMs = 0;

    // Countdown Interval Reference
    this.countdownInterval = null;

    // State Variables
    this.state = 'START';
    this.currentLapIndex = 0;
    this.currentLapData = getLapData(0);

    const START_ANGLE = -Math.PI / 2;
    const START_RADIUS = PLANET_RADIUS + 50;

    // Player Object
    this.player = {
      angle: START_ANGLE,
      radius: START_RADIUS,
      radialVel: 0,
      angularVel: 0,
      width: 24,
      height: 32,
      isGrounded: true,
      coyoteTimer: COYOTE_TIME_MAX,
      jumpBufferTimer: 0,
      jumpCount: 0,
      facing: 1,
      trail: [],
      isDashing: false,
      dashTimerMs: 0
    };

    // Void Wall Object
    this.void = {
      angle: START_ANGLE - (Math.PI * 0.33),
      speed: 0.0055,
      glowPulse: 0
    };

    // Game Metrics
    this.totalDistanceMeters = 0;
    this.crystalsCollected = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.bestTime = parseFloat(localStorage.getItem('orbit_run_best_time') || 0);

    // Controls Input State
    this.keys = {
      left: false,
      right: false,
      jump: false,
      ability: false
    };

    // Particles & Pre-rendered Starfield for 60FPS Performance
    this.particles = [];
    this.stars = this.generateStarfield();
    this.starCanvas = this.preRenderStarfield();

    // DOM Elements
    this.dom = {
      timerDisplay: document.getElementById('timerDisplay'),
      distanceMeters: document.getElementById('distanceMeters'),
      distanceDegrees: document.getElementById('distanceDegrees'),
      distanceBox: document.getElementById('distanceBox'),
      radarBar: document.getElementById('radarBar'),
      proximityAlert: document.getElementById('proximityAlert'),
      lapDisplay: document.getElementById('lapDisplay'),
      lapName: document.getElementById('lapName'),
      crystalDisplay: document.getElementById('crystalDisplay'),
      soundBtn: document.getElementById('soundBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      charRosterBtn: document.getElementById('charRosterBtn'),
      deviceSelectBtn: document.getElementById('deviceSelectBtn'),
      touchControls: document.getElementById('touchControls'),
      btnTouchLeft: document.getElementById('btnTouchLeft'),
      btnTouchRight: document.getElementById('btnTouchRight'),
      btnTouchJump: document.getElementById('btnTouchJump'),
      btnTouchAbility: document.getElementById('btnTouchAbility'),
      controlsHint: document.getElementById('controlsHint'),
      deviceOverlay: document.getElementById('deviceOverlay'),
      selectDesktopBtn: document.getElementById('selectDesktopBtn'),
      selectMobileBtn: document.getElementById('selectMobileBtn'),
      startOverlay: document.getElementById('startOverlay'),
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      charModalOverlay: document.getElementById('charModalOverlay'),
      countdownOverlay: document.getElementById('countdownOverlay'),
      countdownNumber: document.getElementById('countdownNumber'),
      startBtn: document.getElementById('startBtn'),
      retryBtn: document.getElementById('retryBtn'),
      resumeBtn: document.getElementById('resumeBtn'),
      openRosterBtn: document.getElementById('openRosterBtn'),
      deathRosterBtn: document.getElementById('deathRosterBtn'),
      closeRosterBtn: document.getElementById('closeRosterBtn'),
      resetCharsBtn: document.getElementById('resetCharsBtn'),
      characterGrid: document.getElementById('characterGrid'),
      deathReason: document.getElementById('deathReason'),
      finalTime: document.getElementById('finalTime'),
      finalDistance: document.getElementById('finalDistance'),
      finalLap: document.getElementById('finalLap'),
      finalCrystals: document.getElementById('finalCrystals'),
      activeCharName: document.getElementById('activeCharName'),
      activeCharAbility: document.getElementById('activeCharAbility'),
      abilityLabel: document.getElementById('abilityLabel'),
      charNameBadge: document.getElementById('charNameBadge'),
      dashCooldownBar: document.getElementById('dashCooldownBar'),
      dashFill: document.getElementById('dashFill'),
      shieldCountBadge: document.getElementById('shieldCountBadge'),
      abilityKeyHint: document.getElementById('abilityKeyHint'),
      maxDistanceDisplay: document.getElementById('maxDistanceDisplay'),
      crystalBankDisplay: document.getElementById('crystalBankDisplay'),
      unlockToast: document.getElementById('unlockToast'),
      toastCharName: document.getElementById('toastCharName'),
      toastCharAbility: document.getElementById('toastCharAbility')
    };

    this.initEventListeners();
    this.initTouchControls();
    this.updateActiveCharacterDisplay();

    // ALWAYS show device selection prompt on initial load!
    this.dom.deviceOverlay.classList.remove('hidden');
    this.dom.startOverlay.classList.add('hidden');

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setDeviceMode(isMobile, showStartOverlay = true) {
    this.isMobileMode = isMobile;
    localStorage.setItem('orbit_run_device', isMobile ? 'mobile' : 'desktop');

    if (isMobile) {
      this.dom.touchControls.classList.remove('hidden');
      this.dom.controlsHint.classList.add('hidden');
    } else {
      this.dom.touchControls.classList.add('hidden');
      this.dom.controlsHint.classList.remove('hidden');
    }

    this.dom.deviceOverlay.classList.add('hidden');

    if (showStartOverlay && this.state === 'START') {
      this.dom.startOverlay.classList.remove('hidden');
    }
  }

  loadAvailableShopCharacters() {
    const saved = localStorage.getItem("orbit_run_shop_available");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ["cyan_runner"];
  }

  saveAvailableShopCharacters() {
    localStorage.setItem("orbit_run_shop_available", JSON.stringify(this.availableShopCharIds));
  }

  generateStarfield() {
    const stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * CANVAS_SIZE,
        y: Math.random() * CANVAS_SIZE,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
    return stars;
  }

  preRenderStarfield() {
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const octx = offscreen.getContext('2d');

    for (const star of this.stars) {
      octx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      octx.fillRect(star.x, star.y, star.size, star.size);
    }
    return offscreen;
  }

  initTouchControls() {
    const bindBtn = (element, onPress, onRelease) => {
      const start = (e) => {
        e.preventDefault();
        element.classList.add('active');
        onPress();
      };
      const end = (e) => {
        e.preventDefault();
        element.classList.remove('active');
        if (onRelease) onRelease();
      };

      element.addEventListener('pointerdown', start);
      element.addEventListener('pointerup', end);
      element.addEventListener('pointercancel', end);
      element.addEventListener('pointerleave', end);

      element.addEventListener('touchstart', start, { passive: false });
      element.addEventListener('touchend', end, { passive: false });
    };

    bindBtn(this.dom.btnTouchLeft, () => { this.keys.left = true; }, () => { this.keys.left = false; });
    bindBtn(this.dom.btnTouchRight, () => { this.keys.right = true; }, () => { this.keys.right = false; });

    bindBtn(this.dom.btnTouchJump, () => {
      this.player.jumpBufferTimer = JUMP_BUFFER_MAX;
      this.keys.jump = true;
    }, () => {
      this.keys.jump = false;
      if (this.player.radialVel > 0 && !this.selectedChar.stats.hasFloat) {
        this.player.radialVel *= 0.5;
      }
    });

    bindBtn(this.dom.btnTouchAbility, () => {
      this.handleAbilityPress();
    });
  }

  activateUnlockAllCheat() {
    this.purchasedCharIds = CHARACTERS.map(c => c.id);
    this.availableShopCharIds = CHARACTERS.map(c => c.id);
    this.crystalBank = 9999;
    this.maxDistanceMeters = Math.max(this.maxDistanceMeters, 500);

    savePurchasedCharacters(this.purchasedCharIds);
    this.saveAvailableShopCharacters();
    saveCrystalBank(this.crystalBank);
    saveMaxDistanceMeters(this.maxDistanceMeters);

    sounds.playLapComplete();

    this.dom.toastCharName.textContent = "👑 CHEAT UNLOCKED!";
    this.dom.toastCharName.style.color = "#facc15";
    this.dom.toastCharAbility.textContent = "ALL 16 CHARACTERS UNLOCKED + 9999 💎!";
    this.dom.unlockToast.classList.remove('hidden');
    this.toastTimerMs = 5000;

    this.renderCharacterGrid();
  }

  resetCharacters() {
    if (confirm("Are you sure you want to lock all characters except Cyan Runner and reset your gems to 0?")) {
      this.purchasedCharIds = ["cyan_runner"];
      this.availableShopCharIds = ["cyan_runner"];
      this.selectedCharId = "cyan_runner";
      this.selectedChar = CHARACTERS[0];
      this.crystalBank = 0;
      this.maxDistanceMeters = 0;

      savePurchasedCharacters(this.purchasedCharIds);
      this.saveAvailableShopCharacters();
      saveSelectedCharacter(this.selectedCharId);
      saveCrystalBank(0);
      saveMaxDistanceMeters(0);

      sounds.playSpikeHit();

      this.updateActiveCharacterDisplay();
      this.renderCharacterGrid();

      this.dom.toastCharName.textContent = "🔄 CHARACTERS & GEMS RESET";
      this.dom.toastCharName.style.color = "#f43f5e";
      this.dom.toastCharAbility.textContent = "All characters locked & gems reset to 0!";
      this.dom.unlockToast.classList.remove('hidden');
      this.toastTimerMs = 4000;
    }
  }

  initEventListeners() {
    let cheatBuffer = "";
    const CHEAT_CODE = "superbear1859yyyyy";

    window.addEventListener('keydown', (e) => {
      if (e.key && e.key.length === 1) {
        cheatBuffer += e.key.toLowerCase();
        if (cheatBuffer.length > CHEAT_CODE.length) {
          cheatBuffer = cheatBuffer.slice(-CHEAT_CODE.length);
        }

        if (cheatBuffer === CHEAT_CODE) {
          cheatBuffer = "";
          this.activateUnlockAllCheat();
        }
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.player.jumpBufferTimer = JUMP_BUFFER_MAX;
        this.keys.jump = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE') {
        this.handleAbilityPress();
      }
      if (e.code === 'KeyC') {
        this.toggleRosterModal();
      }
      if (e.code === 'KeyR') {
        if (this.state === 'GAMEOVER' || this.state === 'RUNNING') {
          this.startCountdown();
        }
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
      if (e.code === 'KeyM') {
        this.toggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.keys.jump = false;
        if (this.player.radialVel > 0 && !this.selectedChar.stats.hasFloat) {
          this.player.radialVel *= 0.5;
        }
      }
    });

    this.dom.selectDesktopBtn.addEventListener('click', () => this.setDeviceMode(false, true));
    this.dom.selectMobileBtn.addEventListener('click', () => this.setDeviceMode(true, true));
    this.dom.deviceSelectBtn.addEventListener('click', () => {
      this.dom.deviceOverlay.classList.remove('hidden');
    });

    this.dom.startBtn.addEventListener('click', () => this.startCountdown());
    this.dom.retryBtn.addEventListener('click', () => this.startCountdown());
    this.dom.resumeBtn.addEventListener('click', () => this.togglePause());
    this.dom.soundBtn.addEventListener('click', () => this.toggleMute());
    this.dom.pauseBtn.addEventListener('click', () => this.togglePause());
    this.dom.charRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.openRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.deathRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.closeRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.resetCharsBtn.addEventListener('click', () => this.resetCharacters());
  }

  toggleMute() {
    const isMuted = sounds.toggleMute();
    this.dom.soundBtn.textContent = isMuted ? '🔇' : '🔊';
  }

  togglePause() {
    if (this.state === 'RUNNING') {
      this.state = 'PAUSED';
      sounds.stopVoidHum();
      this.dom.pauseOverlay.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'RUNNING';
      this.dom.pauseOverlay.classList.add('hidden');
    }
  }

  toggleRosterModal() {
    if (this.dom.charModalOverlay.classList.contains('hidden')) {
      this.renderCharacterGrid();
      this.dom.maxDistanceDisplay.textContent = `${this.maxDistanceMeters.toFixed(1)} m`;
      this.dom.crystalBankDisplay.textContent = `💎 ${this.crystalBank}`;
      this.dom.charModalOverlay.classList.remove('hidden');
    } else {
      this.dom.charModalOverlay.classList.add('hidden');
    }
  }

  updateActiveCharacterDisplay() {
    this.dom.activeCharName.textContent = this.selectedChar.name;
    this.dom.activeCharName.style.color = this.selectedChar.color;
    this.dom.activeCharAbility.textContent = this.selectedChar.abilityName;

    this.dom.abilityLabel.textContent = `ABILITY: ${this.selectedChar.abilityName}`;
    this.dom.charNameBadge.textContent = this.selectedChar.name;
    this.dom.charNameBadge.style.color = this.selectedChar.color;

    if (this.selectedChar.stats.hasDash || this.selectedChar.stats.hasSolarBlast || this.selectedChar.stats.hasPhase) {
      this.dom.dashCooldownBar.classList.remove('hidden');
      this.dom.shieldCountBadge.classList.add('hidden');
      this.dom.abilityKeyHint.classList.remove('hidden');
    } else if (this.selectedChar.stats.hasShield) {
      this.dom.dashCooldownBar.classList.add('hidden');
      this.dom.shieldCountBadge.classList.remove('hidden');
      this.dom.abilityKeyHint.classList.add('hidden');
    } else {
      this.dom.dashCooldownBar.classList.add('hidden');
      this.dom.shieldCountBadge.classList.add('hidden');
      this.dom.abilityKeyHint.classList.add('hidden');
    }
  }

  renderCharacterGrid() {
    this.dom.characterGrid.innerHTML = "";
    this.dom.crystalBankDisplay.textContent = `💎 ${this.crystalBank}`;
    this.dom.maxDistanceDisplay.textContent = `${this.maxDistanceMeters.toFixed(1)} m`;

    CHARACTERS.forEach(char => {
      const isPurchased = this.purchasedCharIds.includes(char.id);
      const isAvailableInShop = this.availableShopCharIds.includes(char.id) || (this.maxDistanceMeters >= char.unlockDistanceMeters);
      const isSelected = char.id === this.selectedCharId;

      const card = document.createElement("div");
      card.className = `char-card ${isSelected ? 'selected' : ''} ${!isAvailableInShop && !isPurchased ? 'locked' : ''}`;

      let footerHtml = "";
      if (isPurchased) {
        footerHtml = `<button class="btn-select ${isSelected ? 'active' : ''}">${isSelected ? 'EQUIPPED' : 'EQUIP'}</button>`;
      } else if (isAvailableInShop) {
        const canAfford = this.crystalBank >= char.crystalCost;
        footerHtml = `<button class="btn-buy ${!canAfford ? 'disabled' : ''}">${canAfford ? `BUY (💎 ${char.crystalCost})` : `NEED 💎 ${char.crystalCost}`}</button>`;
      } else {
        footerHtml = `<span class="lock-badge">🔒 ${char.unlockCriteria}</span>`;
      }

      card.innerHTML = `
        <div class="char-header">
          <div class="char-color-dot" style="background: ${char.color}"></div>
          <div class="char-title-col">
            <span class="char-name">${char.name}</span>
            <span class="char-subtitle">${char.title}</span>
          </div>
        </div>
        <div class="char-ability-name">${char.abilityName}</div>
        <div class="char-ability-desc">${char.abilityDesc}</div>
        <div class="char-footer">${footerHtml}</div>
      `;

      if (isPurchased) {
        const btn = card.querySelector(".btn-select");
        btn.addEventListener("click", () => {
          this.selectedCharId = char.id;
          this.selectedChar = char;
          saveSelectedCharacter(char.id);
          this.updateActiveCharacterDisplay();
          this.renderCharacterGrid();
        });
      } else if (isAvailableInShop) {
        const buyBtn = card.querySelector(".btn-buy");
        buyBtn.addEventListener("click", () => {
          if (this.crystalBank >= char.crystalCost) {
            this.crystalBank -= char.crystalCost;
            saveCrystalBank(this.crystalBank);

            this.purchasedCharIds.push(char.id);
            savePurchasedCharacters(this.purchasedCharIds);

            this.selectedCharId = char.id;
            this.selectedChar = char;
            saveSelectedCharacter(char.id);

            sounds.playLapComplete();
            this.updateActiveCharacterDisplay();
            this.renderCharacterGrid();
          }
        });
      }

      this.dom.characterGrid.appendChild(card);
    });
  }

  checkCharacterUnlocksByDistance() {
    let newlyAvailableChar = null;

    CHARACTERS.forEach(char => {
      if (this.availableShopCharIds.includes(char.id)) return;

      if (this.totalDistanceMeters >= char.unlockDistanceMeters) {
        this.availableShopCharIds.push(char.id);
        newlyAvailableChar = char;
      }
    });

    if (newlyAvailableChar) {
      this.saveAvailableShopCharacters();
      sounds.playLapComplete();
      this.showToastNotification(newlyAvailableChar);
    }
  }

  showToastNotification(char) {
    this.dom.toastCharName.textContent = char.name;
    this.dom.toastCharName.style.color = char.color;
    this.dom.toastCharAbility.textContent = `UNLOCKED IN SHOP! Buy for 💎 ${char.crystalCost}`;
    this.dom.unlockToast.classList.remove('hidden');
    this.toastTimerMs = 4000;
  }

  handleAbilityPress() {
    if (this.state !== 'RUNNING') return;

    if (this.selectedChar.stats.hasDash && this.dashCooldownTimerMs <= 0) {
      this.player.isDashing = true;
      this.player.dashTimerMs = 300;
      this.dashCooldownTimerMs = this.selectedChar.stats.dashCooldownMs;

      this.player.angularVel = this.player.facing * (MAX_RUN_SPEED_BASE * 2.2);
      this.player.radialVel = 6.0;

      sounds.playDoubleJump();
      this.spawnDashParticles();
    }

    if (this.selectedChar.stats.hasSolarBlast && this.solarCooldownTimerMs <= 0) {
      this.solarCooldownTimerMs = this.selectedChar.stats.solarCooldownMs;

      let pushDegrees = 60;
      if (this.selectedChar.id === "void_slayer") {
        pushDegrees = 180;
      }

      const pushRad = (pushDegrees * Math.PI) / 180;
      this.void.angle -= pushRad;

      sounds.playSpikeHit();
      this.spawnSolarFlareParticles(pushDegrees);
    }

    if (this.selectedChar.stats.hasPhase && this.phaseCooldownTimerMs <= 0) {
      this.phaseCooldownTimerMs = this.selectedChar.stats.phaseCooldownMs;
      this.phaseActiveTimerMs = 3000;

      sounds.playDoubleJump();
      this.spawnPhaseParticles();
    }
  }

  spawnDashParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 3 + 2,
        color: this.selectedChar.color,
        life: 1,
        decay: 0.05
      });
    }
  }

  spawnSolarFlareParticles(pushDegrees = 60) {
    const pos = this.getPlayerWorldPos();
    const count = pushDegrees > 100 ? 65 : 35;
    const pColor = pushDegrees > 100 ? '#10b981' : '#f97316';
    const speed = pushDegrees > 100 ? 12 : 7;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 5 + 3,
        color: pColor,
        life: 1,
        decay: 0.025
      });
    }
  }

  spawnPhaseParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 4 + 2,
        color: '#a855f7',
        life: 1,
        decay: 0.04
      });
    }
  }

  startCountdown() {
    sounds.init();
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.resetState();
    this.state = 'COUNTDOWN';

    this.dom.deviceOverlay.classList.add('hidden');
    this.dom.startOverlay.classList.add('hidden');
    this.dom.gameOverOverlay.classList.add('hidden');
    this.dom.charModalOverlay.classList.add('hidden');
    this.dom.pauseOverlay.classList.add('hidden');

    this.dom.countdownOverlay.classList.remove('hidden');

    let count = 3;
    this.updateCountdownDisplay(count);

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.updateCountdownDisplay(count);
      } else if (count === 0) {
        this.updateCountdownDisplay("GO!");
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.dom.countdownOverlay.classList.add('hidden');
        this.state = 'RUNNING';
        this.startTime = performance.now();
      }
    }, 750);
  }

  updateCountdownDisplay(val) {
    const el = this.dom.countdownNumber;
    el.textContent = val;
    el.className = `countdown-num ${val === "GO!" ? 'go' : ''}`;

    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = null;

    if (typeof val === 'number') {
      sounds.playJump();
    } else {
      sounds.playLapComplete();
    }
  }

  startGame() {
    this.startCountdown();
  }

  restartGame() {
    this.startCountdown();
  }

  resetState() {
    this.currentLapIndex = 0;
    this.currentLapData = getLapData(0);
    this.crystalsCollected = 0;
    this.totalDistanceMeters = 0;
    this.elapsedTime = 0;
    this.particles = [];
    this.dashCooldownTimerMs = 0;
    this.solarCooldownTimerMs = 0;
    this.phaseCooldownTimerMs = 0;
    this.phaseActiveTimerMs = 0;
    this.shieldInvulnerableTimerMs = 0;

    this.shieldCharges = this.selectedChar.stats.hasShield ? (this.selectedChar.stats.shieldMaxPerLap || 1) : 0;

    const START_ANGLE = -Math.PI / 2;
    const START_RADIUS = PLANET_RADIUS + 50;

    this.player = {
      angle: START_ANGLE,
      radius: START_RADIUS,
      radialVel: 0,
      angularVel: 0,
      width: 24,
      height: 32,
      isGrounded: true,
      coyoteTimer: COYOTE_TIME_MAX,
      jumpBufferTimer: 0,
      jumpCount: 0,
      facing: 1,
      trail: [],
      isDashing: false,
      dashTimerMs: 0
    };

    this.void = {
      angle: START_ANGLE - (Math.PI * 0.33),
      speed: 0.0055,
      glowPulse: 0
    };

    this.updateHUD();
    this.updateActiveCharacterDisplay();
  }

  executeJump() {
    const jumpImpulse = JUMP_IMPULSE_BASE * this.selectedChar.stats.jumpMult;
    const doubleJumpImpulse = DOUBLE_JUMP_IMPULSE_BASE * this.selectedChar.stats.jumpMult;
    const maxJumps = this.selectedChar.stats.maxJumps || 2;

    if (this.player.isGrounded || this.player.coyoteTimer > 0) {
      this.player.radialVel = jumpImpulse;
      this.player.isGrounded = false;
      this.player.coyoteTimer = 0;
      this.player.jumpCount = 1;
      this.player.jumpBufferTimer = 0;
      sounds.playJump();
      this.spawnJumpParticles();
    } else if (this.player.jumpCount < maxJumps) {
      this.player.radialVel = doubleJumpImpulse;
      this.player.jumpCount++;
      this.player.jumpBufferTimer = 0;
      sounds.playDoubleJump();
      this.spawnDoubleJumpParticles();
    }
  }

  spawnJumpParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 3 + 2,
        color: this.selectedChar.color,
        life: 1,
        decay: 0.06
      });
    }
  }

  spawnDoubleJumpParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        radius: Math.random() * 3 + 2,
        color: this.selectedChar.trailColor,
        life: 1,
        decay: 0.05
      });
    }
  }

  spawnCrystalParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 3 + 2,
        color: '#fbbf24',
        life: 1,
        decay: 0.04
      });
    }
  }

  spawnDeathParticles(x, y) {
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? '#f43f5e' : '#9333ea',
        life: 1,
        decay: 0.03
      });
    }
  }

  getPlayerWorldPos() {
    const r = this.player.radius + this.player.height / 2;
    return {
      x: CENTER_X + Math.cos(this.player.angle) * r,
      y: VIEW_CENTER_Y + Math.sin(this.player.angle) * r
    };
  }

  getNormalizedDegrees(angleRad) {
    let deg = ((angleRad + Math.PI / 2) * 180 / Math.PI) % 360;
    if (deg < 0) deg += 360;
    return deg;
  }

  isAngleInArc(deg, startAngle, endAngle) {
    const normDeg = ((deg % 360) + 360) % 360;
    const normStart = ((startAngle % 360) + 360) % 360;
    const normEnd = ((endAngle % 360) + 360) % 360;

    if (normStart <= normEnd) {
      return normDeg >= normStart && normDeg <= normEnd;
    } else {
      return normDeg >= normStart || normDeg <= normEnd;
    }
  }

  update(dt) {
    if (this.state !== 'RUNNING') return;

    this.elapsedTime = performance.now() - this.startTime;

    if (this.toastTimerMs > 0) {
      this.toastTimerMs -= 16;
      if (this.toastTimerMs <= 0) {
        this.dom.unlockToast.classList.add('hidden');
      }
    }

    if (this.dashCooldownTimerMs > 0) {
      this.dashCooldownTimerMs = Math.max(0, this.dashCooldownTimerMs - 16);
    }
    if (this.solarCooldownTimerMs > 0) {
      this.solarCooldownTimerMs = Math.max(0, this.solarCooldownTimerMs - 16);
    }
    if (this.phaseCooldownTimerMs > 0) {
      this.phaseCooldownTimerMs = Math.max(0, this.phaseCooldownTimerMs - 16);
    }
    if (this.phaseActiveTimerMs > 0) {
      this.phaseActiveTimerMs = Math.max(0, this.phaseActiveTimerMs - 16);
    }
    if (this.shieldInvulnerableTimerMs > 0) {
      this.shieldInvulnerableTimerMs = Math.max(0, this.shieldInvulnerableTimerMs - 16);
    }

    const maxSpeed = MAX_RUN_SPEED_BASE * this.selectedChar.stats.speedMult;
    const accel = RUN_ACCEL_BASE * this.selectedChar.stats.speedMult;

    // 1. Angular Movement
    if (this.keys.right) {
      this.player.angularVel += accel;
      this.player.facing = 1;
    }
    if (this.keys.left) {
      this.player.angularVel -= accel;
      this.player.facing = -1;
    }

    if (!this.player.isDashing) {
      this.player.angularVel = Math.max(-maxSpeed, Math.min(maxSpeed, this.player.angularVel));
      this.player.angularVel *= FRICTION;
    } else {
      this.player.dashTimerMs -= 16;
      if (this.player.dashTimerMs <= 0) {
        this.player.isDashing = false;
      }
    }

    const prevAngle = this.player.angle;
    this.player.angle += this.player.angularVel;

    const arcDeltaRad = Math.abs(this.player.angle - prevAngle);
    const distDeltaMeters = (arcDeltaRad * PLANET_RADIUS) / 10;
    this.totalDistanceMeters += distDeltaMeters;

    if (this.totalDistanceMeters > this.maxDistanceMeters) {
      this.maxDistanceMeters = this.totalDistanceMeters;
      saveMaxDistanceMeters(this.maxDistanceMeters);
    }

    this.checkCharacterUnlocksByDistance();

    while (this.player.angle >= Math.PI * 1.5) {
      this.player.angle -= Math.PI * 2;
      this.advanceLap();
    }
    while (this.player.angle < -Math.PI * 0.5) {
      this.player.angle += Math.PI * 2;
    }

    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer--;
      this.executeJump();
    }

    // 2. Radial Physics
    let effectiveGravity = GRAVITY;
    if (this.selectedChar.stats.hasFloat && !this.player.isGrounded && this.keys.jump && this.player.radialVel < 0) {
      effectiveGravity = GRAVITY * 0.35;
      this.spawnFloatParticles();
    }

    this.player.radialVel -= effectiveGravity;
    this.player.radius += this.player.radialVel;

    const playerDeg = this.getNormalizedDegrees(this.player.angle);
    let landedOnPlatform = false;
    let targetGroundRadius = 0;

    if (this.player.radialVel <= 0 && this.currentLapData.platforms) {
      for (const platform of this.currentLapData.platforms) {
        if (this.isAngleInArc(playerDeg, platform.startAngle, platform.endAngle)) {
          const platRadius = PLANET_RADIUS + platform.radiusOffset;
          if (this.player.radius >= platRadius - 14 && this.player.radius <= platRadius + 14) {
            targetGroundRadius = platRadius;
            landedOnPlatform = true;
            break;
          }
        }
      }
    }

    if (landedOnPlatform) {
      if (!this.player.isGrounded && this.player.radialVel < -1) {
        sounds.playLand();
      }
      this.player.radius = targetGroundRadius;
      this.player.radialVel = 0;
      this.player.isGrounded = true;
      this.player.coyoteTimer = COYOTE_TIME_MAX;
      this.player.jumpCount = 0;
    } else {
      this.player.isGrounded = false;
      if (this.player.coyoteTimer > 0) {
        this.player.coyoteTimer--;
      }

      if (this.player.radius <= PLANET_RADIUS + 20) {
        if (this.phaseActiveTimerMs > 0 || this.shieldInvulnerableTimerMs > 0) {
          this.player.radialVel = JUMP_IMPULSE_BASE;
        } else if (this.shieldCharges > 0) {
          this.shieldCharges--;
          this.shieldInvulnerableTimerMs = 1500;
          this.player.radialVel = JUMP_IMPULSE_BASE * 1.1;
          sounds.playDoubleJump();
          this.spawnShieldAbsorbParticles();
        } else {
          sounds.playSpikeHit();
          this.triggerGameOver("You landed on the spiked floor!");
          return;
        }
      }
    }

    if (Math.abs(this.player.angularVel) > 0.005 || !this.player.isGrounded) {
      const pos = this.getPlayerWorldPos();
      this.player.trail.push({ x: pos.x, y: pos.y, life: 1 });
      if (this.player.trail.length > 10) this.player.trail.shift();
    }

    // 3. Update Void Movement
    const currentVoidSpeed = this.void.speed + (this.currentLapIndex * 0.0005);
    this.void.angle += currentVoidSpeed;

    let angleDiffRad = this.player.angle - this.void.angle;
    while (angleDiffRad < 0) angleDiffRad += Math.PI * 2;
    while (angleDiffRad >= Math.PI * 2) angleDiffRad -= Math.PI * 2;

    const angleDiffDeg = (angleDiffRad * 180 / Math.PI);
    const distanceMeters = (angleDiffRad * PLANET_RADIUS / 10).toFixed(1);

    sounds.updateVoidProximity(angleDiffDeg);

    if (angleDiffDeg >= 0 && angleDiffDeg < 5) {
      this.triggerGameOver("The Shadow Void caught you from behind!");
      return;
    }

    if (angleDiffDeg > 310) {
      this.void.angle = this.player.angle - (Math.PI * 0.5);
    }

    // 4. Collision Detection
    this.checkSpikeCollisions(playerDeg);
    this.checkCrystalCollisions(playerDeg);

    // 5. Fast Array Particle Filter
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      return p.life > 0;
    });

    this.player.trail = this.player.trail.filter(t => {
      t.life -= 0.1;
      return t.life > 0;
    });

    // 6. Update HUD
    this.updateHUD(angleDiffDeg, distanceMeters);
  }

  spawnFloatParticles() {
    const pos = this.getPlayerWorldPos();
    this.particles.push({
      x: pos.x + (Math.random() - 0.5) * 10,
      y: pos.y + 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 2 + 1,
      radius: Math.random() * 3 + 1,
      color: '#c084fc',
      life: 1,
      decay: 0.08
    });
  }

  spawnShieldAbsorbParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        radius: Math.random() * 3 + 2,
        color: '#f43f5e',
        life: 1,
        decay: 0.04
      });
    }
  }

  checkSpikeCollisions(playerDeg) {
    if (this.phaseActiveTimerMs > 0 || this.shieldInvulnerableTimerMs > 0) return;

    const pRadius = this.player.radius;

    if (this.currentLapData.floatingSpikes) {
      for (const spike of this.currentLapData.floatingSpikes) {
        const spikeRadius = PLANET_RADIUS + spike.radiusOffset;
        if (this.isAngleInArc(playerDeg, spike.angle - spike.widthAngle / 2, spike.angle + spike.widthAngle / 2)) {
          if (Math.abs(pRadius - spikeRadius) < 22) {
            if (this.shieldCharges > 0) {
              this.shieldCharges--;
              this.shieldInvulnerableTimerMs = 1500;
              this.player.radialVel = JUMP_IMPULSE_BASE * 1.1;
              sounds.playDoubleJump();
              this.spawnShieldAbsorbParticles();
            } else {
              sounds.playSpikeHit();
              this.triggerGameOver("You hit an airborne hazard!");
              return;
            }
          }
        }
      }
    }
  }

  checkCrystalCollisions(playerDeg) {
    if (!this.currentLapData.crystals) return;

    const hasMagnet = this.selectedChar.stats.hasMagnet;
    const magnetThresholdDeg = hasMagnet ? 32 : 6;

    for (let i = this.currentLapData.crystals.length - 1; i >= 0; i--) {
      const crystal = this.currentLapData.crystals[i];
      if (crystal.collected) continue;

      const crystalRadius = PLANET_RADIUS + crystal.radiusOffset;
      const angleDiff = Math.abs(playerDeg - crystal.angle);

      if (angleDiff < magnetThresholdDeg && Math.abs(this.player.radius - crystalRadius) < 75) {
        crystal.collected = true;

        this.crystalsCollected += 3;
        this.crystalBank += 3;
        saveCrystalBank(this.crystalBank);

        sounds.playDoubleJump();

        const cRad = (crystal.angle * Math.PI / 180) - Math.PI / 2;
        const cx = CENTER_X + Math.cos(cRad) * crystalRadius;
        const cy = VIEW_CENTER_Y + Math.sin(cRad) * crystalRadius;
        this.spawnCrystalParticles(cx, cy);

        this.checkCharacterUnlocksByDistance();
      }
    }
  }

  advanceLap() {
    this.currentLapIndex++;
    this.currentLapData = getLapData(this.currentLapIndex);
    if (this.currentLapData.crystals) {
      this.currentLapData.crystals.forEach(c => c.collected = false);
    }
    if (this.selectedChar.stats.hasShield) {
      this.shieldCharges = this.selectedChar.stats.shieldMaxPerLap || 1;
    }
    sounds.playLapComplete();
  }

  triggerGameOver(reason) {
    this.state = 'GAMEOVER';
    sounds.stopVoidHum();
    const pos = this.getPlayerWorldPos();
    this.spawnDeathParticles(pos.x, pos.y);

    if (this.elapsedTime > this.bestTime) {
      this.bestTime = this.elapsedTime;
      localStorage.setItem('orbit_run_best_time', this.bestTime.toString());
    }

    saveMaxDistanceMeters(this.totalDistanceMeters);
    saveCrystalBank(this.crystalBank);

    this.dom.deathReason.textContent = reason;
    this.dom.finalTime.textContent = this.formatTimer(this.elapsedTime);
    this.dom.finalDistance.textContent = `${this.totalDistanceMeters.toFixed(1)} m`;
    this.dom.finalLap.textContent = (this.currentLapIndex + 1).toString();
    this.dom.finalCrystals.textContent = this.crystalsCollected.toString();

    this.dom.gameOverOverlay.classList.remove('hidden');
  }

  formatTimer(ms) {
    if (!ms || ms <= 0) return "00:00.00";
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const seconds = (totalSecs % 60).toString().padStart(2, '0');
    const millis = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${millis}`;
  }

  updateHUD(angleDiffDeg = 180, distanceMeters = "180.0") {
    this.dom.timerDisplay.textContent = this.formatTimer(this.elapsedTime);

    this.dom.distanceMeters.textContent = distanceMeters;
    this.dom.distanceDegrees.textContent = `(${Math.round(angleDiffDeg)}°)`;

    const pct = Math.min(100, Math.max(0, (angleDiffDeg / 360) * 100));
    this.dom.radarBar.style.width = `${pct}%`;

    if (angleDiffDeg < 60) {
      this.dom.distanceBox.classList.add('warning-glow');
      this.dom.proximityAlert.classList.remove('hidden');
    } else {
      this.dom.distanceBox.classList.remove('warning-glow');
      this.dom.proximityAlert.classList.add('hidden');
    }

    this.dom.lapDisplay.textContent = (this.currentLapIndex + 1).toString();
    this.dom.lapName.textContent = `LAP ${this.currentLapIndex + 1} - ${this.currentLapData.name}`;
    this.dom.crystalDisplay.textContent = this.crystalsCollected.toString();

    if (this.selectedChar.stats.hasDash) {
      const maxCd = this.selectedChar.stats.dashCooldownMs;
      const readyPct = Math.min(100, Math.max(0, ((maxCd - this.dashCooldownTimerMs) / maxCd) * 100));
      this.dom.dashFill.style.width = `${readyPct}%`;
      this.dom.dashFill.style.background = readyPct >= 100 ? '#eab308' : 'rgba(255, 255, 255, 0.3)';
    } else if (this.selectedChar.stats.hasSolarBlast) {
      const maxCd = this.selectedChar.stats.solarCooldownMs;
      const readyPct = Math.min(100, Math.max(0, ((maxCd - this.solarCooldownTimerMs) / maxCd) * 100));
      this.dom.dashFill.style.width = `${readyPct}%`;
      this.dom.dashFill.style.background = readyPct >= 100 ? (this.selectedChar.id === "void_slayer" ? '#10b981' : '#f97316') : 'rgba(255, 255, 255, 0.3)';
    } else if (this.selectedChar.stats.hasPhase) {
      const maxCd = this.selectedChar.stats.phaseCooldownMs;
      const readyPct = Math.min(100, Math.max(0, ((maxCd - this.phaseCooldownTimerMs) / maxCd) * 100));
      this.dom.dashFill.style.width = `${readyPct}%`;
      this.dom.dashFill.style.background = readyPct >= 100 ? '#a855f7' : 'rgba(255, 255, 255, 0.3)';
    }

    if (this.selectedChar.stats.hasShield) {
      this.dom.shieldCountBadge.textContent = this.shieldCharges > 0 ? `🛡️ ${this.shieldCharges} SHIELD` : '🛡️ SHIELD BROKEN';
      this.dom.shieldCountBadge.style.color = this.shieldCharges > 0 ? '#f43f5e' : '#94a3b8';
    }
  }

  // --- RENDER PIPELINE ---
  render() {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Draw Fast Pre-rendered Starfield
    this.ctx.drawImage(this.starCanvas, 0, 0);

    // 2. Camera Transformation Matrix
    this.ctx.save();
    this.ctx.translate(CENTER_X, VIEW_CENTER_Y);
    const cameraRotation = -this.player.angle - Math.PI / 2;
    this.ctx.rotate(cameraRotation);
    this.ctx.translate(-CENTER_X, -VIEW_CENTER_Y);

    // 3. Render Planet Base & Floor Spikes
    this.renderPlanet();

    // 4. Render Floating Blocks & Platforms
    this.renderPlatforms();

    // 5. Render Spikes & Hazards
    this.renderSpikes();

    // 6. Render Collectible Crystals
    this.renderCrystals();

    // 7. Render Shadow Void
    this.renderShadowVoid();

    // 8. Render Particles & Trails
    this.renderParticles();

    // 9. Render Player Character
    this.renderPlayer();

    this.ctx.restore();
  }

  renderPlanet() {
    this.ctx.beginPath();
    this.ctx.arc(CENTER_X, VIEW_CENTER_Y, PLANET_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = this.currentLapData.planetColor;
    this.ctx.fill();

    this.ctx.lineWidth = 8;
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.stroke();

    this.ctx.fillStyle = '#f43f5e';
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 10;

    const numSpikes = 72;
    this.ctx.beginPath();

    for (let i = 0; i < numSpikes; i++) {
      const centerAngleDeg = (i * 360 / numSpikes);
      const centerRad = (centerAngleDeg * Math.PI / 180) - Math.PI / 2;
      const halfWidthRad = (2.25 * Math.PI / 180);

      const leftAngle = centerRad - halfWidthRad;
      const rightAngle = centerRad + halfWidthRad;

      const x1 = CENTER_X + Math.cos(leftAngle) * PLANET_RADIUS;
      const y1 = VIEW_CENTER_Y + Math.sin(leftAngle) * PLANET_RADIUS;
      const x2 = CENTER_X + Math.cos(rightAngle) * PLANET_RADIUS;
      const y2 = VIEW_CENTER_Y + Math.sin(rightAngle) * PLANET_RADIUS;

      const tipRadius = PLANET_RADIUS + 22;
      const xt = CENTER_X + Math.cos(centerRad) * tipRadius;
      const yt = VIEW_CENTER_Y + Math.sin(centerRad) * tipRadius;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(xt, yt);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
    }

    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  renderPlatforms() {
    if (!this.currentLapData.platforms) return;

    this.ctx.lineWidth = 16;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 12;

    for (const plat of this.currentLapData.platforms) {
      const startRad = (plat.startAngle * Math.PI / 180) - Math.PI / 2;
      const endRad = (plat.endAngle * Math.PI / 180) - Math.PI / 2;
      const radius = PLANET_RADIUS + plat.radiusOffset;

      this.ctx.beginPath();
      this.ctx.arc(CENTER_X, VIEW_CENTER_Y, radius, startRad, endRad);
      this.ctx.stroke();
    }

    this.ctx.shadowBlur = 0;

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.beginPath();
    for (const plat of this.currentLapData.platforms) {
      const startRad = (plat.startAngle * Math.PI / 180) - Math.PI / 2;
      const endRad = (plat.endAngle * Math.PI / 180) - Math.PI / 2;
      const radius = PLANET_RADIUS + plat.radiusOffset + 7;

      this.ctx.arc(CENTER_X, VIEW_CENTER_Y, radius, startRad, endRad);
    }
    this.ctx.stroke();
  }

  renderSpikes() {
    if (!this.currentLapData.floatingSpikes) return;

    this.ctx.fillStyle = '#f43f5e';
    this.ctx.shadowColor = '#f43f5e';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();

    for (const spike of this.currentLapData.floatingSpikes) {
      const baseRadius = PLANET_RADIUS + spike.radiusOffset;
      const height = 20;
      const centerRad = (spike.angle * Math.PI / 180) - Math.PI / 2;
      const halfWidthRad = ((spike.widthAngle / 2) * Math.PI / 180);

      const leftAngle = centerRad - halfWidthRad;
      const rightAngle = centerRad + halfWidthRad;

      const x1 = CENTER_X + Math.cos(leftAngle) * baseRadius;
      const y1 = VIEW_CENTER_Y + Math.sin(leftAngle) * baseRadius;
      const x2 = CENTER_X + Math.cos(rightAngle) * baseRadius;
      const y2 = VIEW_CENTER_Y + Math.sin(rightAngle) * baseRadius;

      const tipRadius = baseRadius + height;
      const xt = CENTER_X + Math.cos(centerRad) * tipRadius;
      const yt = VIEW_CENTER_Y + Math.sin(centerRad) * tipRadius;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(xt, yt);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
    }

    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  renderCrystals() {
    if (!this.currentLapData.crystals) return;

    for (const c of this.currentLapData.crystals) {
      if (c.collected) continue;

      const rad = (c.angle * Math.PI / 180) - Math.PI / 2;
      const r = PLANET_RADIUS + c.radiusOffset;
      const x = CENTER_X + Math.cos(rad) * r;
      const y = VIEW_CENTER_Y + Math.sin(rad) * r;

      this.ctx.save();
      this.ctx.translate(x, y);

      this.ctx.beginPath();
      this.ctx.moveTo(0, -9);
      this.ctx.lineTo(7, 0);
      this.ctx.lineTo(0, 9);
      this.ctx.lineTo(-7, 0);
      this.ctx.closePath();

      this.ctx.fillStyle = '#fbbf24';
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.shadowBlur = 12;
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  renderShadowVoid() {
    const voidRad = this.void.angle;

    this.ctx.save();

    const outerR = PLANET_RADIUS + 900;
    this.ctx.beginPath();
    this.ctx.moveTo(CENTER_X, VIEW_CENTER_Y);
    this.ctx.arc(CENTER_X, VIEW_CENTER_Y, outerR, voidRad - Math.PI * 0.11, voidRad);
    this.ctx.closePath();

    const gradient = this.ctx.createRadialGradient(CENTER_X, VIEW_CENTER_Y, PLANET_RADIUS - 10, CENTER_X, VIEW_CENTER_Y, outerR);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
    gradient.addColorStop(0.3, 'rgba(88, 28, 135, 0.8)');
    gradient.addColorStop(1, 'rgba(7, 9, 19, 0.95)');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    const startX = CENTER_X + Math.cos(voidRad) * (PLANET_RADIUS - 10);
    const startY = VIEW_CENTER_Y + Math.sin(voidRad) * (PLANET_RADIUS - 10);
    const edgeX = CENTER_X + Math.cos(voidRad) * outerR;
    const edgeY = VIEW_CENTER_Y + Math.sin(voidRad) * outerR;

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(edgeX, edgeY);
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#c084fc';
    this.ctx.shadowColor = '#a855f7';
    this.ctx.shadowBlur = 16;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(edgeX, edgeY);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    this.ctx.restore();
  }

  renderParticles() {
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    for (const t of this.player.trail) {
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = this.selectedChar.trailColor;
      this.ctx.globalAlpha = Math.max(0, t.life * 0.5);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  renderPlayer() {
    const pos = this.getPlayerWorldPos();

    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(this.player.angle + Math.PI / 2);

    const w = this.player.width;
    const h = this.player.height;

    if (this.phaseActiveTimerMs > 0) {
      this.ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.02) * 0.3;
    } else if (this.shieldInvulnerableTimerMs > 0) {
      this.ctx.globalAlpha = 0.6 + Math.sin(performance.now() * 0.04) * 0.4;
    }

    this.ctx.fillStyle = this.selectedChar.color;
    this.ctx.shadowColor = this.selectedChar.color;
    this.ctx.shadowBlur = 18;

    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, -h, w, h, 6);
    this.ctx.fill();

    if (this.shieldCharges > 0 || this.shieldInvulnerableTimerMs > 0) {
      this.ctx.beginPath();
      this.ctx.arc(0, -h / 2, w * 0.95, 0, Math.PI * 2);
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#f43f5e';
      this.ctx.shadowColor = '#f43f5e';
      this.ctx.shadowBlur = 15;
      this.ctx.stroke();
    }

    if (this.selectedChar.stats.hasMagnet) {
      this.ctx.beginPath();
      this.ctx.arc(0, -h / 2, w * 1.25, 0, Math.PI * 2);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#06b6d4';
      this.ctx.shadowColor = '#06b6d4';
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#0f172a';
    this.ctx.shadowBlur = 0;
    const visorX = this.player.facing === 1 ? 2 : -8;
    this.ctx.fillRect(visorX, -h + 6, 8, 5);

    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(visorX + (this.player.facing === 1 ? 5 : 1), -h + 7, 2, 3);

    this.ctx.restore();
  }

  loop(timestamp) {
    this.update(timestamp);
    this.render();
    requestAnimationFrame(this.loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
