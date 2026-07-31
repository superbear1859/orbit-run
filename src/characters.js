// Character Roster & Special Ability Definitions (17 Balanced Playable Characters)

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
    abilityDesc: "Perform a high-speed forward arc dash in mid-air to clear wide gaps! (4.5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 5,
    crystalCost: 5,
    unlockCriteria: "Reach 5m in a run",
    stats: {
      speedMult: 1.12,
      jumpMult: 1.0,
      maxJumps: 2,
      hasDash: true,
      dashCooldownMs: 4500,
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
    abilityDesc: "Hold jump in mid-air to float gently across wide spike pits +15% Jump Height.",
    unlockedByDefault: false,
    unlockDistanceMeters: 10,
    crystalCost: 12,
    unlockCriteria: "Reach 10m in a run",
    stats: {
      speedMult: 1.0,
      jumpMult: 1.15,
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
    id: "aegis_blaster",
    name: "AEGIS BLASTER",
    title: "Shielded Void Pulse",
    color: "#06b6d4",
    trailColor: "#22d3ee",
    abilityName: "Shield & Void Blast [SHIFT / E]",
    abilityDesc: "Absorbs 1 spike hit per lap + Active Void Blast pushes the Shadow Void back 60°! (6.5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 20,
    crystalCost: 20,
    unlockCriteria: "Reach 20m in a run",
    stats: {
      speedMult: 1.05,
      jumpMult: 1.05,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 1,
      hasSolarBlast: true,
      solarCooldownMs: 6500,
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
    abilityDesc: "Emits a high-powered solar shockwave that pushes the Void back 60°! (7.5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 35,
    crystalCost: 35,
    unlockCriteria: "Reach 35m in a run",
    stats: {
      speedMult: 1.08,
      jumpMult: 1.08,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: true,
      solarCooldownMs: 7500,
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
    abilityDesc: "Passive +18% movement speed boost and heightened agility.",
    unlockedByDefault: false,
    unlockDistanceMeters: 50,
    crystalCost: 50,
    unlockCriteria: "Reach 50m in a run",
    stats: {
      speedMult: 1.18,
      jumpMult: 1.12,
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
    abilityDesc: "Pulls nearby crystals towards you automatically within radius!",
    unlockedByDefault: false,
    unlockDistanceMeters: 70,
    crystalCost: 75,
    unlockCriteria: "Reach 70m in a run",
    stats: {
      speedMult: 1.05,
      jumpMult: 1.08,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 220,
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
    abilityDesc: "Unlocks Mid-Air Triple Jump + 20% Speed & Crystal Magnet!",
    unlockedByDefault: false,
    unlockDistanceMeters: 95,
    crystalCost: 100,
    unlockCriteria: "Reach 95m in a run",
    stats: {
      speedMult: 1.2,
      jumpMult: 1.18,
      maxJumps: 3,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 1,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 250,
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
    abilityDesc: "Become ethereal & invulnerable to all spikes for 3 seconds! (10s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 120,
    crystalCost: 140,
    unlockCriteria: "Reach 120m in a run",
    stats: {
      speedMult: 1.12,
      jumpMult: 1.12,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: true,
      phaseCooldownMs: 10000
    }
  },
  {
    id: "storm_light",
    name: "STORM VOID",
    title: "Lightning Multi-Leap",
    color: "#0ea5e9",
    trailColor: "#38bdf8",
    abilityName: "Triple Jump & Speed [Passive]",
    abilityDesc: "Perform up to 3 mid-air jumps with electrifying speed!",
    unlockedByDefault: false,
    unlockDistanceMeters: 150,
    crystalCost: 180,
    unlockCriteria: "Reach 150m in a run",
    stats: {
      speedMult: 1.15,
      jumpMult: 1.15,
      maxJumps: 3,
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
    abilityName: "Single Shield & Glider",
    abilityDesc: "Passively grants 1 Spike Shield per lap + Anti-Grav Gliding!",
    unlockedByDefault: false,
    unlockDistanceMeters: 185,
    crystalCost: 240,
    unlockCriteria: "Reach 185m in a run",
    stats: {
      speedMult: 1.1,
      jumpMult: 1.15,
      maxJumps: 2,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 1,
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
    abilityName: "Quadruple Jump & Magnet",
    abilityDesc: "Perform 4 Mid-Air Jumps + Crystal Magnet + 18% Speed Boost!",
    unlockedByDefault: false,
    unlockDistanceMeters: 220,
    crystalCost: 320,
    unlockCriteria: "Reach 220m in a run",
    stats: {
      speedMult: 1.18,
      jumpMult: 1.15,
      maxJumps: 4,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 1,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 280,
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
    abilityDesc: "Fires an Emerald Shockwave pushing the Void back 180°! (8s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 260,
    crystalCost: 160,
    unlockCriteria: "Reach 260m in a run",
    stats: {
      speedMult: 1.15,
      jumpMult: 1.15,
      maxJumps: 2,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: true,
      solarCooldownMs: 8000,
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
    abilityDesc: "Hyper +22% Speed + Sonic Arc Dash (<kbd>SHIFT</kbd>)! (4.5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 300,
    crystalCost: 200,
    unlockCriteria: "Reach 300m in a run",
    stats: {
      speedMult: 1.22,
      jumpMult: 1.15,
      maxJumps: 2,
      hasDash: true,
      dashCooldownMs: 4500,
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
    abilityName: "Double Shield & Triple Jump",
    abilityDesc: "Absorbs up to 2 spike hits per lap + Mid-Air Triple Jump!",
    unlockedByDefault: false,
    unlockDistanceMeters: 350,
    crystalCost: 250,
    unlockCriteria: "Reach 350m in a run",
    stats: {
      speedMult: 1.12,
      jumpMult: 1.18,
      maxJumps: 3,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 2,
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
    abilityName: "Ultimate Cosmic Emperor",
    abilityDesc: "Penta Jumps (5x) + 2 Spike Shields + 25% Speed + Phase Invulnerability! (9s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 400,
    crystalCost: 300,
    unlockCriteria: "Reach 400m in a run",
    stats: {
      speedMult: 1.25,
      jumpMult: 1.2,
      maxJumps: 5,
      hasDash: false,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 2,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 300,
      hasPhase: true,
      phaseCooldownMs: 9000
    }
  },
  {
    id: "astral_valkyrie",
    name: "ASTRAL VALKYRIE",
    title: "Celestial Winged Flight",
    color: "#38bdf8",
    trailColor: "#93c5fd",
    abilityName: "Hexa Jump & Cosmic Magnet",
    abilityDesc: "Mid-Air Hexa Jumps (6x) + 28% Speed + Permanent Super Magnet!",
    unlockedByDefault: false,
    unlockDistanceMeters: 450,
    crystalCost: 350,
    unlockCriteria: "Reach 450m in a run",
    stats: {
      speedMult: 1.28,
      jumpMult: 1.22,
      maxJumps: 6,
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
    id: "supernova_archon",
    name: "SUPERNOVA ARCHON",
    title: "Starlight Core Blast",
    color: "#fbbf24",
    trailColor: "#fef08a",
    abilityName: "Triple Shield & Solar Blast",
    abilityDesc: "3 Spike Shields per lap + Solar Cleansing Blast! (5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 500,
    crystalCost: 400,
    unlockCriteria: "Reach 500m in a run",
    stats: {
      speedMult: 1.30,
      jumpMult: 1.25,
      maxJumps: 4,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 3,
      hasSolarBlast: true,
      solarCooldownMs: 5000,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "chrono_monarch",
    name: "CHRONO MONARCH",
    title: "Time Warp Weaver",
    color: "#10b981",
    trailColor: "#6ee7b7",
    abilityName: "Time Glide & Sonic Dash",
    abilityDesc: "Hold Jump Anti-Grav Float + High Speed Sonic Air Dash! (3.5s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 550,
    crystalCost: 450,
    unlockCriteria: "Reach 550m in a run",
    stats: {
      speedMult: 1.32,
      jumpMult: 1.25,
      maxJumps: 5,
      hasDash: true,
      dashCooldownMs: 3500,
      hasFloat: true,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "quantum_god",
    name: "QUANTUM GOD",
    title: "Subatomic Void Phase",
    color: "#8b5cf6",
    trailColor: "#c4b5fd",
    abilityName: "Rapid Quantum Shift",
    abilityDesc: "Hexa Jumps (6x) + Rapid Phase Shift Invulnerability! (4s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 600,
    crystalCost: 500,
    unlockCriteria: "Reach 600m in a run",
    stats: {
      speedMult: 1.35,
      jumpMult: 1.28,
      maxJumps: 6,
      hasDash: false,
      hasFloat: false,
      hasShield: false,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 320,
      hasPhase: true,
      phaseCooldownMs: 4000
    }
  },
  {
    id: "dragon_seraph",
    name: "DRAGON SERAPH",
    title: "Inferno Dragon Wings",
    color: "#ef4444",
    trailColor: "#fca5a5",
    abilityName: "Octa Jump & Triple Shield",
    abilityDesc: "Octa Jumps (8x) + 3 Spike Shields + Solar Blast Clearing!",
    unlockedByDefault: false,
    unlockDistanceMeters: 650,
    crystalCost: 600,
    unlockCriteria: "Reach 650m in a run",
    stats: {
      speedMult: 1.38,
      jumpMult: 1.30,
      maxJumps: 8,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 3,
      hasSolarBlast: true,
      solarCooldownMs: 4000,
      hasMagnet: false,
      hasPhase: false
    }
  },
  {
    id: "cyber_omega",
    name: "CYBER OMEGA ZERO",
    title: "Matrix Cyber God",
    color: "#06b6d4",
    trailColor: "#67e8f9",
    abilityName: "Unlimited Jumps & Hyper Dash",
    abilityDesc: "Unlimited Mid-Air Jumps (99x) + Hyper Air Dash! (3s Cooldown)",
    unlockedByDefault: false,
    unlockDistanceMeters: 700,
    crystalCost: 700,
    unlockCriteria: "Reach 700m in a run",
    stats: {
      speedMult: 1.40,
      jumpMult: 1.32,
      maxJumps: 99,
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
    id: "void_eclipse",
    name: "VOID ECLIPSE DEITY",
    title: "Shadow Core Ruler",
    color: "#a855f7",
    trailColor: "#e9d5ff",
    abilityName: "Quad Shield & Rapid Phase",
    abilityDesc: "Deca Jumps (10x) + 4 Spike Shields + Rapid Phase Invulnerability!",
    unlockedByDefault: false,
    unlockDistanceMeters: 800,
    crystalCost: 850,
    unlockCriteria: "Reach 800m in a run",
    stats: {
      speedMult: 1.45,
      jumpMult: 1.35,
      maxJumps: 10,
      hasDash: false,
      hasFloat: false,
      hasShield: true,
      shieldMaxPerLap: 4,
      hasSolarBlast: false,
      hasMagnet: true,
      magnetRadius: 360,
      hasPhase: true,
      phaseCooldownMs: 3000
    }
  },
  {
    id: "singularity_god",
    name: "SINGULARITY GOD",
    title: "Ultimate Universe Singularity",
    color: "#f43f5e",
    trailColor: "#ffffff",
    abilityName: "ULTIMATE UNIVERSE SINGULARITY",
    abilityDesc: "THE ULTIMATE COSMIC GOD: Unlimited Jumps + 5 Spike Shields + Solar Blast + Super Magnet + Rapid Phase!",
    unlockedByDefault: false,
    unlockDistanceMeters: 1000,
    crystalCost: 1000,
    unlockCriteria: "Reach 1000m in a run",
    stats: {
      speedMult: 1.50,
      jumpMult: 1.40,
      maxJumps: 99,
      hasDash: true,
      dashCooldownMs: 2500,
      hasFloat: true,
      hasShield: true,
      shieldMaxPerLap: 5,
      hasSolarBlast: true,
      solarCooldownMs: 3000,
      hasMagnet: true,
      magnetRadius: 400,
      hasPhase: true,
      phaseCooldownMs: 3000
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
