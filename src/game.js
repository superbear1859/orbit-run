import { sounds } from './audio.js';
import { PLANET_RADIUS, getLapData, generateRandomPowerUps } from './levels.js';
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
const MAX_PARTICLES = 25; // Optimized particle cap for 60FPS
const FULL_LAP_DISTANCE_METERS = 190.0; // 1 full orbital lap around radius 340 planet is ~213.6m

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Pre-create reusable radial void gradient once (avoids 60FPS allocation lag)
    const outerR = PLANET_RADIUS + 900;
    this.cachedVoidGradient = this.ctx.createRadialGradient(
      CENTER_X, VIEW_CENTER_Y, PLANET_RADIUS - 10,
      CENTER_X, VIEW_CENTER_Y, outerR
    );
    this.cachedVoidGradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
    this.cachedVoidGradient.addColorStop(0.3, 'rgba(88, 28, 135, 0.8)');
    this.cachedVoidGradient.addColorStop(1, 'rgba(7, 9, 19, 0.95)');

    // Frame Counter for Audio Parameter Throttling
    this.frameCount = 0;

    // Game Toggles State (Persistent)
    this.enableEnemies = localStorage.getItem('orbit_run_enable_enemies') !== 'false';
    this.enablePowerUps = localStorage.getItem('orbit_run_enable_powerups') !== 'false';

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

    // 6-Second Power-Up State
    this.powerUpTimerMs = 0;
    this.activePowerUpType = null;

    // Toast Notification
    this.toastTimerMs = 0;

    // Countdown Interval Reference
    this.countdownInterval = null;

    // Delta Time Normalization
    this.lastTimestamp = 0;

    // State Variables
    this.state = 'START';
    this.currentLapIndex = 0;
    this.currentLapData = getLapData(0, this.enablePowerUps, this.enableEnemies);

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
    this.lapStartDistanceMeters = 0;
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
      guideBookBtn: document.getElementById('guideBookBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      startGuideBtn: document.getElementById('startGuideBtn'),
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
      guideModalOverlay: document.getElementById('guideModalOverlay'),
      settingsModalOverlay: document.getElementById('settingsModalOverlay'),
      closeGuideBtn: document.getElementById('closeGuideBtn'),
      closeSettingsBtn: document.getElementById('closeSettingsBtn'),
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
      powerUpBadge: document.getElementById('powerUpBadge'),
      powerUpName: document.getElementById('powerUpName'),
      powerUpFill: document.getElementById('powerUpFill'),
      abilityKeyHint: document.getElementById('abilityKeyHint'),
      maxDistanceDisplay: document.getElementById('maxDistanceDisplay'),
      crystalBankDisplay: document.getElementById('crystalBankDisplay'),
      unlockToast: document.getElementById('unlockToast'),
      toastCharName: document.getElementById('toastCharName'),
      toastCharAbility: document.getElementById('toastCharAbility'),
      // Toggles DOM Buttons
      startToggleEnemies: document.getElementById('startToggleEnemies'),
      startTogglePowerUps: document.getElementById('startTogglePowerUps'),
      pauseToggleEnemies: document.getElementById('pauseToggleEnemies'),
      pauseTogglePowerUps: document.getElementById('pauseTogglePowerUps'),
      settingsToggleEnemies: document.getElementById('settingsToggleEnemies'),
      settingsTogglePowerUps: document.getElementById('settingsTogglePowerUps')
    };

    this.initEventListeners();
    this.initTouchControls();
    this.initGuideTabs();
    this.updateActiveCharacterDisplay();
    this.updateToggleUI();

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

  toggleEnemies() {
    this.enableEnemies = !this.enableEnemies;
    localStorage.setItem('orbit_run_enable_enemies', this.enableEnemies ? 'true' : 'false');
    this.updateToggleUI();

    if (!this.enableEnemies && this.currentLapData) {
      this.currentLapData.enemies = [];
    }
  }

  togglePowerUps() {
    this.enablePowerUps = !this.enablePowerUps;
    localStorage.setItem('orbit_run_enable_powerups', this.enablePowerUps ? 'true' : 'false');
    this.updateToggleUI();

    if (!this.enablePowerUps && this.currentLapData) {
      this.currentLapData.powerUps = [];
    }
  }

  updateToggleUI() {
    const updateBtn = (btn, enabled) => {
      if (!btn) return;
      btn.textContent = enabled ? "ENABLED" : "DISABLED";
      if (enabled) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    };

    updateBtn(this.dom.startToggleEnemies, this.enableEnemies);
    updateBtn(this.dom.startTogglePowerUps, this.enablePowerUps);
    updateBtn(this.dom.pauseToggleEnemies, this.enableEnemies);
    updateBtn(this.dom.pauseTogglePowerUps, this.enablePowerUps);
    updateBtn(this.dom.settingsToggleEnemies, this.enableEnemies);
    updateBtn(this.dom.settingsTogglePowerUps, this.enablePowerUps);
  }

  toggleSettingsModal() {
    if (this.dom.settingsModalOverlay.classList.contains('hidden')) {
      this.updateToggleUI();
      this.dom.settingsModalOverlay.classList.remove('hidden');
    } else {
      this.dom.settingsModalOverlay.classList.add('hidden');
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
    for (let i = 0; i < 70; i++) {
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
      if (!element) return;
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

  initGuideTabs() {
    const tabBtns = document.querySelectorAll('.guide-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.guide-tab-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`tab-${tabName}`);
        if (targetPanel) targetPanel.classList.add('active');
      });
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
    this.dom.toastCharAbility.textContent = "ALL 17 CHARACTERS UNLOCKED + 9999 💎!";
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
      if (e.code === 'KeyG') {
        this.toggleGuideModal();
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
    this.dom.guideBookBtn.addEventListener('click', () => this.toggleGuideModal());
    this.dom.settingsBtn.addEventListener('click', () => this.toggleSettingsModal());
    this.dom.closeSettingsBtn.addEventListener('click', () => this.toggleSettingsModal());
    if (this.dom.startGuideBtn) {
      this.dom.startGuideBtn.addEventListener('click', () => this.toggleGuideModal());
    }
    this.dom.closeGuideBtn.addEventListener('click', () => this.toggleGuideModal());
    this.dom.openRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.deathRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.closeRosterBtn.addEventListener('click', () => this.toggleRosterModal());
    this.dom.resetCharsBtn.addEventListener('click', () => this.resetCharacters());

    // Toggle button listeners
    const bindToggle = (btn, action) => {
      if (btn) btn.addEventListener('click', () => action());
    };

    bindToggle(this.dom.startToggleEnemies, () => this.toggleEnemies());
    bindToggle(this.dom.startTogglePowerUps, () => this.togglePowerUps());
    bindToggle(this.dom.pauseToggleEnemies, () => this.toggleEnemies());
    bindToggle(this.dom.pauseTogglePowerUps, () => this.togglePowerUps());
    bindToggle(this.dom.settingsToggleEnemies, () => this.toggleEnemies());
    bindToggle(this.dom.settingsTogglePowerUps, () => this.togglePowerUps());
  }

  toggleMute() {
    const isMuted = sounds.toggleMute();
    this.dom.soundBtn.textContent = isMuted ? '🔇' : '🔊';
  }

  togglePause() {
    if (this.state === 'RUNNING') {
      this.state = 'PAUSED';
      sounds.stopVoidHum();
      this.updateToggleUI();
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

  toggleGuideModal() {
    if (this.dom.guideModalOverlay.classList.contains('hidden')) {
      this.dom.guideModalOverlay.classList.remove('hidden');
    } else {
      this.dom.guideModalOverlay.classList.add('hidden');
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
      this.dom.abilityKeyHint.classList.remove('hidden');
    } else {
      this.dom.dashCooldownBar.classList.add('hidden');
      this.dom.abilityKeyHint.classList.add('hidden');
    }

    if (this.selectedChar.stats.hasShield) {
      this.dom.shieldCountBadge.classList.remove('hidden');
    } else {
      this.dom.shieldCountBadge.classList.add('hidden');
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

      // Blast also destroys nearby enemies!
      const playerDeg = this.getNormalizedDegrees(this.player.angle);
      if (this.currentLapData.enemies) {
        for (const enemy of this.currentLapData.enemies) {
          if (enemy.destroyed) continue;
          const eAngle = enemy.type === 'shadow_drone' ? enemy.currentAngle : enemy.angle;
          const angleDiff = Math.abs(playerDeg - eAngle);
          if (angleDiff < pushDegrees / 2 + 10) {
            this.destroyEnemy(enemy, "BLASTED!");
          }
        }
      }
    }

    if (this.selectedChar.stats.hasPhase && this.phaseCooldownTimerMs <= 0) {
      this.phaseCooldownTimerMs = this.selectedChar.stats.phaseCooldownMs;
      this.phaseActiveTimerMs = 3000;

      sounds.playDoubleJump();
      this.spawnPhaseParticles();
    }
  }

  destroyEnemy(enemy, textLabel = "DESTROYED!") {
    enemy.destroyed = true;

    const eAngle = enemy.type === 'shadow_drone' ? enemy.currentAngle : enemy.angle;
    const eRad = (eAngle * Math.PI / 180) - Math.PI / 2;
    const r = PLANET_RADIUS + enemy.radiusOffset;
    const ex = CENTER_X + Math.cos(eRad) * r;
    const ey = VIEW_CENTER_Y + Math.sin(eRad) * r;

    this.spawnEnemyExplosionParticles(ex, ey, enemy.type);
    sounds.playSpikeHit();

    this.crystalsCollected += 5;
    this.crystalBank += 5;
    saveCrystalBank(this.crystalBank);
  }

  spawnDashParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 6; i++) {
      this.addParticle(pos.x, pos.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, Math.random() * 3 + 2, this.selectedChar.color, 0.06);
    }
  }

  spawnSolarFlareParticles(pushDegrees = 60) {
    const pos = this.getPlayerWorldPos();
    const count = pushDegrees > 100 ? 12 : 8;
    const pColor = pushDegrees > 100 ? '#10b981' : '#f97316';
    const speed = pushDegrees > 100 ? 9 : 5;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.addParticle(pos.x, pos.y, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 4 + 2, pColor, 0.05);
    }
  }

  spawnPhaseParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 8; i++) {
      this.addParticle(pos.x, pos.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 4 + 2, '#a855f7', 0.05);
    }
  }

  spawnEnemyExplosionParticles(x, y, enemyType) {
    const mainColor = enemyType === 'shadow_drone' ? '#c084fc' : '#f43f5e';
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const speed = Math.random() * 4 + 2;
      this.addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 4 + 2, Math.random() > 0.5 ? mainColor : '#fbbf24', 0.05);
    }
  }

  addParticle(x, y, vx, vy, radius, color, decay) {
    this.particles.push({ x, y, vx, vy, radius, color, life: 1, decay });
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.shift();
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
    this.dom.guideModalOverlay.classList.add('hidden');
    this.dom.settingsModalOverlay.classList.add('hidden');
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
    this.currentLapData = getLapData(0, this.enablePowerUps, this.enableEnemies);
    this.crystalsCollected = 0;
    this.totalDistanceMeters = 0;
    this.lapStartDistanceMeters = 0;
    this.elapsedTime = 0;
    this.particles = [];
    this.dashCooldownTimerMs = 0;
    this.solarCooldownTimerMs = 0;
    this.phaseCooldownTimerMs = 0;
    this.phaseActiveTimerMs = 0;
    this.shieldInvulnerableTimerMs = 0;
    this.powerUpTimerMs = 0;
    this.activePowerUpType = null;

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
    for (let i = 0; i < 4; i++) {
      this.addParticle(pos.x, pos.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, Math.random() * 3 + 2, this.selectedChar.color, 0.08);
    }
  }

  spawnDoubleJumpParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.addParticle(pos.x, pos.y, Math.cos(angle) * 4, Math.sin(angle) * 4, Math.random() * 3 + 2, this.selectedChar.trailColor, 0.07);
    }
  }

  spawnCrystalParticles(x, y) {
    for (let i = 0; i < 5; i++) {
      this.addParticle(x, y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 3 + 2, '#fbbf24', 0.06);
    }
  }

  spawnPowerUpParticles(x, y, pType) {
    const color = pType === 'hyper_speed' ? '#eab308' : (pType === 'star_invincible' ? '#f43f5e' : '#38bdf8');
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.addParticle(x, y, Math.cos(angle) * 4, Math.sin(angle) * 4, Math.random() * 4 + 2, color, 0.05);
    }
  }

  spawnDeathParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.addParticle(x, y, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, Math.random() * 4 + 2, Math.random() > 0.5 ? '#f43f5e' : '#9333ea', 0.04);
    }
  }

  spawnFloatParticles() {
    const pos = this.getPlayerWorldPos();
    this.addParticle(pos.x, pos.y + 10, (Math.random() - 0.5) * 1.5, Math.random() * 2 + 1, Math.random() * 3 + 1, '#c084fc', 0.08);
  }

  spawnShieldAbsorbParticles() {
    const pos = this.getPlayerWorldPos();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.addParticle(pos.x, pos.y, Math.cos(angle) * 4, Math.sin(angle) * 4, Math.random() * 3 + 2, '#f43f5e', 0.05);
    }
  }

  getPlayerWorldPos() {
    const r = (Number.isFinite(this.player.radius) ? this.player.radius : (PLANET_RADIUS + 50)) + this.player.height / 2;
    const angle = Number.isFinite(this.player.angle) ? this.player.angle : -Math.PI / 2;
    return {
      x: CENTER_X + Math.cos(angle) * r,
      y: VIEW_CENTER_Y + Math.sin(angle) * r
    };
  }

  getNormalizedDegrees(angleRad) {
    if (!Number.isFinite(angleRad)) return 0;
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

  update(dtFactor = 1.0) {
    if (this.state !== 'RUNNING') return;

    this.frameCount++;
    this.elapsedTime = performance.now() - this.startTime;
    const deltaMs = 16.667 * dtFactor;

    // Bulletproof NaN State Auto-Recovery Guard
    if (!Number.isFinite(this.player.angularVel)) this.player.angularVel = 0;
    if (!Number.isFinite(this.player.angle)) this.player.angle = -Math.PI / 2;
    if (!Number.isFinite(this.player.radialVel)) this.player.radialVel = 0;
    if (!Number.isFinite(this.player.radius)) this.player.radius = PLANET_RADIUS + 50;
    if (!Number.isFinite(this.void.angle)) this.void.angle = this.player.angle - (Math.PI * 0.33);

    if (this.toastTimerMs > 0) {
      this.toastTimerMs = Math.max(0, this.toastTimerMs - deltaMs);
      if (this.toastTimerMs <= 0) {
        this.dom.unlockToast.classList.add('hidden');
      }
    }

    if (this.powerUpTimerMs > 0) {
      this.powerUpTimerMs = Math.max(0, this.powerUpTimerMs - deltaMs);
      if (this.powerUpTimerMs <= 0) {
        this.activePowerUpType = null;
        this.dom.powerUpBadge.classList.add('hidden');
      }
    }

    if (this.dashCooldownTimerMs > 0) {
      this.dashCooldownTimerMs = Math.max(0, this.dashCooldownTimerMs - deltaMs);
    }
    if (this.solarCooldownTimerMs > 0) {
      this.solarCooldownTimerMs = Math.max(0, this.solarCooldownTimerMs - deltaMs);
    }
    if (this.phaseCooldownTimerMs > 0) {
      this.phaseCooldownTimerMs = Math.max(0, this.phaseCooldownTimerMs - deltaMs);
    }
    if (this.phaseActiveTimerMs > 0) {
      this.phaseActiveTimerMs = Math.max(0, this.phaseActiveTimerMs - deltaMs);
    }
    if (this.shieldInvulnerableTimerMs > 0) {
      this.shieldInvulnerableTimerMs = Math.max(0, this.shieldInvulnerableTimerMs - deltaMs);
    }

    let speedBonus = 1.0;
    if (this.activePowerUpType === 'hyper_speed') {
      speedBonus = 1.5; // +50% Turbo Speed for 6s!
    }

    const maxSpeed = MAX_RUN_SPEED_BASE * this.selectedChar.stats.speedMult * speedBonus;
    const accel = RUN_ACCEL_BASE * this.selectedChar.stats.speedMult * speedBonus;

    // 1. Angular Movement (Delta-time normalized)
    if (this.keys.right) {
      this.player.angularVel += accel * dtFactor;
      this.player.facing = 1;
    }
    if (this.keys.left) {
      this.player.angularVel -= accel * dtFactor;
      this.player.facing = -1;
    }

    if (!this.player.isDashing) {
      this.player.angularVel = Math.max(-maxSpeed, Math.min(maxSpeed, this.player.angularVel || 0));
      this.player.angularVel *= Math.pow(FRICTION, dtFactor);
    } else {
      this.player.dashTimerMs -= deltaMs;
      if (this.player.dashTimerMs <= 0) {
        this.player.isDashing = false;
      }
    }

    const prevAngle = this.player.angle;
    this.player.angle += (this.player.angularVel || 0) * dtFactor;

    const arcDeltaRad = Math.abs(this.player.angle - prevAngle);
    const distDeltaMeters = (arcDeltaRad * PLANET_RADIUS) / 10;
    if (Number.isFinite(distDeltaMeters)) {
      this.totalDistanceMeters += distDeltaMeters;
    }

    if (this.totalDistanceMeters > this.maxDistanceMeters) {
      this.maxDistanceMeters = this.totalDistanceMeters;
      saveMaxDistanceMeters(this.maxDistanceMeters);
    }

    this.checkCharacterUnlocksByDistance();

    // Standard Linear Angle Wrapping (Rock-solid)
    const TWO_PI = Math.PI * 2;
    const MIN_ANGLE = -Math.PI * 0.5;
    const MAX_ANGLE = Math.PI * 1.5;

    if (this.player.angle >= MAX_ANGLE) {
      this.player.angle -= TWO_PI;
      this.advanceLap();
    } else if (this.player.angle < MIN_ANGLE) {
      this.player.angle += TWO_PI;
    }

    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer--;
      this.executeJump();
    }

    // 2. Radial Physics (Delta-time normalized)
    let effectiveGravity = GRAVITY;
    if (this.selectedChar.stats.hasFloat && !this.player.isGrounded && this.keys.jump && this.player.radialVel < 0) {
      effectiveGravity = GRAVITY * 0.35;
      this.spawnFloatParticles();
    }

    this.player.radialVel -= effectiveGravity * dtFactor;
    this.player.radius += (this.player.radialVel || 0) * dtFactor;

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
        if (this.activePowerUpType === 'star_invincible' || this.phaseActiveTimerMs > 0 || this.shieldInvulnerableTimerMs > 0) {
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

    if (Math.abs(this.player.angularVel || 0) > 0.005 || !this.player.isGrounded) {
      const pos = this.getPlayerWorldPos();
      this.player.trail.push({ x: pos.x, y: pos.y, life: 1 });
      if (this.player.trail.length > 4) this.player.trail.shift();
    }

    // 3. Update Void Movement (Delta-time normalized)
    const currentVoidSpeed = this.void.speed + (this.currentLapIndex * 0.0005);
    this.void.angle += currentVoidSpeed * dtFactor;

    let angleDiffRad = this.player.angle - this.void.angle;
    if (!Number.isFinite(angleDiffRad)) {
      angleDiffRad = Math.PI;
      this.void.angle = this.player.angle - Math.PI;
    } else {
      angleDiffRad = ((angleDiffRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    }

    const angleDiffDeg = (angleDiffRad * 180 / Math.PI);
    const distanceMeters = (angleDiffRad * PLANET_RADIUS / 10).toFixed(1);

    // Throttle audio parameter updates to run only once every 10 frames (~100ms)
    if (this.frameCount % 10 === 0) {
      sounds.updateVoidProximity(angleDiffDeg);
    }

    if (angleDiffDeg >= 0 && angleDiffDeg < 5) {
      this.triggerGameOver("The Shadow Void caught you from behind!");
      return;
    }

    if (angleDiffDeg > 310) {
      this.void.angle = this.player.angle - (Math.PI * 0.5);
    }

    // 4. Update Enemy Movements (If Enemies Enabled)
    if (this.enableEnemies && this.currentLapData.enemies) {
      for (const enemy of this.currentLapData.enemies) {
        if (enemy.destroyed) continue;
        if (enemy.type === 'shadow_drone') {
          enemy.currentAngle += enemy.speed * enemy.dir * dtFactor;
          if (enemy.currentAngle >= enemy.maxAngle) {
            enemy.currentAngle = enemy.maxAngle;
            enemy.dir = -1;
          } else if (enemy.currentAngle <= enemy.minAngle) {
            enemy.currentAngle = enemy.minAngle;
            enemy.dir = 1;
          }
        }
      }
    }

    // 5. Collision Detection
    this.checkSpikeCollisions(playerDeg);
    if (this.enableEnemies) this.checkEnemyCollisions(playerDeg);
    this.checkCrystalCollisions(playerDeg);
    if (this.enablePowerUps) this.checkPowerUpCollisions(playerDeg);

    // 6. Fast Array Particle Filter
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtFactor;
      p.y += p.vy * dtFactor;
      p.life -= p.decay * dtFactor;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.player.trail.length - 1; i >= 0; i--) {
      const t = this.player.trail[i];
      t.life -= 0.2 * dtFactor;
      if (t.life <= 0) {
        this.player.trail.splice(i, 1);
      }
    }

    // 7. Update HUD
    this.updateHUD(angleDiffDeg, distanceMeters);
  }

  checkPowerUpCollisions(playerDeg) {
    if (!this.enablePowerUps || !this.currentLapData.powerUps) return;

    for (const pUp of this.currentLapData.powerUps) {
      if (pUp.collected) continue;

      const pUpRadius = PLANET_RADIUS + pUp.radiusOffset;
      const angleDiff = Math.abs(playerDeg - pUp.angle);

      if (angleDiff < 7 && Math.abs(this.player.radius - pUpRadius) < 70) {
        pUp.collected = true;

        this.powerUpTimerMs = pUp.durationMs || 6000;
        this.activePowerUpType = pUp.type;

        sounds.playLapComplete();

        const pRad = (pUp.angle * Math.PI / 180) - Math.PI / 2;
        const px = CENTER_X + Math.cos(pRad) * pUpRadius;
        const py = VIEW_CENTER_Y + Math.sin(pRad) * pUpRadius;
        this.spawnPowerUpParticles(px, py, pUp.type);

        let pNameText = "⚡ TURBO SPEED";
        if (pUp.type === 'star_invincible') pNameText = "⭐ INVINCIBLE STAR";
        if (pUp.type === 'super_magnet') pNameText = "🧲 SUPER MAGNET";

        this.dom.powerUpName.textContent = pNameText;
        this.dom.powerUpBadge.classList.remove('hidden');
      }
    }
  }

  checkEnemyCollisions(playerDeg) {
    if (!this.enableEnemies || !this.currentLapData.enemies) return;

    const pRadius = this.player.radius;

    for (const enemy of this.currentLapData.enemies) {
      if (enemy.destroyed) continue;

      const eAngle = enemy.type === 'shadow_drone' ? enemy.currentAngle : enemy.angle;
      const eRadius = PLANET_RADIUS + enemy.radiusOffset;

      const angleDiff = Math.abs(playerDeg - eAngle);

      if (angleDiff < 5.5 && Math.abs(pRadius - eRadius) < 26) {
        if (this.player.isDashing || this.activePowerUpType === 'star_invincible') {
          this.destroyEnemy(enemy, "SMASHED!");
          continue;
        }

        if (this.phaseActiveTimerMs > 0 || this.shieldInvulnerableTimerMs > 0) return;

        if (this.shieldCharges > 0) {
          this.shieldCharges--;
          this.shieldInvulnerableTimerMs = 1500;
          this.player.radialVel = JUMP_IMPULSE_BASE * 1.1;
          sounds.playDoubleJump();
          this.spawnShieldAbsorbParticles();
        } else {
          sounds.playSpikeHit();
          const msg = enemy.type === 'shadow_drone' ? "Destroyed by a Void Drone!" : "Collided with a Plasma Mine!";
          this.triggerGameOver(msg);
          return;
        }
      }
    }
  }

  checkSpikeCollisions(playerDeg) {
    if (this.activePowerUpType === 'star_invincible' || this.phaseActiveTimerMs > 0 || this.shieldInvulnerableTimerMs > 0) return;

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

    const hasMagnet = this.selectedChar.stats.hasMagnet || this.activePowerUpType === 'super_magnet';
    const magnetThresholdDeg = hasMagnet ? 45 : 6;

    for (let i = this.currentLapData.crystals.length - 1; i >= 0; i--) {
      const crystal = this.currentLapData.crystals[i];
      if (crystal.collected) continue;

      const crystalRadius = PLANET_RADIUS + crystal.radiusOffset;
      const angleDiff = Math.abs(playerDeg - crystal.angle);

      if (angleDiff < magnetThresholdDeg && Math.abs(this.player.radius - crystalRadius) < 95) {
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
    this.currentLapData = getLapData(this.currentLapIndex, this.enablePowerUps, this.enableEnemies);
    if (this.currentLapData.crystals) {
      this.currentLapData.crystals.forEach(c => c.collected = false);
    }

    if (this.selectedChar.stats.hasShield) {
      this.shieldCharges = this.selectedChar.stats.shieldMaxPerLap || 1;
    }

    // Check if character has Unlimited Jumps
    const isUnlimitedJumps = (this.selectedChar.stats.maxJumps || 2) >= 50;

    // Check distance traveled this lap (Must be a full 360° orbital loop >= FULL_LAP_DISTANCE_METERS)
    const distanceThisLap = this.totalDistanceMeters - (this.lapStartDistanceMeters || 0);
    const isFullLapCompleted = distanceThisLap >= FULL_LAP_DISTANCE_METERS;

    // Record start distance for the next lap
    this.lapStartDistanceMeters = this.totalDistanceMeters;

    sounds.playLapComplete();

    if (!isUnlimitedJumps && isFullLapCompleted) {
      // Award +10 Gems Every FULL Lap Completed for normal runners!
      this.crystalsCollected += 10;
      this.crystalBank += 10;
      saveCrystalBank(this.crystalBank);

      // Show mid-run Lap Bonus Toast (+10 💎)
      this.dom.toastCharName.textContent = `+10 💎 FULL LAP ${this.currentLapIndex} BONUS!`;
      this.dom.toastCharName.style.color = "#fbbf24";
      this.dom.toastCharAbility.textContent = `Total Gems Saved: 💎 ${this.crystalBank}`;
      this.dom.unlockToast.classList.remove('hidden');
      this.toastTimerMs = 3000;
    } else if (isUnlimitedJumps) {
      // Inform user why no bonus gems were awarded for Unlimited Jumps
      this.dom.toastCharName.textContent = `LAP ${this.currentLapIndex} COMPLETE!`;
      this.dom.toastCharName.style.color = "#a855f7";
      this.dom.toastCharAbility.textContent = `Unlimited Jumps Equipped: No +10 💎 bonus!`;
      this.dom.unlockToast.classList.remove('hidden');
      this.toastTimerMs = 3000;
    } else {
      // Full distance was not completed
      this.dom.toastCharName.textContent = `LAP ${this.currentLapIndex} COMPLETE!`;
      this.dom.toastCharName.style.color = "#38bdf8";
      this.dom.toastCharAbility.textContent = `Full 360° lap required for +10 💎 bonus!`;
      this.dom.unlockToast.classList.remove('hidden');
      this.toastTimerMs = 3000;
    }
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

    if (this.powerUpTimerMs > 0) {
      const pPct = Math.min(100, Math.max(0, (this.powerUpTimerMs / 6000) * 100));
      this.dom.powerUpFill.style.width = `${pPct}%`;
    }

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

    // 6. Render Enemies (If Enemies Enabled)
    if (this.enableEnemies) this.renderEnemies();

    // 7. Render Collectible 6-Sec Power-Ups (If Power-Ups Enabled)
    if (this.enablePowerUps) this.renderPowerUps();

    // 8. Render Collectible Crystals
    this.renderCrystals();

    // 9. Render Shadow Void
    this.renderShadowVoid();

    // 10. Fast Render Particles & Trails
    this.renderParticles();

    // 11. Render Player Character
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
  }

  renderPlatforms() {
    if (!this.currentLapData.platforms) return;

    this.ctx.lineWidth = 16;
    this.ctx.strokeStyle = '#38bdf8';

    for (const plat of this.currentLapData.platforms) {
      const startRad = (plat.startAngle * Math.PI / 180) - Math.PI / 2;
      const endRad = (plat.endAngle * Math.PI / 180) - Math.PI / 2;
      const radius = PLANET_RADIUS + plat.radiusOffset;

      this.ctx.beginPath();
      this.ctx.arc(CENTER_X, VIEW_CENTER_Y, radius, startRad, endRad);
      this.ctx.stroke();
    }

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
  }

  renderEnemies() {
    if (!this.enableEnemies || !this.currentLapData.enemies) return;

    const time = performance.now() * 0.005;

    for (const enemy of this.currentLapData.enemies) {
      if (enemy.destroyed) continue;

      const eAngleDeg = enemy.type === 'shadow_drone' ? enemy.currentAngle : enemy.angle;
      const eRad = (eAngleDeg * Math.PI / 180) - Math.PI / 2;
      const r = PLANET_RADIUS + enemy.radiusOffset;
      const x = CENTER_X + Math.cos(eRad) * r;
      const y = VIEW_CENTER_Y + Math.sin(eRad) * r;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(eRad + Math.PI / 2);

      if (enemy.type === 'shadow_drone') {
        // Render Shadow Drone Patrol
        this.ctx.fillStyle = '#a855f7';

        // Drone Body (Futuristic Shield Shape)
        this.ctx.beginPath();
        this.ctx.moveTo(0, -12);
        this.ctx.lineTo(14, 4);
        this.ctx.lineTo(8, 12);
        this.ctx.lineTo(-8, 12);
        this.ctx.lineTo(-14, 4);
        this.ctx.closePath();
        this.ctx.fill();

        // Glowing Visor Eye
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.fillRect(-6, -4, 12, 4);

        // Pulsing Thruster Core
        const thrusterPulse = Math.abs(Math.sin(time * 3)) * 4 + 4;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, 10, thrusterPulse / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (enemy.type === 'plasma_mine') {
        // Render Plasma Mine
        const pulse = Math.sin(time * 4) * 2;
        this.ctx.fillStyle = '#ef4444';

        // Core Orb
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 11 + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Energy Spikes (Rotates smoothly)
        this.ctx.strokeStyle = '#facc15';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const spikeAngle = (Math.PI * 2 * i / 6) + time;
          const sx1 = Math.cos(spikeAngle) * 9;
          const sy1 = Math.sin(spikeAngle) * 9;
          const sx2 = Math.cos(spikeAngle) * (18 + pulse);
          const sy2 = Math.sin(spikeAngle) * (18 + pulse);
          this.ctx.moveTo(sx1, sy1);
          this.ctx.lineTo(sx2, sy2);
        }
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  renderPowerUps() {
    if (!this.enablePowerUps || !this.currentLapData.powerUps) return;

    const time = performance.now() * 0.004;

    for (const pUp of this.currentLapData.powerUps) {
      if (pUp.collected) continue;

      const pRad = (pUp.angle * Math.PI / 180) - Math.PI / 2;
      const r = PLANET_RADIUS + pUp.radiusOffset;
      const x = CENTER_X + Math.cos(pRad) * r;
      const y = VIEW_CENTER_Y + Math.sin(pRad) * r;

      this.ctx.save();
      this.ctx.translate(x, y);

      const color = pUp.type === 'hyper_speed' ? '#eab308' : (pUp.type === 'star_invincible' ? '#f43f5e' : '#38bdf8');
      const pulse = Math.sin(time * 4) * 3;

      // Outer Glowing Ring
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2);
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      // Inner Core Icon
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  renderCrystals() {
    if (!this.currentLapData.crystals) return;

    this.ctx.fillStyle = '#fbbf24';

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
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  renderShadowVoid() {
    const voidRad = Number.isFinite(this.void.angle) ? this.void.angle : -Math.PI;

    this.ctx.save();

    const outerR = PLANET_RADIUS + 900;
    this.ctx.beginPath();
    this.ctx.moveTo(CENTER_X, VIEW_CENTER_Y);
    this.ctx.arc(CENTER_X, VIEW_CENTER_Y, outerR, voidRad - Math.PI * 0.11, voidRad);
    this.ctx.closePath();

    // Use cached pre-created radial gradient object for max performance
    this.ctx.fillStyle = this.cachedVoidGradient;
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
    // Ultra-fast Batch Rendering
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    for (let i = 0; i < this.player.trail.length; i++) {
      const t = this.player.trail[i];
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

    if (this.activePowerUpType === 'star_invincible') {
      this.ctx.globalAlpha = 0.7 + Math.sin(performance.now() * 0.05) * 0.3;
    } else if (this.phaseActiveTimerMs > 0) {
      this.ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.02) * 0.3;
    } else if (this.shieldInvulnerableTimerMs > 0) {
      this.ctx.globalAlpha = 0.6 + Math.sin(performance.now() * 0.04) * 0.4;
    }

    this.ctx.fillStyle = this.activePowerUpType === 'star_invincible' ? '#f43f5e' : (this.activePowerUpType === 'hyper_speed' ? '#eab308' : this.selectedChar.color);

    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, -h, w, h, 6);
    this.ctx.fill();

    // Render Concentric Multi-Shield Energy Barriers!
    const activeShields = this.shieldCharges;
    if (activeShields > 0 || this.shieldInvulnerableTimerMs > 0) {
      const shieldCount = Math.max(1, activeShields);
      const time = performance.now() * 0.003;

      for (let s = 0; s < shieldCount; s++) {
        const ringRadius = w * (0.95 + s * 0.35);
        const rotationAngle = (s % 2 === 0 ? 1 : -1) * time * (1 + s * 0.4);

        this.ctx.save();
        this.ctx.translate(0, -h / 2);
        this.ctx.rotate(rotationAngle);

        this.ctx.beginPath();
        this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        this.ctx.lineWidth = 3 - s * 0.5;
        this.ctx.strokeStyle = s === 0 ? '#f43f5e' : (s === 1 ? '#fb7185' : '#fda4af');
        this.ctx.stroke();

        // Render Orbiting Barrier Orbs on Outer Shields!
        if (s > 0) {
          const numNodes = s + 2;
          for (let n = 0; n < numNodes; n++) {
            const nodeAngle = (Math.PI * 2 * n) / numNodes;
            const nx = Math.cos(nodeAngle) * ringRadius;
            const ny = Math.sin(nodeAngle) * ringRadius;

            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        this.ctx.restore();
      }
    }

    if (this.selectedChar.stats.hasMagnet || this.activePowerUpType === 'super_magnet') {
      this.ctx.beginPath();
      this.ctx.arc(0, -h / 2, w * 1.25, 0, Math.PI * 2);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#06b6d4';
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#0f172a';
    const visorX = this.player.facing === 1 ? 2 : -8;
    this.ctx.fillRect(visorX, -h + 6, 8, 5);

    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(visorX + (this.player.facing === 1 ? 5 : 1), -h + 7, 2, 3);

    this.ctx.restore();
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop);

    try {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const deltaMs = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // Smooth delta normalization capped between 10ms (100fps) and 33ms (30fps)
      const cappedDelta = Math.min(Math.max(10, deltaMs || 16.667), 33.333);
      const dtFactor = cappedDelta / 16.667;

      this.update(dtFactor);
      this.render();
    } catch (err) {
      console.error("Game loop exception caught & recovered:", err);
    }
  }
}

// Global Singleton Safeguard (Prevents duplicate game loops on reloads)
if (!window.__ORBIT_RUN_ENGINE__) {
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.__ORBIT_RUN_ENGINE__) {
      window.__ORBIT_RUN_ENGINE__ = new GameEngine();
    }
  });
}
