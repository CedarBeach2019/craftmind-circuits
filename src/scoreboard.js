/**
 * CraftMind Circuits — Scoreboard & Leaderboard
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_FILE = './scoreboard-data/leaderboard.json';

export class Scoreboard {
  constructor(file = DEFAULT_FILE) {
    this.file = file;
    this.data = this._load();
  }

  _load() {
    try {
      if (existsSync(this.file)) return JSON.parse(readFileSync(this.file, 'utf-8'));
    } catch {}
    return { global: [], weekly: [] };
  }

  _save() {
    const dir = join(this.file, '..');
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  submit(playerId, playerName, score, category = 'global') {
    const entry = { playerId, playerName, score, timestamp: Date.now() };
    this.data.global.push(entry);
    this.data.global.sort((a, b) => b.score - a.score);
    this.data.global = this.data.global.slice(0, 100);
    this._save();
    return this.getRank(playerId);
  }

  getRank(playerId) {
    const idx = this.data.global.findIndex(e => e.playerId === playerId);
    return idx >= 0 ? idx + 1 : null;
  }

  getLeaderboard(limit = 10, category = 'global') {
    return (this.data[category] || this.data.global).slice(0, limit);
  }

  getTopByCategory(category, limit = 10) {
    // category: fastest, efficient, completed
    const filtered = this.data.global.filter(e => e.category === category);
    filtered.sort((a, b) => b.score - a.score);
    return filtered.slice(0, limit);
  }

  getWeekly() {
    const weekAgo = Date.now() - 7 * 86400000;
    return this.data.global.filter(e => e.timestamp > weekAgo).slice(0, 10);
  }

  compareWithFriends(playerId, friendIds) {
    const scores = {};
    for (const entry of this.data.global) {
      if (entry.playerId === playerId || friendIds.includes(entry.playerId)) {
        scores[entry.playerId] = entry;
      }
    }
    return Object.entries(scores).sort(([, a], [, b]) => b.score - a.score);
  }
}
