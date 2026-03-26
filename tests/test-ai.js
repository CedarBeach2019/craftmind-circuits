/**
 * Tests for CraftMind Circuits AI modules.
 */

import { CIRCUIT_ACTIONS, parseCircuitCommand } from '../src/ai/circuit-actions.js';
import { CIRCUIT_AGENTS, SPARKY, PROFESSOR_OHM, DEBUG_FAIRY, COMPETITOR_CHIP, getDialogue, getAgent } from '../src/ai/circuit-agents.js';
import { DebugAssistant } from '../src/ai/debug-assistant.js';
import { CircuitOptimizer } from '../src/ai/circuit-optimizer.js';
import { AgentControlBridge, CircuitRule } from '../src/ai/agent-control-bridge.js';

import { rmSync } from 'fs';

let passed = 0, failed = 0;
function assert(label, cond) { if (cond) { passed++; console.log(`  ✅ ${label}`); } else { failed++; console.log(`  ❌ ${label}`); } }

console.log('🧪 CraftMind Circuits AI — Tests\n');

// ─── Circuit Actions Tests ─────────────────────────────────────────────────
console.log('── Circuit Actions ──');

assert('8 actions defined', Object.keys(CIRCUIT_ACTIONS).length === 8);
assert('BUILD_GATE has gateTypes', CIRCUIT_ACTIONS.BUILD_GATE.gateTypes.length > 0);

const c1 = parseCircuitCommand('Place an AND gate here');
assert('Parse BUILD_GATE', c1.action === 'BUILD_GATE');
assert('Detects gate type', c1.gateType === 'AND');

const c2 = parseCircuitCommand('Connect this gate to that one');
assert('Parse WIRE', c2.action === 'WIRE');
const c3 = parseCircuitCommand('Run a signal through the circuit');
assert('Parse TEST', c3.action === 'TEST');
const c4 = parseCircuitCommand('Why isn\'t this circuit working?');
assert('Parse DEBUG', c4.action === 'DEBUG');
const c5 = parseCircuitCommand('Can we do this with fewer gates?');
assert('Parse OPTIMIZE', c5.action === 'OPTIMIZE');
const c6 = parseCircuitCommand('Build a circuit that sorts these inputs');
assert('Parse CHALLENGE', c6.action === 'CHALLENGE');
const c7 = parseCircuitCommand('Run a simulation to see what happens');
assert('Parse SIMULATE', c7.action === 'SIMULATE');
const c8 = parseCircuitCommand('Label this circuit');
assert('Parse DOCUMENT', c8.action === 'DOCUMENT');

const cUnknown = parseCircuitCommand('hello world');
assert('Unknown returns null', cUnknown.action === null);

const cXor = parseCircuitCommand('Add an XOR gate at position 3');
assert('Detects XOR gate', cXor.gateType === 'XOR');

// ─── Circuit Agents Tests ──────────────────────────────────────────────────
console.log('\n── Circuit Agents ──');

assert('4 agents defined', CIRCUIT_AGENTS.length === 4);
assert('Sparky found', getAgent('sparky')?.name === 'Sparky');
assert('Ohm found', getAgent('professor_ohm')?.name === 'Professor Ohm');
assert('Debug Fairy found', getAgent('debug_fairy')?.name === 'The Debug Fairy');
assert('Chip found', getAgent('chip')?.name === 'Chip');

// Dialogue
const sparkySuggestion = getDialogue('sparky', 'suggestion');
assert('Sparky gives suggestion', sparkySuggestion !== null && sparkySuggestion.length > 0);
const sparkyMistake = getDialogue('sparky', 'mistake');
assert('Sparky admits mistakes', sparkyMistake !== null);
const sparkyDiscovery = getDialogue('sparky', 'discovery');
assert('Sparky discovers things', sparkyDiscovery !== null);

const ohmCorrection = getDialogue('professor_ohm', 'correction');
assert('Ohm corrects students', ohmCorrection !== null);
const ohmTeaching = getDialogue('professor_ohm', 'teaching');
assert('Ohm teaches', ohmTeaching !== null);
const ohmPraise = getDialogue('professor_ohm', 'praise');
assert('Ohm praises (rarely)', ohmPraise !== null);

const fairyHint = getDialogue('debug_fairy', 'hints');
assert('Debug Fairy gives hints', fairyHint !== null);
const fairyEncourage = getDialogue('debug_fairy', 'encouragement');
assert('Debug Fairy encourages', fairyEncourage !== null);

const chipBrag = getDialogue('chip', 'brag');
assert('Chip brags', chipBrag !== null);
const chipChallenge = getDialogue('chip', 'challenge');
assert('Chip challenges', chipChallenge !== null);
const chipReaction = getDialogue('chip', 'reaction_to_player_success');
assert('Chip reacts to player success', chipReaction !== null);

