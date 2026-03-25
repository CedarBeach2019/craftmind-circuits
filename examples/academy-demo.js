/**
 * CraftMind Circuits — Demo
 * Simulates academy flow without requiring a Minecraft server.
 */

import { Academy, Player } from '../src/academy.js';
import { AchievementSystem } from '../src/achievements.js';
import { loadChallenges, rateChallenge } from '../src/circuit-challenges.js';
import { DailyChallengeGenerator } from '../src/daily-challenges.js';
import { Inventory } from '../src/inventory.js';
import { Scoreboard } from '../src/scoreboard.js';
import { TutorBot } from '../src/tutor-bot.js';

const academy = new Academy();
const achievements = new AchievementSystem();
const daily = new DailyChallengeGenerator();
const scoreboard = new Scoreboard('./scoreboard-data/demo-leaderboard.json');
const tutor = new TutorBot();

// Register player
const player = academy.registerPlayer('steve', 'Steve');
console.log('⚡ CraftMind Circuits Academy ⚡\n');
console.log(`Welcome, ${player.name}!`);

// Login (streak)
const mult = player.login();
console.log(`Login streak: ${player.streak} day(s) (×${mult} XP multiplier)\n`);

// Show challenges
const challenges = loadChallenges();
console.log(`📋 ${challenges.length} challenges available across ${new Set(challenges.map(c => c.tier)).size} tiers\n`);

// Simulate completing challenges
const simChallenges = ['and-gate', 'or-gate', 'not-gate', 'clock-1hz', 'piston-door-1', 'signal-strength', 'repeater-delay', 'light-switch-room', 'daylight-sensor-lamp', 'vertical-redstone'];

for (const cid of simChallenges) {
  const challenge = challenges.find(c => c.id === cid);
  if (!challenge) continue;

  const timeMs = Math.random() * challenge.timeLimit * 800 + challenge.timeLimit * 100;
  const blocksUsed = challenge.parBlocks + Math.floor(Math.random() * 3) - 1;
  const { stars, correct } = rateChallenge(challenge, { correct: true, timeMs, blocksUsed });

  const result = academy.completeChallenge('steve', cid, { stars, timeMs, blocksUsed });
  if (!result) continue;

  // Inventory drop
  const inv = new Inventory();
  inv.addItem('circuit_blueprint', 2);
  inv.addItem('block_magnet', 1);
  const drop = inv.getRandomDrop(stars);
  inv.addItem(drop);

  // Achievements
  const earned = achievements.check('steve', {
    completedCount: player.completedChallenges.length,
    timeMs, wastedBlocks: blocksUsed - challenge.parBlocks > 0 ? blocksUsed - challenge.parBlocks : 0,
    blocksUsed, timeOfDay: 14, streak: player.streak, level: player.level,
    threeStarCount: Math.floor(Math.random() * 3), categoriesComplete: 1
  });

  const prog = player.getProgress();
  console.log(`  ${'⭐'.repeat(stars)} ${challenge.name} (${challenge.tier})`);
  console.log(`    +${result.xp} XP (×${result.streakMult})  +${result.points} pts  → Level ${prog.level} [${'█'.repeat(Math.floor(prog.pct * 10))}${'░'.repeat(10 - Math.floor(prog.pct * 10))}] ${prog.pct.toFixed(0)}%`);
  if (earned.length) console.log(`    🏅 ${earned.map(a => `${a.emoji} ${a.name} (+${a.xp}XP)`).join(', ')}`);
  if (drop) console.log(`    🎁 Dropped: ${drop}`);
  console.log();
}

// Scoreboard
scoreboard.submit('steve', 'Steve', player.xp);
console.log('🏆 Leaderboard:');
scoreboard.getLeaderboard(5).forEach((e, i) => console.log(`  ${i + 1}. ${e.playerName} — ${e.score} XP`));
console.log();

// Daily challenge
const daySeed = Math.floor(Date.now() / 86400000);
daily.generate(player.level, daySeed).then(dc => {
  console.log('📅 Daily Challenge:');
  console.log(`  ${dc.theme ? `[${dc.theme}] ` : ''}${dc.name} (${dc.tier})`);
  console.log(`  ${dc.description}`);
  console.log(`  Time limit: ${dc.timeLimit}s  |  Par: ${dc.parBlocks} blocks`);
});

// Tutor hint
console.log('\n🤖 Tutor says:');
console.log(`  "${tutor.getHint('steve', { challenge: 'AND Gate', difficulty: 'Apprentice', blocksPlaced: ['lever', 'redstone_dust'] })}"`);

// Achievement progress
const achProg = achievements.getProgress('steve');
console.log(`\n📊 Achievements: ${achProg.unlocked}/${achProg.total} unlocked`);
