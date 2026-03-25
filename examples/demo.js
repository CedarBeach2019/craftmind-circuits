// ═══════════════════════════════════════════════════════════════
// CraftMind Circuits — Demo
// ═══════════════════════════════════════════════════════════════

import { Player, Academy } from '../src/academy.js';
import { loadChallenges, getChallengesByTier } from '../src/circuit-challenges.js';
import { DailyChallengeGenerator } from '../src/daily-challenges.js';
import { AchievementSystem } from '../src/achievements.js';
import { Inventory, POWERUPS } from '../src/inventory.js';
import { RedstoneValidator } from '../src/redstone-validator.js';
import { Scoreboard } from '../src/scoreboard.js';
import { TutorBot } from '../src/tutor-bot.js';

console.log(`
⚡ CraftMind Circuits — Redstone Academy Demo
════════════════════════════════════════════
`);

// Player
const player = new Player('demo-1', 'DemoPlayer');
console.log(`👨‍🎓 Player: ${player.name} (Level ${player.level}, ${player.xp} XP)`);

// Academy
const academy = new Academy();
academy.registerPlayer('demo-1', 'DemoPlayer');
console.log(`🏫 Academy: ${academy.players.size} player(s) registered`);

// Challenges
const challenges = loadChallenges();
const tiers = [...new Set(challenges.map(c => c.tier))];
console.log(`\n📋 Challenges: ${challenges.length} total`);
for (const tier of tiers) {
  const count = getChallengesByTier(tier).length;
  console.log(`   ${tier}: ${count} challenges`);
}

// Daily challenge
console.log('\n📅 Daily Challenge: (would be generated per player level)');

// Tutor bot
const tutor = new TutorBot();
tutor.celebrate('demo-1', 'First Circuit');
console.log('\n🤖 Tutor celebrated: First Circuit');

// Power-ups
console.log('\n🔧 Power-ups:');
for (const [name, pu] of Object.entries(POWERUPS)) {
  console.log(`   ${name}: ${pu.description || pu.name || name}`);
}

// Scoreboard
const scoreboard = new Scoreboard();
console.log(`\n🏆 Scoreboard initialized`);

console.log('\n✨ Demo complete!');
