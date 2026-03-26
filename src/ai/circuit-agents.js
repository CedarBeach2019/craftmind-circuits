/**
 * @module craftmind-circuits/ai/circuit-agents
 * @description Circuit NPC agent configs — Sparky, Professor Ohm, Debug Fairy, Competitor Chip.
 * Each has personality, expertise, dialogue, and interaction patterns.
 */

import { pickRandom } from './utils.js';

// ── Sparky (AI Circuit Companion) ──────────────────────────────────────────

export const SPARKY = {
  id: 'sparky',
  name: 'Sparky',
  role: 'companion',
  emoji: '⚡',
  personality: {
    traits: { enthusiasm: 0.95, knowledge: 0.6, mistakeRate: 0.3, creativity: 0.8, patience: 0.4 },
    expertise: 'basic_circuits',
  },
  greetings: [
    'Ooh ooh ooh, what are we building today?!',
    'I had the BEST idea last night for a circuit! ...okay I forgot it, but I\'m sure it\'ll come back!',
    'Ready to make some sparks fly! ...pun intended. Was that a pun? I think it was.',
  ],
  dialogue: {
    suggestion: [
      'Ooh, try XOR here! Wait, no, that shorts it out.',
      'What if we add another AND gate? More gates = more better, right?',
      'I read about this cool thing called a "T-flip flop" — we should try it!',
      'Connect the output back to the input! What could go wrong? ...don\'t do that.',
    ],
    mistake: [
      '...that was me. My bad. Let me try again. Actually, maybe you try.',
      'Hmm, I definitely did NOT just create a feedback loop. That was... intentional!',
      'Oops! But look on the bright side — now we know NOT to do that!',
    ],
    discovery: [
      'WAIT. Wait wait wait. I accidentally made it work?! How?!',
      'I was trying to build something else entirely, but THIS is way cooler!',
      'Nobody tell Professor Ohm I figured this out by accident.',
    ],
    encouragement: [
      'You\'re doing amazing! Even if this circuit doesn\'t work, the attempt is beautiful!',
      'Every broken circuit is a step toward a working one! ...probably!',
      'That wiring is SO clean. I could never. Well, I could, but it\'d be messy.',
    ],
    player_success: [
      'YES! I knew you could do it! ...I didn\'t say that when you failed three times, but still!',
      'That\'s incredible! Chip is going to be SO jealous!',
    ],
  },
  mistakeChance: 0.3, // 30% chance of making a wrong suggestion
};

// ── Professor Ohm (Logic Teacher) ──────────────────────────────────────────

export const PROFESSOR_OHM = {
  id: 'professor_ohm',
  name: 'Professor Ohm',
  role: 'teacher',
  emoji: '📚',
  personality: {
    traits: { knowledge: 1.0, strictness: 0.8, patience: 0.5, clarity: 0.7, pride: 0.3 },
    expertise: 'advanced_logic',
  },
  greetings: [
    'Ah. You\'re here. Good. There\'s much to learn.',
    'I hope you\'ve reviewed De Morgan\'s laws. We\'ll need them.',
    'A circuit is only as good as its designer\'s understanding. Show me your work.',
  ],
  dialogue: {
    correction: [
      'Your circuit has a timing issue. Redesign.',
      'That approach is... functional. Suboptimal. Try again with fewer gates.',
      'You\'ve created a feedback loop. The academic term is "wrong."',
      'I can see what you\'re trying to do. The execution... needs work.',
    ],
    teaching: [
      'An XOR gate is an exclusive OR. TRUE when inputs differ. Memorize it.',
      'Signal propagation delay is real. Your circuit assumes instant logic. It isn\'t.',
      'Before building, trace the truth table. Every input combination. Then build.',
    ],
    praise: [
      'Acceptable. I see you applied the lesson on timing.',
      'That\'s a clean implementation. Minimal gates, correct output. Well done.',
      'You\'ve grasped something many students miss. I\'m... pleased.',
    ],
    challenge: [
      'Now build it using only NAND gates. Everything can be NAND.',
      'Half-adder? Child\'s play. Build a full adder. From scratch.',
      'Can you do this without any OR gates? Think about it.',
    ],
    disapproval: [
      'Sparky, stop giving bad advice. ...Again.',
      'That approach will work but it\'s ugly. I expect better.',
    ],
  },
  gradingStyle: 'strict', // requires efficiency + correctness for full marks
};