// Greetings
assert('Sparky has greetings', SPARKY.greetings.length > 0);
assert('Ohm has greetings', PROFESSOR_OHM.greetings.length > 0);
assert('Debug Fairy has no greetings (appears on failure)', DEBUG_FAIRY.greetings.length === 0);
assert('Chip has greetings', COMPETITOR_CHIP.greetings.length > 0);

// Personality
assert('Sparky is enthusiastic', SPARKY.personality.traits.enthusiasm > 0.9);
assert('Ohm is knowledgeable', PROFESSOR_OHM.personality.traits.knowledge === 1.0);
assert('Debug Fairy is mysterious', DEBUG_FAIRY.personality.traits.mysteriousness > 0.9);
assert('Chip is competitive', COMPETITOR_CHIP.personality.traits.competitiveness > 0.9);

// Sparky makes mistakes
assert('Sparky mistake rate > 0', SPARKY.mistakeChance > 0);

// Debug Fairy appear chance
assert('Debug Fairy appear chance > 0', DEBUG_FAIRY.appearChance > 0);

// ─── Debug Assistant Tests ─────────────────────────────────────────────────
console.log('\n── Debug Assistant ──');

const debug = new DebugAssistant();

// Simple working circuit
const goodCircuit = {
  gates: [
    { id: 'in1', type: 'INPUT' }, { id: 'in2', type: 'INPUT' },
    { id: 'and1', type: 'AND' }, { id: 'out1', type: 'OUTPUT' },
  ],
  wires: [
    { from: 'in1', to: 'and1' }, { from: 'in2', to: 'and1' },
    { from: 'and1', to: 'out1' },
  ],
};
const goodIssues = debug.analyze(goodCircuit);
assert('Working circuit has no errors', goodIssues.filter(i => i.severity === 'error').length === 0);

// Circuit with unconnected gate
const unconnectedCircuit = {
  gates: [
    { id: 'in1', type: 'INPUT' }, { id: 'and1', type: 'AND' },
    { id: 'or1', type: 'OR' }, // unconnected
    { id: 'out1', type: 'OUTPUT' },
  ],
  wires: [
    { from: 'in1', to: 'and1' }, { from: 'and1', to: 'out1' },
  ],
};
const unconnIssues = debug.analyze(unconnectedCircuit);
assert('Detects unconnected gate', unconnIssues.some(i => i.type === 'unconnected'));

// Missing input
const missingInputCircuit = {
  gates: [
    { id: 'in1', type: 'INPUT' }, { id: 'and1', type: 'AND' },
    { id: 'out1', type: 'OUTPUT' },
  ],
  wires: [{ from: 'in1', to: 'and1' }, { from: 'and1', to: 'out1' }],
};
const missingIssues = debug.analyze(missingInputCircuit);
assert('Detects missing input', missingIssues.some(i => i.type === 'missing_input'));

// Feedback loop
const loopCircuit = {
  gates: [{ id: 'not1', type: 'NOT' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'not1', to: 'out1' }, { from: 'out1', to: 'not1' }],
};
const loopIssues = debug.analyze(loopCircuit);
assert('Detects feedback loop', loopIssues.some(i => i.type === 'feedback_loop'));

// Dangling output
const danglingCircuit = {
  gates: [{ id: 'in1', type: 'INPUT' }, { id: 'and1', type: 'AND' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'in1', to: 'and1' }, { from: 'in1', to: 'out1' }],
};
const danglingIssues = debug.analyze(danglingCircuit);
assert('Detects dangling output', danglingIssues.some(i => i.type === 'dangling_output'));

// Redundancy
const redundantCircuit = {
  gates: [{ id: 'in1', type: 'INPUT' }, { id: 'not1', type: 'NOT' }, { id: 'not2', type: 'NOT' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'in1', to: 'not1' }, { from: 'not1', to: 'not2' }, { from: 'not2', to: 'out1' }],
};
const redundantIssues = debug.analyze(redundantCircuit);
assert('Detects redundancy', redundantIssues.some(i => i.type === 'redundancy'));

// Hint
const hint = debug.getHint();
assert('Gives hint', typeof hint === 'string' && hint.length > 0);

// Explanation
assert('Explains feedback loop', debug.explain({ type: 'feedback_loop' }).length > 0);
assert('Explains missing input', debug.explain({ type: 'missing_input' }).length > 0);
assert('Explains unconnected', debug.explain({ type: 'unconnected' }).length > 0);

