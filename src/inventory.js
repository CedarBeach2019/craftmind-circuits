/**
 * CraftMind Circuits — Inventory & Power-up System
 */

const POWERUPS = {
  circuit_blueprint: { name: 'Circuit Blueprint', emoji: '📐', desc: 'Reveals the solution hint for your current challenge', rarity: 'common' },
  time_freeze: { name: 'Time Freeze', emoji: '⏸️', desc: 'Pauses the challenge timer for 30 seconds', rarity: 'rare' },
  block_magnet: { name: 'Block Magnet', emoji: '🧲', desc: 'Auto-collects all required blocks for your challenge', rarity: 'uncommon' },
  observer_eye: { name: 'Observer Eye', emoji: '👁️', desc: 'Highlights all redstone connections in your build', rarity: 'rare' },
  redstone_compass: { name: 'Redstone Compass', emoji: '🧭', desc: 'Points to the nearest redstone component in your inventory', rarity: 'common' },
  xp_boost: { name: 'XP Boost', emoji: '⚡', desc: 'Doubles XP from your next challenge completion', rarity: 'epic' },
  star_shine: { name: 'Star Shine', emoji: '⭐', desc: 'Guarantees at least 2 stars on your next challenge', rarity: 'legendary' },
};

const CRAFTING = {
  observer_eye: { circuit_blueprint: 3, redstone_compass: 2 },
  time_freeze: { block_magnet: 2, redstone_compass: 1 },
  xp_boost: { circuit_blueprint: 5, block_magnet: 3 },
  star_shine: { xp_boost: 2, observer_eye: 2, time_freeze: 1 },
};

const RARITY_DROPS = { common: 0.5, uncommon: 0.25, rare: 0.15, epic: 0.07, legendary: 0.03 };

export class Inventory {
  constructor() {
    this.items = { circuit_blueprint: 0, time_freeze: 0, block_magnet: 0, observer_eye: 0, redstone_compass: 0, xp_boost: 0, star_shine: 0 };
  }

  addItem(id, count = 1) {
    if (!POWERUPS[id]) return false;
    this.items[id] = (this.items[id] || 0) + count;
    return true;
  }

  useItem(id) {
    if (!this.items[id] || this.items[id] <= 0) return false;
    this.items[id]--;
    return true;
  }

  canCraft(id) {
    const recipe = CRAFTING[id];
    if (!recipe) return false;
    return Object.entries(recipe).every(([item, qty]) => (this.items[item] || 0) >= qty);
  }

  craft(id) {
    if (!this.canCraft(id)) return false;
    const recipe = CRAFTING[id];
    for (const [item, qty] of Object.entries(recipe)) this.items[item] -= qty;
    this.items[id] = (this.items[id] || 0) + 1;
    return true;
  }

  getRandomDrop(stars) {
    // Higher stars = better drop chances
    const roll = Math.random() * (1 - stars * 0.05);
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(RARITY_DROPS)) {
      cumulative += chance;
      if (roll < cumulative) {
        const candidates = Object.entries(POWERUPS).filter(([, p]) => p.rarity === rarity);
        if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)][0];
      }
    }
    return 'circuit_blueprint';
  }

  list() {
    return Object.entries(this.items).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...POWERUPS[id], id, qty }));
  }
}

export { POWERUPS, CRAFTING };
