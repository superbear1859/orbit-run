// Deterministic hand-crafted level layouts for Orbit Run: Shadow Void
// "THE FLOOR IS SPIKES" - The entire base planet surface is 100% covered in spikes!
// Player must leap between floating block platforms to survive.

export const PLANET_RADIUS = 340;

export const LAPS = [
  // LAP 1: Floating Block Stepping Stones
  {
    lapNumber: 1,
    name: "Spike Floor Awakening",
    bgHue: 220,
    planetColor: "#1e293b",
    glowColor: "#f43f5e",
    platforms: [
      { startAngle: -5, endAngle: 25, radiusOffset: 50 }, // Starting platform
      { startAngle: 35, endAngle: 55, radiusOffset: 85 },
      { startAngle: 65, endAngle: 85, radiusOffset: 125 },
      { startAngle: 95, endAngle: 120, radiusOffset: 65 },
      { startAngle: 130, endAngle: 150, radiusOffset: 105 },
      { startAngle: 160, endAngle: 180, radiusOffset: 145 },
      { startAngle: 190, endAngle: 215, radiusOffset: 75 },
      { startAngle: 225, endAngle: 245, radiusOffset: 115 },
      { startAngle: 255, endAngle: 275, radiusOffset: 155 },
      { startAngle: 285, endAngle: 305, radiusOffset: 85 },
      { startAngle: 315, endAngle: 340, radiusOffset: 60 }
    ],
    floatingSpikes: [
      { angle: 138, radiusOffset: 175, widthAngle: 8 },
      { angle: 265, radiusOffset: 210, widthAngle: 8 }
    ],
    crystals: [
      { angle: 45, radiusOffset: 115 },
      { angle: 75, radiusOffset: 155 },
      { angle: 140, radiusOffset: 135 },
      { angle: 235, radiusOffset: 145 },
      { angle: 295, radiusOffset: 115 }
    ],
    enemies: [
      { id: 'drone_1_1', type: 'shadow_drone', minAngle: 40, maxAngle: 75, currentAngle: 40, radiusOffset: 95, speed: 0.2, dir: 1 },
      { id: 'drone_1_2', type: 'shadow_drone', minAngle: 170, maxAngle: 200, currentAngle: 170, radiusOffset: 85, speed: 0.25, dir: 1 },
      { id: 'mine_1_1', type: 'plasma_mine', angle: 260, radiusOffset: 165 }
    ]
  },

  // LAP 2: Archipelago Jump Trial
  {
    lapNumber: 2,
    name: "Spike Archipelago",
    bgHue: 270,
    planetColor: "#2e1065",
    glowColor: "#f43f5e",
    platforms: [
      { startAngle: -5, endAngle: 20, radiusOffset: 60 },
      { startAngle: 28, endAngle: 45, radiusOffset: 110 },
      { startAngle: 52, endAngle: 70, radiusOffset: 160 },
      { startAngle: 78, endAngle: 95, radiusOffset: 100 },
      { startAngle: 102, endAngle: 122, radiusOffset: 60 },
      { startAngle: 130, endAngle: 148, radiusOffset: 120 },
      { startAngle: 155, endAngle: 175, radiusOffset: 170 },
      { startAngle: 182, endAngle: 202, radiusOffset: 95 },
      { startAngle: 210, endAngle: 228, radiusOffset: 135 },
      { startAngle: 236, endAngle: 256, radiusOffset: 75 },
      { startAngle: 265, endAngle: 285, radiusOffset: 125 },
      { startAngle: 293, endAngle: 312, radiusOffset: 165 },
      { startAngle: 320, endAngle: 342, radiusOffset: 80 }
    ],
    floatingSpikes: [
      { angle: 40, radiusOffset: 180, widthAngle: 7 },
      { angle: 142, radiusOffset: 190, widthAngle: 7 },
      { angle: 275, radiusOffset: 190, widthAngle: 7 }
    ],
    crystals: [
      { angle: 36, radiusOffset: 140 },
      { angle: 61, radiusOffset: 190 },
      { angle: 139, radiusOffset: 150 },
      { angle: 165, radiusOffset: 200 },
      { angle: 275, radiusOffset: 155 }
    ],
    enemies: [
      { id: 'drone_2_1', type: 'shadow_drone', minAngle: 30, maxAngle: 60, currentAngle: 30, radiusOffset: 125, speed: 0.22, dir: 1 },
      { id: 'drone_2_2', type: 'shadow_drone', minAngle: 110, maxAngle: 140, currentAngle: 110, radiusOffset: 75, speed: 0.28, dir: 1 },
      { id: 'mine_2_1', type: 'plasma_mine', angle: 165, radiusOffset: 185 },
      { id: 'drone_2_3', type: 'shadow_drone', minAngle: 220, maxAngle: 250, currentAngle: 220, radiusOffset: 90, speed: 0.25, dir: 1 }
    ]
  },

  // LAP 3: Skyward Towers
  {
    lapNumber: 3,
    name: "Spiked Abyss Towers",
    bgHue: 320,
    planetColor: "#4c0519",
    glowColor: "#f43f5e",
    platforms: [
      { startAngle: -5, endAngle: 18, radiusOffset: 70 },
      { startAngle: 25, endAngle: 40, radiusOffset: 135 },
      { startAngle: 48, endAngle: 62, radiusOffset: 190 },
      { startAngle: 70, endAngle: 85, radiusOffset: 115 },
      { startAngle: 93, endAngle: 110, radiusOffset: 65 },
      { startAngle: 118, endAngle: 132, radiusOffset: 140 },
      { startAngle: 140, endAngle: 155, radiusOffset: 195 },
      { startAngle: 165, endAngle: 182, radiusOffset: 125 },
      { startAngle: 190, endAngle: 208, radiusOffset: 70 },
      { startAngle: 215, endAngle: 232, radiusOffset: 145 },
      { startAngle: 240, endAngle: 258, radiusOffset: 195 },
      { startAngle: 268, endAngle: 285, radiusOffset: 120 },
      { startAngle: 292, endAngle: 310, radiusOffset: 75 },
      { startAngle: 318, endAngle: 340, radiusOffset: 145 }
    ],
    floatingSpikes: [
      { angle: 55, radiusOffset: 225, widthAngle: 8 },
      { angle: 147, radiusOffset: 235, widthAngle: 8 },
      { angle: 249, radiusOffset: 235, widthAngle: 8 }
    ],
    crystals: [
      { angle: 55, radiusOffset: 220 },
      { angle: 147, radiusOffset: 230 },
      { angle: 249, radiusOffset: 230 }
    ],
    enemies: [
      { id: 'drone_3_1', type: 'shadow_drone', minAngle: 30, maxAngle: 55, currentAngle: 30, radiusOffset: 150, speed: 0.3, dir: 1 },
      { id: 'mine_3_1', type: 'plasma_mine', angle: 125, radiusOffset: 155 },
      { id: 'drone_3_2', type: 'shadow_drone', minAngle: 170, maxAngle: 195, currentAngle: 170, radiusOffset: 140, speed: 0.32, dir: 1 },
      { id: 'mine_3_2', type: 'plasma_mine', angle: 245, radiusOffset: 210 },
      { id: 'drone_3_3', type: 'shadow_drone', minAngle: 295, maxAngle: 320, currentAngle: 295, radiusOffset: 90, speed: 0.28, dir: 1 }
    ]
  },

  // LAP 4: Sky High Highway
  {
    lapNumber: 4,
    name: "Full Spike Highway",
    bgHue: 170,
    planetColor: "#042f2e",
    glowColor: "#f43f5e",
    platforms: [
      { startAngle: -5, endAngle: 15, radiusOffset: 80 },
      { startAngle: 22, endAngle: 35, radiusOffset: 140 },
      { startAngle: 42, endAngle: 55, radiusOffset: 205 },
      { startAngle: 62, endAngle: 75, radiusOffset: 145 },
      { startAngle: 82, endAngle: 95, radiusOffset: 85 },
      { startAngle: 102, endAngle: 115, radiusOffset: 150 },
      { startAngle: 122, endAngle: 135, radiusOffset: 210 },
      { startAngle: 142, endAngle: 155, radiusOffset: 150 },
      { startAngle: 162, endAngle: 175, radiusOffset: 85 },
      { startAngle: 182, endAngle: 195, radiusOffset: 145 },
      { startAngle: 202, endAngle: 215, radiusOffset: 205 },
      { startAngle: 222, endAngle: 235, radiusOffset: 145 },
      { startAngle: 242, endAngle: 255, radiusOffset: 85 },
      { startAngle: 262, endAngle: 275, radiusOffset: 150 },
      { startAngle: 282, endAngle: 295, radiusOffset: 210 },
      { startAngle: 302, endAngle: 315, radiusOffset: 150 },
      { startAngle: 322, endAngle: 342, radiusOffset: 85 }
    ],
    floatingSpikes: [
      { angle: 48, radiusOffset: 245, widthAngle: 8 },
      { angle: 128, radiusOffset: 250, widthAngle: 8 },
      { angle: 208, radiusOffset: 245, widthAngle: 8 },
      { angle: 288, radiusOffset: 250, widthAngle: 8 }
    ],
    crystals: [
      { angle: 48, radiusOffset: 240 },
      { angle: 128, radiusOffset: 245 },
      { angle: 208, radiusOffset: 240 },
      { angle: 288, radiusOffset: 245 }
    ],
    enemies: [
      { id: 'drone_4_1', type: 'shadow_drone', minAngle: 25, maxAngle: 50, currentAngle: 25, radiusOffset: 155, speed: 0.35, dir: 1 },
      { id: 'mine_4_1', type: 'plasma_mine', angle: 105, radiusOffset: 165 },
      { id: 'drone_4_2', type: 'shadow_drone', minAngle: 145, maxAngle: 170, currentAngle: 145, radiusOffset: 160, speed: 0.35, dir: 1 },
      { id: 'mine_4_2', type: 'plasma_mine', angle: 225, radiusOffset: 160 },
      { id: 'drone_4_3', type: 'shadow_drone', minAngle: 265, maxAngle: 290, currentAngle: 265, radiusOffset: 165, speed: 0.35, dir: 1 }
    ]
  },

  // LAP 5+: Overdrive Spike Trial
  {
    lapNumber: 5,
    name: "Master Spike Trial",
    bgHue: 350,
    planetColor: "#450a0a",
    glowColor: "#ef4444",
    platforms: [
      { startAngle: -5, endAngle: 12, radiusOffset: 90 },
      { startAngle: 18, endAngle: 30, radiusOffset: 160 },
      { startAngle: 36, endAngle: 48, radiusOffset: 220 },
      { startAngle: 54, endAngle: 66, radiusOffset: 160 },
      { startAngle: 72, endAngle: 84, radiusOffset: 95 },
      { startAngle: 90, endAngle: 102, radiusOffset: 165 },
      { startAngle: 108, endAngle: 120, radiusOffset: 225 },
      { startAngle: 126, endAngle: 138, radiusOffset: 165 },
      { startAngle: 144, endAngle: 156, radiusOffset: 95 },
      { startAngle: 162, endAngle: 174, radiusOffset: 160 },
      { startAngle: 180, endAngle: 192, radiusOffset: 220 },
      { startAngle: 198, endAngle: 210, radiusOffset: 160 },
      { startAngle: 216, endAngle: 228, radiusOffset: 95 },
      { startAngle: 234, endAngle: 246, radiusOffset: 165 },
      { startAngle: 252, endAngle: 264, radiusOffset: 225 },
      { startAngle: 270, endAngle: 282, radiusOffset: 165 },
      { startAngle: 288, endAngle: 300, radiusOffset: 95 },
      { startAngle: 306, endAngle: 318, radiusOffset: 160 },
      { startAngle: 324, endAngle: 342, radiusOffset: 220 }
    ],
    floatingSpikes: [
      { angle: 42, radiusOffset: 260, widthAngle: 8 },
      { angle: 114, radiusOffset: 265, widthAngle: 8 },
      { angle: 186, radiusOffset: 260, widthAngle: 8 },
      { angle: 258, radiusOffset: 265, widthAngle: 8 }
    ],
    crystals: [
      { angle: 42, radiusOffset: 255 },
      { angle: 114, radiusOffset: 260 },
      { angle: 186, radiusOffset: 255 },
      { angle: 258, radiusOffset: 260 }
    ],
    enemies: [
      { id: 'drone_5_1', type: 'shadow_drone', minAngle: 20, maxAngle: 45, currentAngle: 20, radiusOffset: 175, speed: 0.4, dir: 1 },
      { id: 'mine_5_1', type: 'plasma_mine', angle: 95, radiusOffset: 180 },
      { id: 'drone_5_2', type: 'shadow_drone', minAngle: 130, maxAngle: 155, currentAngle: 130, radiusOffset: 180, speed: 0.4, dir: 1 },
      { id: 'mine_5_2', type: 'plasma_mine', angle: 200, radiusOffset: 175 },
      { id: 'drone_5_3', type: 'shadow_drone', minAngle: 240, maxAngle: 265, currentAngle: 240, radiusOffset: 180, speed: 0.4, dir: 1 },
      { id: 'mine_5_3', type: 'plasma_mine', angle: 310, radiusOffset: 175 }
    ]
  }
];