// Simulation
const simResult = debug.simulate(goodCircuit, { in1: true, in2: true });
assert('AND true,true = true', simResult.output === true);
const simResult2 = debug.simulate(goodCircuit, { in1: true, in2: false });
assert('AND true,false = false', simResult2.output === false);
const simResult3 = debug.simulate(goodCircuit, { in1: false, in2: false });
assert('AND false,false = false', simResult3.output === false);

// OR gate simulation
const orCircuit = {
  gates: [{ id: 'in1', type: 'INPUT' }, { id: 'in2', type: 'INPUT' }, { id: 'or1', type: 'OR' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'in1', to: 'or1' }, { from: 'in2', to: 'or1' }, { from: 'or1', to: 'out1' }],
};
const orSim = debug.simulate(orCircuit, { in1: false, in2: true });
assert('OR false,true = true', orSim.output === true);

// NOT gate simulation
const notCircuit = {
  gates: [{ id: 'in1', type: 'INPUT' }, { id: 'not1', type: 'NOT' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'in1', to: 'not1' }, { from: 'not1', to: 'out1' }],
};
assert('NOT true = false', debug.simulate(notCircuit, { in1: true }).output === false);
assert('NOT false = true', debug.simulate(notCircuit, { in1: false }).output === true);

// XOR simulation
const xorCircuit = {
  gates: [{ id: 'in1', type: 'INPUT' }, { id: 'in2', type: 'INPUT' }, { id: 'xor1', type: 'XOR' }, { id: 'out1', type: 'OUTPUT' }],
  wires: [{ from: 'in1', to: 'xor1' }, { from: 'in2', to: 'xor1' }, { from: 'xor1', to: 'out1' }],
};
assert('XOR true,true = false', debug.simulate(xorCircuit, { in1: true, in2: true }).output === false);
assert('XOR true,false = true', debug.simulate(xorCircuit, { in1: true, in2: false }).output === true);

// ─── Circuit Optimizer Tests ───────────────────────────────────────────────
console.log('\n── Circuit Optimizer ──');

const optDir = `./test-data/circuits-${Date.now()}`;
const opt = new CircuitOptimizer(optDir);

// Score solution
const goodSolution = { correct: true, gateCount: 3, wireCount: 4, timeMs: 20000, parGates: 5, parTime: 60000, noRedundancy: true };
const goodScore = opt.scoreSolution(goodSolution);
assert('Good solution scores well', goodScore > 0.5);
assert('Correct solution > 0', goodScore > 0);

const badSolution = { correct: false, gateCount: 10, wireCount: 20, timeMs: 120000, parGates: 5, parTime: 60000 };
const badScore = opt.scoreSolution(badSolution);
assert('Incorrect solution = 0', badScore === 0);

// Record and compare
opt.recordSolution({ playerId: 'p1', challengeId: 'half-adder', correct: true, gateCount: 5, wireCount: 6, timeMs: 30000, parGates: 5, parTime: 60000, noRedundancy: true });
opt.recordSolution({ playerId: 'p2', challengeId: 'half-adder', correct: true, gateCount: 3, wireCount: 4, timeMs: 15000, parGates: 5, parTime: 60000, noRedundancy: true });
opt.recordSolution({ playerId: 'p1', challengeId: 'half-adder', correct: true, gateCount: 4, wireCount: 5, timeMs: 25000, parGates: 5, parTime: 60000, noRedundancy: true });

const comparison = opt.compare({ playerId: 'p1', challengeId: 'half-adder', correct: true, gateCount: 4, wireCount: 5, timeMs: 25000, parGates: 5, parTime: 60000, noRedundancy: true, score: 0.7 });
assert('Comparison has rank', comparison.rank >= 1);
assert('Comparison has total', comparison.total >= 1);
assert('Comparison has insights', Array.isArray(comparison.insights));

const best = opt.getBestSolution('half-adder');
assert('Best solution found', best !== null);
assert('Best solution is correct', best.correct);

const leaderboard = opt.getLeaderboard('half-adder');
assert('Leaderboard has entries', leaderboard.length > 0);
assert('Leaderboard sorted by score', leaderboard[0].score >= leaderboard[leaderboard.length - 1].score);

const insights = opt.getInsights();
assert('Insights returned', Array.isArray(insights));

// ─── Agent Control Bridge Tests ────────────────────────────────────────────
console.log('\n── Agent Control Bridge ──');

// CircuitRule
const rule = new CircuitRule({
  id: 'storm_rule',
  name: 'Storm Recall',
  conditions: [{ source: 'weather', signal: 'storm', operator: 'is' }],
  actions: [{ target: 'fishing', command: 'recall' }],
  logic: 'AND',
});
assert('Rule created', rule.name === 'Storm Recall');