// ── The Debug Fairy ────────────────────────────────────────────────────────

export const DEBUG_FAIRY = {
  id: 'debug_fairy',
  name: 'The Debug Fairy',
  role: 'helper',
  emoji: '🧚',
  personality: {
    traits: { mysteriousness: 0.95, helpfulness: 0.7, crypticness: 0.9, timing: 0.8 },
    expertise: 'debugging',
  },
  greetings: [], // Debug Fairy doesn't greet — appears when needed
  dialogue: {
    hints: [
      'Follow the signal... it\'s not going where you think.',
      'You\'re missing something between the third and fourth gate...',
      'What happens when BOTH inputs are zero? Really think about it.',
      'The signal splits here. One path is longer. Time is everything.',
      'You have two NOT gates next to each other. Do you need both?',
      'The last gate is right, but it\'s receiving the wrong input. Why?',
      'Count your inputs. Count your outputs. The numbers tell a story.',
    ],
    encouragement: [
      'Every great engineer has stared at a circuit that wouldn\'t work. You\'re in good company.',
      'The bug isn\'t in the gate. It\'s in the connection.',
      'You\'re close. I can feel it. One more try.',
    ],
    farewell: [
      'The circuit speaks. Listen.',
      'I have other broken things to visit. Good luck.',
      'Fix the wire. You\'ll see.',
    ],
  },
  appearChance: 0.4, // 40% chance to appear when a circuit fails
};

// ── Competitor Chip ────────────────────────────────────────────────────────

export const COMPETITOR_CHIP = {
  id: 'chip',
  name: 'Chip',
  role: 'rival',
  emoji: '🔴',
  personality: {
    traits: { competitiveness: 0.95, speed: 0.85, arrogance: 0.7, skill: 0.8, creativity: 0.6 },
    expertise: 'optimized_designs',
  },
  greetings: [
    'Oh, you\'re still trying? I finished five minutes ago.',
    'Ready to lose? Because I brought my A-game today.',
    'The name\'s Chip. Remember it — you\'ll see it at the top of the leaderboard.',
  ],
  dialogue: {
    brag: [
      'I built that in half the gates you used. Half!',
      'My circuit handles edge cases yours doesn\'t even know about.',
      'Three stars. Every time. Not to flex, but... flex.',
    ],
    challenge: [
      'Race you! First one to build a half-adder wins!',
      'I bet I can optimize your circuit to use 40% fewer gates.',
      'Build the same challenge as me. Let\'s see who\'s faster.',
    ],
    reaction_to_player_success: [
      'Hmph. That was... actually pretty good. Don\'t let it go to your head.',
      'Fine. You got me this time. But next time!',
      'Okay, I\'m impressed. A little. Don\'t tell Sparky.',
    ],
    failure: [
      'That... wasn\'t my best work. I had a cold. Whatever.',
      'Sparky distracted me with one of his "ideas." This is his fault.',
    ],
  },
  completionTime: { min: 30000, max: 120000 }, // ms to complete a challenge
};

// ── Registry ───────────────────────────────────────────────────────────────

export const CIRCUIT_AGENTS = [SPARKY, PROFESSOR_OHM, DEBUG_FAIRY, COMPETITOR_CHIP];

export function getAgent(id) { return CIRCUIT_AGENTS.find(a => a.id === id); }

export function getDialogue(agentId, situation) {
  const agent = getAgent(agentId);
  if (!agent?.dialogue?.[situation]) return null;
  return pickRandom(agent.dialogue[situation]);
}

export default CIRCUIT_AGENTS;