export function generateRandomPowerUps(lapData) {
  if (!lapData.platforms || lapData.platforms.length === 0) return [];

  // 40% Chance per lap to spawn ANY power-up at all (Makes them rare!)
  if (Math.random() > 0.40) {
    return [];
  }

  const types = ['hyper_speed', 'star_invincible', 'super_magnet'];
  const powerUps = [];

  // Max 1 rare power-up per lap when triggered!
  const availablePlats = [...lapData.platforms];
  const randomIndex = Math.floor(Math.random() * availablePlats.length);
  const plat = availablePlats[randomIndex];

  const span = Math.max(2, plat.endAngle - plat.startAngle - 4);
  const randomAngle = plat.startAngle + 2 + Math.random() * span;
  const randomType = types[Math.floor(Math.random() * types.length)];

  powerUps.push({
    id: `p_rand_${Date.now()}_${Math.random()}`,
    type: randomType,
    angle: Math.round(randomAngle),
    radiusOffset: plat.radiusOffset + 35,
    durationMs: 6000,
    collected: false
  });

  return powerUps;
}

export function getLapData(lapIndex) {
  const safeIndex = Math.max(0, Math.floor(lapIndex || 0));
  let lapData;

  if (safeIndex < LAPS.length) {
    lapData = JSON.parse(JSON.stringify(LAPS[safeIndex]));
  } else {
    const base = LAPS[LAPS.length - 1];
    const copy = JSON.parse(JSON.stringify(base));
    lapData = {
      ...copy,
      lapNumber: safeIndex + 1,
      name: `Spike Trial Lap ${safeIndex + 1}`,
      bgHue: (base.bgHue + (safeIndex - 4) * 40) % 360
    };
  }

  // Generate rare randomized 6-second power-ups
  lapData.powerUps = generateRandomPowerUps(lapData);
  return lapData;
}
