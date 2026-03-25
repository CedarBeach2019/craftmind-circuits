/**
 * CraftMind Circuits — Achievement System
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACHIEVEMENTS = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'achievements.json'), 'utf-8'));

const TIERS = { bronze: 10, silver: 25, gold: 50, diamond: 100 };

export class AchievementSystem {
  constructor() {
    this.unlocked = new Map(); // playerId -> Set<achievementId>
  }

  check(playerId, context) {
    const earned = [];
    const playerUnlocked = this.unlocked.get(playerId) || new Set();

    for (const ach of ACHIEVEMENTS) {
      if (playerUnlocked.has(ach.id)) continue;
      if (ach.hidden && !this._testCondition(ach, context)) continue;
      if (this._testCondition(ach, context)) {
        playerUnlocked.add(ach.id);
        earned.push(ach);
      }
    }

    this.unlocked.set(playerId, playerUnlocked);
    return earned;
  }

  _testCondition(ach, ctx) {
    const cond = ach.condition;
    if (cond.type === 'first_challenge') return ctx.completedCount >= 1;
    if (cond.type === 'speed_demon') return ctx.timeMs < cond.threshold;
    if (cond.type === 'perfectionist') return ctx.wastedBlocks === 0;
    if (cond.type === 'challenge_count') return ctx.completedCount >= cond.count;
    if (cond.type === 'night_owl') return ctx.timeOfDay >= 18 || ctx.timeOfDay < 6;
    if (cond.type === 'minimalist') return ctx.blocksUsed <= cond.maxBlocks;
    if (cond.type === 'streak') return ctx.streak >= cond.days;
    if (cond.type === 'all_challenges') return ctx.completedCount >= cond.count;
    if (cond.type === 'level_reached') return ctx.level >= cond.level;
    if (cond.type === 'three_stars') return ctx.threeStarCount >= cond.count;
    if (cond.type === 'category_master') return ctx.categoriesComplete >= cond.count;
    return false;
  }

  getUnlocked(playerId) {
    return [...(this.unlocked.get(playerId) || [])].map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
  }

  getProgress(playerId) {
    const unlocked = this.unlocked.get(playerId)?.size || 0;
    return { unlocked, total: ACHIEVEMENTS.length, pct: unlocked / ACHIEVEMENTS.length };
  }
}
