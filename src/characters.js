// Character Roster & Special Ability Definitions (16 Playable Characters with Super Easy Distance Unlocks!)

export const CHARACTERS = [
  {
    id: "cyan_runner",
    name: "CYAN RUNNER",
    title: "Standard Swiftness",
    color: "#38bdf8",
    trailColor: "#38bdf8",
    abilityName: "Double Jump",
    abilityDesc: "Balanced speed and standard mid-air double jump.",
    unlockedByDefault: true,
    unlockDistanceMeters: 0,
    crystalCost: 0,
    unlockCriteria: "Default Runner",
    stats: {
      speedMult: 1.0,
      jumpMult: 1.0,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "hyper_dash",
    name: "VOLT DASH",
    title: "Sonic Arc Dash",
    color: "#eab308",
    trailColor: "#fde047",
    abilityName: "Air Dash [SHIFT / E]",
    abilityDesc: "Perform a high-speed forward arc dash in mid-air to clear wide gaps! (3s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 5,
    crystalCost: 5,
    unlockCriteria: "Reach 5m in a run",
    stats: {
      speedMult: 1.15,
      jumpMult: 1.0,
      maxJumps: 2,
      hasDash: true,
      dashCooldownMs: 3000,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "nebula_glider",
    name: "NEBULA GLIDER",
    title: "Anti-Grav Glide",
    color: "#c084fc",
    trailColor: "#a855f7",
    abilityName: "Float Glide [Hold Jump]",
    abilityDesc: "Hold jump in mid-air to float gently across wide spike pits +25% Jump Height.",
    unlockedByDefault: false,
    unlockDistanceMeters: 10,
    crystalCost: 12,
    unlockCriteria: "Reach 10m in a run",
    stats: {
      speedMult: 1.0,
      jumpMult: 1.25,
      maxJumps: 2,
      hasDash: false,
      hasFloat: true,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "titan_shield",
    name: "TITAN AEGIS",
    title: "Spike Barrier",
    color: "#f43f5e",
    trailColor: "#fb7185",
    abilityName: "Spike Shield [Passive]",
    abilityDesc: "Passive energy shield absorbs 1 spike hit per lap without dying!",
    unlockedByDefault: false,
    unlockDistanceMeters: 20,
    crystalCost: 20,
    unlockCriteria: "Reach 20m in a run",
    stats: {
      speedMult: 0.95,
      jumpMult: 1.05,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 1,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "solar_plasma",
    name: "SOLAR PLASMA",
    title: "Solar Flare Shockwave",
    color: "#f97316",
    trailColor: "#fb923c",
    abilityName: "Super Solar Blast [SHIFT / E]",
    abilityDesc: "Emits a high-powered solar shockwave that pushes the Void back a massive 60°! (6s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 35,
    crystalCost: 35,
    unlockCriteria: "Reach 35m in a run",
    stats: {
      speedMult: 1.1,
      jumpMult: 1.1,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: true,
      solarCooldownMs: 6000,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "chrono_speedster",
    name: "CHRONO SPEEDSTER",
    title: "Velocity Shift",
    color: "#10b981",
    trailColor: "#34d399",
    abilityName: "Hyper Speed [Passive]",
    abilityDesc: "Passive +25% movement speed boost and heightened agility.",
    unlockedByDefault: false,
    unlockDistanceMeters: 50,
    crystalCost: 50,
    unlockCriteria: "Reach 50m in a run",
    stats: {
      speedMult: 1.25,
      jumpMult: 1.15,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "cosmic_magnet",
    name: "COSMIC MAGNET",
    title: "Crystal Attractor",
    color: "#06b6d4",
    trailColor: "#22d3ee",
    abilityName: "Grav-Magnet [Passive]",
    abilityDesc: "Magnetically pulls all crystals on screen towards you automatically!",
    unlockedByDefault: false,
    unlockDistanceMeters: 70,
    crystalCost: 75,
    unlockCriteria: "Reach 70m in a run",
    stats: {
      speedMult: 1.05,
      jumpMult: 1.1,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 350,
      hasPhase: false
    }
  },
  {
    id: "singularity_god",
    name: "SINGULARITY",
    title: "Quantum Overlord",
    color: "#ec4899",
    trailColor: "#f472b6",
    abilityName: "Triple Jump & Quantum Speed",
    abilityDesc: "Unlocks Mid-Air Triple Jump + 30% Speed & Jump Power!",
    unlockedByDefault: false,
    unlockDistanceMeters: 95,
    crystalCost: 100,
    unlockCriteria: "Reach 95m in a run",
    stats: {
      speedMult: 1.3,
      jumpMult: 1.3,
      maxJumps: 3,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 1,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 400,
      hasPhase: false
    }
  },
  {
    id: "phantom_shadow",
    name: "PHANTOM SHADOW",
    title: "Ethereal Ghost",
    color: "#a855f7",
    trailColor: "#d8b4fe",
    abilityName: "Phase Shift [SHIFT / E]",
    abilityDesc: "Become ethereal & invulnerable to all spikes for 3 seconds! (8s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 120,
    crystalCost: 140,
    unlockCriteria: "Reach 120m in a run",
    stats: {
      speedMult: 1.15,
      jumpMult: 1.15,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: true,
      phaseCooldownMs: 8000
    }
  },
  {
    id: "storm_light",
    name: "STORM VOID",
    title: "Lightning Multi-Leap",
    color: "#0ea5e9",
    trailColor: "#38bdf8",
    abilityName: "Quadruple Jump [Passive]",
    abilityDesc: "Perform up to 4 mid-air jumps with electrifying agility!",
    unlockedByDefault: false,
    unlockDistanceMeters: 150,
    crystalCost: 180,
    unlockCriteria: "Reach 150m in a run",
    stats: {
      speedMult: 1.2,
      jumpMult: 1.2,
      maxJumps: 4,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "phoenix_valkyrie",
    name: "PHOENIX VALKYRIE",
    title: "Immortal Blaze",
    color: "#ef4444",
    trailColor: "#f87171",
    abilityName: "Double Shield & Glider",
    abilityDesc: "Passively grants 2 Spike Shields per lap + Anti-Grav Gliding!",
    unlockedByDefault: false,
    unlockDistanceMeters: 185,
    crystalCost: 240,
    unlockCriteria: "Reach 185m in a run",
    stats: {
      speedMult: 1.1,
      jumpMult: 1.2,
      maxJumps: 2,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 2,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "omni_celestial",
    name: "OMNI CELESTIAL",
    title: "Radiant Godking",
    color: "#facc15",
    trailColor: "#fde047",
    abilityName: "Infinite Flight & Magnet",
    abilityDesc: "Unlimited Mid-Air Jumps + Crystal Magnet + 35% Speed Boost!",
    unlockedByDefault: false,
    unlockDistanceMeters: 220,
    crystalCost: 320,
    unlockCriteria: "Reach 220m in a run",
    stats: {
      speedMult: 1.35,
      jumpMult: 1.35,
      maxJumps: 99,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 2,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 500,
      hasPhase: false
    }
  },
  {
    id: "void_slayer",
    name: "VOID SLAYER",
    title: "Shadow Eraser",
    color: "#10b981",
    trailColor: "#6ee7b7",
    abilityName: "MEGA VOID ERASER [SHIFT / E]",
    abilityDesc: "Fires an Emerald Shockwave pushing the Void back a COLOSSAL 180°! (4s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 260,
    crystalCost: 160,
    unlockCriteria: "Reach 260m in a run",
    stats: {
      speedMult: 1.25,
      jumpMult: 1.2,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: true,
      solarCooldownMs: 4000,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "chrono_god",
    name: "CHRONO GOD",
    title: "Master of Time",
    color: "#8b5cf6",
    trailColor: "#a78bfa",
    abilityName: "Warp Speed & Air Dash",
    abilityDesc: "Hyper +40% Speed + Sonic Arc Dash (<kbd>SHIFT</kbd>)!",
    unlockedByDefault: false,
    unlockDistanceMeters: 300,
    crystalCost: 200,
    unlockCriteria: "Reach 300m in a run",
    stats: {
      speedMult: 1.4,
      jumpMult: 1.2,
      maxJumps: 2,
      hasDash: true,
      dashCooldownMs: 2500,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "hyperion_titan",
    name: "HYPERION TITAN",
    title: "Unstoppable Fortress",
    color: "#f97316",
    trailColor: "#fdba74",
    abilityName: "Triple Shield & Triple Jump",
    abilityDesc: "Absorbs up to 3 spike hits per lap + Mid-Air Triple Jump!",
    unlockedByDefault: false,
    unlockDistanceMeters: 350,
    crystalCost: 250,
    unlockCriteria: "Reach 350m in a run",
    stats: {
      speedMult: 1.15,
      jumpMult: 1.25,
      maxJumps: 3,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 3,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "infinity_overlord",
    name: "INFINITY OVERLORD",
    title: "Cosmic Emperor",
    color: "#ec4899",
    trailColor: "#f472b6",
    abilityName: "Ultimate Infinity Divinity",
    abilityDesc: "Unlimited Jumps + 3 Spike Shields + 40% Speed + Phase Invulnerability (<kbd>SHIFT</kbd>)!",
    unlockedByDefault: false,
    unlockDistanceMeters: 400,
    crystalCost: 300,
    unlockCriteria: "Reach 400m in a run",
    stats: {
      speedMult: 1.4,
      jumpMult: 1.4,
      maxJumps: 99,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 3,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 500,
      hasPhase: true,
      phaseCooldownMs: 5000
    }
  }
];

export function loadPurchasedCharacters() {
  const saved = localStorage.getItem("orbit_run_purchased_chars");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Error parsing purchased characters:", e);
    }
  }
  return ["cyan_runner"];
}

export function savePurchasedCharacters(purchasedIds) {
  localStorage.setItem("orbit_run_purchased_chars", JSON.stringify(purchasedIds));
}

export function loadCrystalBank() {
  return parseInt(localStorage.getItem("orbit_run_crystal_bank") || "0", 10);
}

export function saveCrystalBank(count) {
  localStorage.setItem("orbit_run_crystal_bank", count.toString());
}

export function loadSelectedCharacter() {
  return localStorage.getItem("orbit_run_selected_char") || "cyan_runner";
}

export function saveSelectedCharacter(charId) {
  localStorage.setItem("orbit_run_selected_char", charId);
}

export function loadMaxDistanceMeters() {
  return parseFloat(localStorage.getItem("orbit_run_max_distance") || "0");
}

export function saveMaxDistanceMeters(distMeters) {
  const currentMax = loadMaxDistanceMeters();
  if (distMeters > currentMax) {
    localStorage.setItem("orbit_run_max_distance", distMeters.toFixed(1));
  }
}
