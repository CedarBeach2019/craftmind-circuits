import { Academy, Player } from '../src/academy.js';
import { loadChallenges, rateChallenge, getChallengesByTier, getChallengesByCategory } from '../src/circuit-challenges.js';
import { AchievementSystem } from '../src/achievements.js';
import { DailyChallengeGenerator } from '../src/daily-challenges.js';
import { Inventory, POWERUPS, CRAFTING } from '../src/inventory.js';
import { Scoreboard } from '../src/scoreboard.js';
import { TutorBot } from '../src/tutor-bot.js';
import { readFileSync } from 'node:fs';

let passed = 0, failed = 0;
function assert(label, cond) { if (cond) { passed++; console.log(`  ✅ ${label}`); } else { failed++; console.log(`  ❌ ${label}`); } }

console.log('🧪 CraftMind Circuits — Tests\n');

// Player & Academy
console.log('── Academy ──');
const academy = new Academy();
const player = academy.registerPlayer('test', 'TestPlayer');
assert('Player registered', player.name === 'TestPlayer');
assert('Starts at level 1', player.level === 1);

const mult = player.login();
assert('Streak multiplier', mult >= 1);

const challenges = loadChallenges();
assert('Challenges loaded', challenges.length >= 30);

const result = academy.completeChallenge('test', 'and-gate', { stars: 3, timeMs: 5000, blocksUsed: 8 });
assert('Challenge completed', result !== null && result.xp > 0);
assert('Points earned', result.points > 0);

const prog = player.getProgress();
assert('Progress tracking', prog.level >= 1 && prog.pct >= 0);

// Challenges
console.log('\n── Circuit Challenges ──');
const apprentice = getChallengesByTier('Apprentice');
assert('Apprentice challenges exist', apprentice.length > 0);
const logic = getChallengesByCategory('Logic Gates');
assert('Logic Gates challenges exist', logic.length > 0);

const rating = rateChallenge(challenges[0], { correct: true, timeMs: 30000, blocksUsed: challenges[0].parBlocks - 1 });
assert('3-star rating possible', rating.stars === 3);
const rating2 = rateChallenge(challenges[0], { correct: false, timeMs: 5000, blocksUsed: 20 });
assert('Failed = 0 stars', rating2.stars === 0);

// Achievements
console.log('\n── Achievements ──');
const achs = new AchievementSystem();
const earned = achs.check('test', { completedCount: 1, timeMs: 5000, wastedBlocks: 0, blocksUsed: 5, timeOfDay: 14, streak: 1, level: 1, threeStarCount: 0, categoriesComplete: 0 });
assert('First circuit achievement', earned.some(a => a.id === 'first_circuit'));
assert('Achievement progress', achs.getProgress('test').unlocked > 0);

// Inventory
console.log('\n── Inventory ──');
const inv = new Inventory();
inv.addItem('circuit_blueprint', 5);
inv.addItem('redstone_compass', 4);
assert('Items added', inv.items.circuit_blueprint === 5);
assert('Use item', inv.useItem('circuit_blueprint'));
assert('Item count decremented', inv.items.circuit_blueprint === 4);
assert('Cannot craft without recipe', !inv.canCraft('star_shine'));
assert('Can craft observer_eye', inv.canCraft('observer_eye'));
inv.craft('observer_eye');
assert('Observer eye crafted', inv.items.observer_eye === 1);
assert('List returns items', inv.list().length > 0);

// Scoreboard
console.log('\n── Scoreboard ──');
const sb = new Scoreboard(`./scoreboard-data/test-${Date.now()}.json`);
sb.submit('p1', 'Player1', 500);
sb.submit('p2', 'Player2', 800);
const lb = sb.getLeaderboard(5);
assert('Leaderboard sorted', lb[0].playerName === 'Player2');
assert('Rank returned', sb.getRank('p1') === 2);

// Tutor
console.log('\n── Tutor Bot ──');
const tutor = new TutorBot();
const hint = tutor._localHint({ challenge: 'test', difficulty: 'Apprentice', blocksPlaced: [] });
assert('Tutor gives hint', typeof hint === 'string' && hint.length > 0);
const celeb = tutor.celebrate('test', { name: 'First Circuit', emoji: '🌱' });
assert('Tutor celebrates', celeb.includes('First Circuit'));

// Daily Challenge
console.log('\n── Daily Challenge Generator ──');
const dc = new DailyChallengeGenerator();
const generated = dc._fallback(3, 42);
assert('Fallback generates challenge', generated.name && generated.description);
assert('Has objectives', Array.isArray(generated.objectives));

// Data integrity
console.log('\n── Data Integrity ──');
const achData = JSON.parse(readFileSync('./data/achievements.json', 'utf-8'));
assert('Achievements have conditions', achData.every(a => a.condition));
assert('Achievements have tiers', achData.every(a => a.tier));
const chData = JSON.parse(readFileSync('./data/challenges.json', 'utf-8'));
assert('Challenges have parBlocks', chData.every(c => typeof c.parBlocks === 'number'));
assert('Challenges have timeLimit', chData.every(c => typeof c.timeLimit === 'number'));
assert('Challenges have xpReward', chData.every(c => typeof c.xpReward === 'number'));

console.log(`\n${'═'.repeat(40)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(40)}`);
process.exit(failed > 0 ? 1 : 0);