// Evaluate true
const stormResult = rule.evaluate({ weather: 'storm' });
assert('Rule triggers on storm', stormResult.triggered === true);
assert('Satisfied conditions includes weather', stormResult.satisfiedConditions.includes('weather'));

// Evaluate false
const calmResult = rule.evaluate({ weather: 'sunny' });
assert('Rule doesn\'t trigger on sunny', calmResult.triggered === false);

// GT operator
const countRule = new CircuitRule({
  id: 'count_rule',
  name: 'Fish Count',
  conditions: [{ source: 'fish_count', signal: 10, operator: 'gt' }],
  actions: [{ target: 'fishing', command: 'brag' }],
});
assert('GT triggers', countRule.evaluate({ fish_count: 15 }).triggered);
assert('GT doesn\'t trigger below', !countRule.evaluate({ fish_count: 5 }).triggered);

// OR logic
const orRule = new CircuitRule({
  id: 'or_rule',
  name: 'OR Test',
  conditions: [
    { source: 'a', signal: true, operator: 'eq' },
    { source: 'b', signal: true, operator: 'eq' },
  ],
  actions: [],
  logic: 'OR',
});
assert('OR: either triggers', orRule.evaluate({ a: false, b: true }).triggered);
assert('OR: both triggers', orRule.evaluate({ a: true, b: true }).triggered);
assert('OR: neither doesn\'t trigger', !orRule.evaluate({ a: false, b: false }).triggered);

// NOT logic
const notRule = new CircuitRule({
  id: 'not_rule',
  name: 'NOT Test',
  conditions: [{ source: 'raining', signal: true, operator: 'eq' }],
  actions: [],
  logic: 'NOT',
});
assert('NOT: false triggers', notRule.evaluate({ raining: false }).triggered);
assert('NOT: true doesn\'t trigger', !notRule.evaluate({ raining: true }).triggered);

// XOR logic
const xorRule = new CircuitRule({
  id: 'xor_rule',
  name: 'XOR Test',
  conditions: [
    { source: 'a', signal: true, operator: 'eq' },
    { source: 'b', signal: true, operator: 'eq' },
  ],
  actions: [],
  logic: 'XOR',
});
assert('XOR: only one triggers', xorRule.evaluate({ a: true, b: false }).triggered);
assert('XOR: both doesn\'t trigger', !xorRule.evaluate({ a: true, b: true }).triggered);

// Disabled rule
rule.enabled = false;
assert('Disabled rule doesn\'t trigger', !rule.evaluate({ weather: 'storm' }).triggered);
rule.enabled = true;

// AgentControlBridge
const bridge = new AgentControlBridge();
let commandReceived = null;
bridge.registerGame('fishing', {
  sendCommand: (cmd, params) => { commandReceived = { cmd, params }; }
});

bridge.addRule({
  id: 'test_rule',
  name: 'Test',
  conditions: [{ source: 'weather', signal: 'storm', operator: 'is' }],
  actions: [{ target: 'fishing', command: 'recall_to_dock', params: { urgent: true } }],
});

const results = bridge.process({ weather: 'storm' });
assert('Bridge processes rules', results.length > 0);
assert('Bridge sends command', commandReceived !== null);
assert('Command correct', commandReceived.cmd === 'recall_to_dock');
assert('Params passed', commandReceived.params.urgent === true);

// No trigger
bridge.process({ weather: 'sunny' });

// Presets
const presets = AgentControlBridge.createPresets();
assert('Presets created', presets.length > 0);
assert('Storm recall preset', presets.some(r => r.name === 'Storm Recall'));
assert('Auto feed preset', presets.some(r => r.name === 'Auto Feed'));
assert('Night security preset', presets.some(r => r.name === 'Night Security'));

// Presets can be evaluated
const stormPreset = presets.find(r => r.name === 'Storm Recall');
assert('Storm preset triggers on storm', stormPreset.evaluate({ weather: 'storm' }).triggered);
assert('Storm preset doesn\'t trigger on calm', !stormPreset.evaluate({ weather: 'calm' }).triggered);

// Stats
const stats = bridge.getStats();
assert('Stats total rules', stats.totalRules > 0);
assert('Stats games connected', stats.gamesConnected.includes('fishing'));

// Get rules for game
const fishingRules = bridge.getRulesForGame('fishing');
assert('Rules for fishing found', fishingRules.length > 0);

// Remove rule
bridge.removeRule('test_rule');
assert('Rule removed', bridge.getRulesForGame('fishing').length === 0);

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(40)}`);

// Clean up
try { rmSync(optDir, { recursive: true }); } catch {}

process.exit(failed > 0 ? 1 : 0);
