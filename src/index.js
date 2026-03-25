import { Player, Academy } from './academy.js';
import { AchievementSystem } from './achievements.js';
import { loadChallenges, getChallengesByTier, getChallengesByCategory, rateChallenge } from './circuit-challenges.js';
import { DailyChallengeGenerator } from './daily-challenges.js';
import { Inventory, POWERUPS, CRAFTING } from './inventory.js';
import { RedstoneValidator } from './redstone-validator.js';
import { Scoreboard } from './scoreboard.js';
import { TutorBot } from './tutor-bot.js';

export { Player, Academy } from './academy.js';
export { AchievementSystem } from './achievements.js';
export { loadChallenges, getChallengesByTier, getChallengesByCategory, rateChallenge } from './circuit-challenges.js';
export { DailyChallengeGenerator } from './daily-challenges.js';
export { Inventory, POWERUPS, CRAFTING } from './inventory.js';
export { RedstoneValidator } from './redstone-validator.js';
export { Scoreboard } from './scoreboard.js';
export { TutorBot } from './tutor-bot.js';

/**
 * Register circuits features with CraftMind Core.
 * @param {object} core - Core instance with registerPlugin()
 */
export function registerWithCore(core) {
  core.registerPlugin('circuits', {
    name: 'CraftMind Circuits',
    version: '1.0.0',
    modules: { RedstoneValidator, TutorBot, Academy, DailyChallengeGenerator, Scoreboard },
  });
}
