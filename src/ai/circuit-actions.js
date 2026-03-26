/**
 * @module craftmind-circuits/ai/circuit-actions
 * @description Circuit-building action schema — structured actions for building,
 * testing, debugging, and optimizing logic circuits.
 */

export const CIRCUIT_ACTIONS = {
  BUILD_GATE: {
    id: 'BUILD_GATE',
    description: 'Place a logic gate on the board',
    params: ['gateType', 'position'],
    gateTypes: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'REPEATER', 'COMPARATOR', 'TOGGLE'],
    examples: ['Place an AND gate here', 'Add an XOR gate at position 3,2'],
    effects: ['adds_component'],
  },
  WIRE: {
    id: 'WIRE',
    description: 'Connect two components',
    params: ['from', 'to'],
    examples: ['Connect this gate to that one', 'Wire the output to the lamp'],
    effects: ['creates_connection'],
  },
  TEST: {
    id: 'TEST',
    description: 'Run a signal through the circuit',
    params: ['inputs'],
    examples: ['Run a signal through the circuit', 'Test with all inputs on'],
    effects: ['shows_output', 'may_fail'],
  },
  DEBUG: {
    id: 'DEBUG',
    description: 'Analyze why a circuit isn\'t working',
    params: ['circuitId'],
    examples: ['Why isn\'t this circuit working?', 'Help me debug this'],
    effects: ['identifies_issues'],
  },
  OPTIMIZE: {
    id: 'OPTIMIZE',
    description: 'Reduce gate count or improve efficiency',
    params: ['circuitId', 'metric'],
    examples: ['Can we do this with fewer gates?', 'Optimize for speed'],
    effects: ['reduces_complexity'],
  },
  CHALLENGE: {
    id: 'CHALLENGE',
    description: 'Build a circuit for a specific challenge',
    params: ['challengeId'],
    examples: ['Build a circuit that sorts these inputs', 'Create a half-adder'],
    effects: ['starts_challenge'],
  },
  SIMULATE: {
    id: 'SIMULATE',
    description: 'Run a full simulation',
    params: ['circuitId', 'iterations'],
    examples: ['Run a simulation to see what happens', 'Simulate 100 random inputs'],
    effects: ['shows_behavior'],
  },
  DOCUMENT: {
    id: 'DOCUMENT',
    description: 'Label and document a circuit',
    params: ['circuitId', 'labels'],
    examples: ['Label this circuit', 'Add documentation to the adder'],
    effects: ['adds_labels'],
  },
};

/** Parse a natural language command into a circuit action. */
export function parseCircuitCommand(text) {
  const lower = text.toLowerCase();
  const keywords = {
    BUILD_GATE: ['place', 'add', 'build gate', 'put gate', 'and gate', 'or gate', 'xor gate', 'not gate', 'nand', 'nor'],
    WIRE: ['connect', 'wire', 'link', 'join'],
    TEST: ['test signal', 'test with', 'test this', 'run a signal', 'run signal', 'try signal'],
    DEBUG: ['debug', 'why', 'broken', 'fix', 'wrong', 'not working'],
    OPTIMIZE: ['optimize', 'simplify', 'fewer', 'reduce', 'improve'],
    CHALLENGE: ['challenge', 'build a circuit that', 'create a', 'design a'],
    SIMULATE: ['simulate', 'simulation', 'run all inputs'],
    DOCUMENT: ['label', 'document', 'name this', 'annotate'],
  };

  for (const [key, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      // Detect gate type for BUILD_GATE
      let gateType = null;
      if (key === 'BUILD_GATE') {
        // Check longer gate names first to avoid 'or' matching inside 'xor'
        const sorted = [...CIRCUIT_ACTIONS.BUILD_GATE.gateTypes].sort((a, b) => b.length - a.length);
        for (const gt of sorted) {
          if (lower.includes(gt.toLowerCase())) { gateType = gt; break; }
        }
      }
      return { action: key, rawText: text, confidence: 0.8, gateType };
    }
  }

  return { action: null, rawText: text, confidence: 0 };
}

export default CIRCUIT_ACTIONS;
