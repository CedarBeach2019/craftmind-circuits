/**
 * CraftMind Circuits — Academy Hub
 * Player leveling, XP, quests, points economy, streaks.
 */

import { loadChallenges } from './circuit-challenges.js';

const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800];
const STREAK_MULTIPLIERS = [1, 1, 1.2, 1.5, 2, 2.5, 3];

export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.xp = 0;
    this.level = 1;
    this.points = 0;
    this.streak = 0;
    this.lastLogin = null;
    this.completedChallenges = [];
    this.activeQuests = [];
    this.inventory = [];
  }

  addXP(amount, streakMultiplier = 1) {
    const total = Math.floor(amount * streakMultiplier);
    this.xp += total;
    while (this.level < 10 && this.xp >= XP_THRESHOLDS[this.level]) {
      this.level++;
    }
    return total;
  }

  getProgress() {
    const prev = XP_THRESHOLDS[this.level - 1] || 0;
    const next = XP_THRESHOLDS[this.level] || this.xp;
    return { level: this.level, xp: this.xp, prev, next, pct: Math.min(1, (this.xp - prev) / (next - prev)) };
  }

  login() {
    const today = new Date().toDateString();
    if (this.lastLogin === today) return STREAK_MULTIPLIERS[Math.min(this.streak, STREAK_MULTIPLIERS.length - 1)];
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    this.streak = this.lastLogin === yesterday ? this.streak + 1 : 1;
    this.lastLogin = today;
    return STREAK_MULTIPLIERS[Math.min(this.streak, STREAK_MULTIPLIERS.length - 1)];
  }
}

export class Academy {
  constructor() {
    this.players = new Map();
    this.challenges = loadChallenges();
  }

  registerPlayer(id, name) {
    const p = new Player(id, name);
    this.players.set(id, p);
    return p;
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  completeChallenge(playerId, challengeId, { stars, timeMs, blocksUsed }) {
    const player = this.getPlayer(playerId);
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!player || !challenge) return null;

    const streakMult = player.login();
    const xp = challenge.xpReward * stars;
    const bonusXP = timeMs < challenge.timeLimit * 0.5 ? 50 : timeMs < challenge.timeLimit * 0.75 ? 25 : 0;
    const totalXP = player.addXP(xp + bonusXP, streakMult);
    const pointsEarned = challenge.pointsReward * stars;

    player.points += pointsEarned;
    if (!player.completedChallenges.includes(challengeId)) {
      player.completedChallenges.push(challengeId);
    }

    return { xp: totalXP, points: pointsEarned, stars, level: player.level, streakMult };
  }
}
