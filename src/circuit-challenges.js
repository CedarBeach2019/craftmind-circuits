/**
 * CraftMind Circuits — Challenge Framework
 * Loads, categorizes, and rates challenges.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
let cached = null;

export function loadChallenges() {
  if (cached) return cached;
  const raw = readFileSync(join(__dirname, '..', 'data', 'challenges.json'), 'utf-8');
  cached = JSON.parse(raw);
  return cached;
}

export function getChallengesByTier(tier) {
  return loadChallenges().filter(c => c.tier === tier);
}

export function getChallengesByCategory(category) {
  return loadChallenges().filter(c => c.category === category);
}

export function rateChallenge(challenge, { correct, timeMs, blocksUsed }) {
  let stars = 0;
  if (correct) {
    stars = 1;
    const eff = blocksUsed <= (challenge.parBlocks || Infinity) ? 1 : 0;
    const spd = timeMs < challenge.timeLimit * 500 ? 1 : 0;
    stars += eff + spd;
  }
  return { stars: Math.min(stars, 3), correct, efficiency: blocksUsed <= (challenge.parBlocks || Infinity), speed: timeMs < challenge.timeLimit * 0.5 };
}
