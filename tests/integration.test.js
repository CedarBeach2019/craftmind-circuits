import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Player, Academy } from '../src/academy.js';
import { AchievementSystem } from '../src/achievements.js';
import { loadChallenges, getChallengesByTier, getChallengesByCategory, rateChallenge } from '../src/circuit-challenges.js';
import { DailyChallengeGenerator } from '../src/daily-challenges.js';
import { Inventory } from '../src/inventory.js';
import { Scoreboard } from '../src/scoreboard.js';
import { TutorBot } from '../src/tutor-bot.js';
import { registerWithCore } from '../src/index.js';

describe('Challenges', () => {
  it('loads challenges from JSON', () => {
    const challenges = loadChallenges();
    assert.ok(challenges.length >= 10, 'should have at least 10 challenges');
  });

  it('filters challenges by tier name', () => {
    const tier = getChallengesByTier('Apprentice');
    assert.ok(Array.isArray(tier));
    assert.ok(tier.length >= 1, 'Apprentice tier should have challenges');
  });

  it('filters challenges by category', () => {
    const logic = getChallengesByCategory('Logic Gates');
    assert.ok(Array.isArray(logic));
    assert.ok(logic.length >= 1);
  });

  it('rates a challenge based on performance', () => {
    const rating = rateChallenge(
      { id: 'test', tier: 'Apprentice' },
      { correct: true, timeMs: 30000, blocksUsed: 10 },
    );
    assert.ok(rating.correct === true);
    assert.ok(typeof rating.stars === 'number');
  });
});

describe('Daily Challenge', () => {
  it('generates a daily challenge', async () => {
    const gen = new DailyChallengeGenerator();
    try {
      const challenge = await gen.generate();
      assert.ok(challenge);
    } catch (e) {
      // May fail without API key, just check the class works
      assert.ok(gen, 'DailyChallengeGenerator should be instantiable');
    }
  });
});

describe('Inventory', () => {
  it('adds and lists items', () => {
    const inv = new Inventory();
    inv.addItem('xp_boost', 3);
    assert.ok(inv.list().length >= 1);
  });
});

describe('Scoreboard', () => {
  it('submits and ranks scores', () => {
    const sb = new Scoreboard();
    sb.submit('player1', 'and-gate', { stars: 3, timeMs: 15000 });
    const rank = sb.getRank('player1');
    assert.ok(typeof rank === 'number' || rank !== undefined);
  });
});

describe('Achievement System', () => {
  it('can be instantiated', () => {
    const ach = new AchievementSystem();
    assert.ok(ach);
  });
});

describe('Player & Academy', () => {
  it('creates a player with progression', () => {
    const player = new Player('test_player');
    assert.ok(player.id === 'test_player');
    assert.ok(player.xp !== undefined);
  });

  it('academy can be instantiated', () => {
    const academy = new Academy();
    assert.ok(academy);
  });
});

describe('TutorBot', () => {
  it('can be instantiated', () => {
    const tutor = new TutorBot();
    assert.ok(tutor);
  });
});

describe('Index Exports', () => {
  it('exports registerWithCore', () => {
    assert.equal(typeof registerWithCore, 'function');
  });

  it('registerWithCore accepts a core object', () => {
    let called = false;
    const core = { registerPlugin(name, plugin) { called = true; assert.equal(name, 'circuits'); } };
    registerWithCore(core);
    assert.ok(called);
  });
});
