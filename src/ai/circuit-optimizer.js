/**
 * @module craftmind-circuits/ai/circuit-optimizer
 * @description Comparative evaluation for circuit designs — which design is best?
 * Tracks different solutions to the same challenge and ranks by efficiency,
 * speed, and elegance. Adapted from fishing's ComparativeEvaluator.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { clamp } from './utils.js';

/**
 * @typedef {object} CircuitResult
 * @property {string} playerId
 * @property {string} challengeId
 * @property {object} circuit - { gates, wires }
 * @property {number} gateCount
 * @property {number} wireCount
 * @property {number} timeMs
 * @property {boolean} correct
 * @property {number} score
 * @property {number} timestamp
 */

export class CircuitOptimizer {
  constructor(dataDir = './data/circuits') {
    this.dataDir = dataDir;
    this._ensureDir(this.dataDir);
    this.solutions = [];
    this._loadSolutions();
  }

  _ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  _loadSolutions() {
    const file = join(this.dataDir, 'solutions.json');
    if (existsSync(file)) {
      try { this.solutions = JSON.parse(readFileSync(file, 'utf-8')); } catch { this.solutions = []; }
    }
  }

  _saveSolutions() {
    writeFileSync(join(this.dataDir, 'solutions.json'), JSON.stringify(this.solutions, null, 2));
  }

  /**
   * Score a circuit solution on 0-1 scale.
   */
  scoreSolution(result) {
    let score = 0;

    // Correctness is king
    if (result.correct) score += 0.4;
    else return 0;

    // Gate efficiency: fewer gates = higher score
    const parGates = result.parGates || 5;
    const gateRatio = result.gateCount / parGates;
    score += clamp(0, 0.2, 0.2 * (1 / Math.max(1, gateRatio)));

    // Wire efficiency
    const wireRatio = result.wireCount / Math.max(1, result.gateCount);
    score += clamp(0, 0.1, 0.1 * (1 / Math.max(1, wireRatio)));

    // Speed bonus
    const parTime = result.parTime || 60000;
    if (result.timeMs < parTime * 0.5) score += 0.15;
    else if (result.timeMs < parTime) score += 0.1;
    else score += 0.05;

    // Elegance: no redundant gates
    if (result.noRedundancy) score += 0.1;

    // Consistency bonus: same challenge done before with lower score
    const prev = this.solutions.filter(s => s.challengeId === result.challengeId && s.playerId === result.playerId);
    if (prev.length > 0 && prev[prev.length - 1].score < score) score += 0.05; // improvement bonus

    return clamp(0, 1, score);
  }

  /**
   * Record a solution.
   */
  recordSolution(result) {
    const scored = { ...result, score: this.scoreSolution(result), timestamp: Date.now() };
    this.solutions.push(scored);
    if (this.solutions.length > 2000) this.solutions = this.solutions.slice(-2000);
    this._saveSolutions();
    return scored;
  }

  /**
   * Compare player's solution against others for the same challenge.
   */
  compare(solution) {
    const others = this.solutions.filter(s =>
      s.challengeId === solution.challengeId && s.playerId !== solution.playerId && s.correct
    );

    const playerScore = solution.score || this.scoreSolution(solution);

    // Rank
    const betterCount = others.filter(s => s.score > playerScore).length;
    const rank = betterCount + 1;
    const total = others.length + 1;

    // Find best solution
    const best = others.sort((a, b) => b.score - a.score)[0];

    // Stats
    const avgGates = others.length > 0
      ? others.reduce((sum, s) => sum + (s.gateCount || 0), 0) / others.length
      : solution.gateCount;

    const minGates = others.length > 0
      ? Math.min(...others.map(s => s.gateCount || Infinity))
      : solution.gateCount;

    // Insights
    const insights = [];
    if (solution.gateCount > avgGates + 2) {
      insights.push(`Your circuit uses ${solution.gateCount - Math.round(avgGates)} more gates than average. Look for redundancy.`);
    }
    if (solution.gateCount <= minGates) {
      insights.push(`Tied for minimum gate count (${solution.gateCount})! Excellent efficiency.`);
    }
    if (best && best.gateCount < solution.gateCount) {
      insights.push(`Another solution solved it with ${best.gateCount} gates. Can you match it?`);
    }

    return { rank, total, playerScore, bestSolution: best, avgGates: Math.round(avgGates), minGates, insights };
  }

  /**
   * Get the most efficient solution for a challenge.
   */
  getBestSolution(challengeId) {
    const solutions = this.solutions.filter(s => s.challengeId === challengeId && s.correct);
    if (solutions.length === 0) return null;
    return solutions.sort((a, b) => b.score - a.score)[0];
  }

  /**
   * Get leaderboard for a challenge.
   */
  getLeaderboard(challengeId, limit = 10) {
    const bestPerPlayer = new Map();
    for (const s of this.solutions.filter(sol => sol.challengeId === challengeId && sol.correct)) {
      const prev = bestPerPlayer.get(s.playerId);
      if (!prev || s.score > prev.score) bestPerPlayer.set(s.playerId, s);
    }
    return Array.from(bestPerPlayer.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get optimization insights across all solutions.
   */
  getInsights() {
    const insights = [];

    // Most improved player
    const playerScores = {};
    for (const s of this.solutions) {
      if (!playerScores[s.playerId]) playerScores[s.playerId] = { first: null, last: null, count: 0 };
      playerScores[s.playerId].count++;
      if (!playerScores[s.playerId].first) playerScores[s.playerId].first = s.score;
      playerScores[s.playerId].last = s.score;
    }

    for (const [player, data] of Object.entries(playerScores)) {
      if (data.count >= 3 && data.last > data.first + 0.2) {
        insights.push(`${player} improved significantly: ${(data.first * 100).toFixed(0)}% → ${(data.last * 100).toFixed(0)}% across ${data.count} solutions.`);
      }
    }

    // Hardest challenge (lowest avg score)
    const challengeScores = {};
    for (const s of this.solutions) {
      if (!challengeScores[s.challengeId]) challengeScores[s.challengeId] = [];
      challengeScores[s.challengeId].push(s.score);
    }

    let hardest = null, hardestAvg = 1;
    for (const [challenge, scores] of Object.entries(challengeScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < hardestAvg && scores.length >= 3) {
        hardestAvg = avg;
        hardest = challenge;
      }
    }
    if (hardest) insights.push(`Hardest challenge: "${hardest}" (avg score: ${(hardestAvg * 100).toFixed(0)}%).`);

    return insights;
  }
}

export default CircuitOptimizer;
