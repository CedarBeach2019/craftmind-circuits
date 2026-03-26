/**
 * @module craftmind-circuits/ai/debug-assistant
 * @description AI that helps debug circuits — analyzes signal flow, identifies
 * issues, and suggests fixes. Can work locally or with an LLM.
 */

import { DEBUG_FAIRY, PROFESSOR_OHM, SPARKY } from './circuit-agents.js';
import { pickRandom } from './utils.js';

// ── Signal Analysis ────────────────────────────────────────────────────────

export class DebugAssistant {
  constructor() {
    this.sessionIssues = [];
  }

  /**
   * Analyze a circuit and find issues.
   * @param {object} circuit - { gates: [{id, type, inputs, output}], wires: [{from, to}], name }
   * @returns {object[]} array of issues found
   */
  analyze(circuit) {
    const issues = [];

    // 1. Check for unconnected gates
    const connectedGateIds = new Set();
    for (const wire of (circuit.wires || [])) {
      connectedGateIds.add(wire.from);
      connectedGateIds.add(wire.to);
    }
    for (const gate of (circuit.gates || [])) {
      if (!connectedGateIds.has(gate.id) && circuit.gates.length > 1) {
        issues.push({
          type: 'unconnected',
          severity: 'error',
          gateId: gate.id,
          message: `Gate "${gate.id}" (${gate.type}) is not connected to anything.`,
        });
      }
    }

    // 2. Check for double NOT gates (redundant)
    const gatesByType = {};
    for (const gate of (circuit.gates || [])) {
      if (!gatesByType[gate.type]) gatesByType[gate.type] = [];
      gatesByType[gate.type].push(gate);
    }
    if ((gatesByType['NOT'] || []).length > 1) {
      issues.push({
        type: 'redundancy',
        severity: 'warning',
        message: 'Multiple NOT gates detected. Check if any are canceling each other out (NOT NOT = identity).',
      });
    }

    // 3. Check for feedback loops
    const wires = circuit.wires || [];
    for (const wire of wires) {
      const downstream = this._findDownstream(wire.to, circuit.gates, wires);
      if (downstream.includes(wire.from)) {
        issues.push({
          type: 'feedback_loop',
          severity: 'error',
          message: `Feedback loop detected! Signal from "${wire.from}" eventually feeds back to itself. This causes oscillation.`,
        });
      }
    }

    // 4. Check for missing inputs
    for (const gate of (circuit.gates || [])) {
      if (gate.type === 'INPUT' || gate.type === 'OUTPUT') continue;
      const requiredInputs = gate.type === 'NOT' ? 1 : 2;
      const inputWires = wires.filter(w => w.to === gate.id);
      if (inputWires.length < requiredInputs) {
        issues.push({
          type: 'missing_input',
          severity: 'error',
          gateId: gate.id,
          message: `Gate "${gate.id}" (${gate.type}) needs ${requiredInputs} input(s) but only has ${inputWires.length}.`,
        });
      }
    }

    // 5. Check for gates with no output
    const outputGateIds = new Set(wires.map(w => w.from));
    for (const gate of (circuit.gates || [])) {
      if (!outputGateIds.has(gate.id) && gate.type !== 'OUTPUT' && gate.type !== 'INPUT') {
        issues.push({
          type: 'dangling_output',
          severity: 'warning',
          gateId: gate.id,
          message: `Gate "${gate.id}" has no output connection. Its result goes nowhere.`,
        });
      }
    }

    this.sessionIssues = issues;
    return issues;
  }

  _findDownstream(gateId, gates, wires, visited = new Set()) {
    if (visited.has(gateId)) return [];
    visited.add(gateId);
    const downstream = [gateId];
    const outputWires = wires.filter(w => w.from === gateId);
    for (const wire of outputWires) {
      downstream.push(...this._findDownstream(wire.to, gates, wires, visited));
    }
    return downstream;
  }

  /**
   * Get a hint for the most severe issue.
   * @returns {string}
   */
  getHint() {
    if (this.sessionIssues.length === 0) return 'No issues detected. Your circuit looks correct!';

    const errors = this.sessionIssues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      // Debug Fairy cryptic hint
      const fairyHints = [
        'Follow the signal... it\'s not going where you think.',
        'The wire lies. Check the connection.',
        'Something is feeding back on itself. Break the loop.',
        'A gate without all its inputs is just... sitting there.',
      ];
      return pickRandom(fairyHints);
    }

    const warnings = this.sessionIssues.filter(i => i.severity === 'warning');
    if (warnings.length > 0) return warnings[0].message;

    return 'Something\'s not right. Try testing with different inputs.';
  }

  /**
   * Get a detailed explanation for a specific issue.
   */
  explain(issue) {
    const explanations = {
      feedback_loop: 'A feedback loop means a signal eventually feeds back into itself. This causes the circuit to oscillate (rapidly switch on/off) and produces unpredictable results. Remove the wire that creates the cycle.',
      unconnected: 'Every gate in your circuit should be connected. An unconnected gate does nothing — either wire it in or remove it.',
      missing_input: 'Logic gates need the right number of inputs to work. An AND gate with only one input can\'t make a decision. Add the missing input wire.',
      dangling_output: 'This gate produces a result but nothing is using it. Either connect its output to another gate or the output indicator.',
      redundancy: 'Two NOT gates in sequence cancel each other out. NOT(NOT(A)) = A. Remove both to simplify your circuit.',
    };
    return explanations[issue.type] || 'Check the wiring around this component.';
  }

  /**
   * Simulate a circuit with given inputs.
   * @param {object} circuit
   * @param {object} inputs - { [inputId]: boolean }
   * @returns {{ output: boolean|null, gateValues: object }}
   */
  simulate(circuit, inputs) {
    const gateValues = { ...inputs };
    const gates = circuit.gates || [];
    const wires = circuit.wires || [];

    // Topological sort (simple: multiple passes until stable)
    for (let pass = 0; pass < gates.length + 2; pass++) {
      for (const gate of gates) {
        const inputWires = wires.filter(w => w.to === gate.id);
        const inputValues = inputWires.map(w => gateValues[w.from]);

        if (inputValues.length === 0) continue;
        if (inputValues.includes(undefined)) continue;

        gateValues[gate.id] = this._evaluateGate(gate.type, inputValues);
      }
    }

    // Find output
    const outputGate = gates.find(g => g.type === 'OUTPUT') || gates[gates.length - 1];
    return {
      output: outputGate ? gateValues[outputGate.id] : null,
      gateValues,
    };
  }

  _evaluateGate(type, inputs) {
    switch (type) {
      case 'AND': return inputs[0] && inputs[1];
      case 'OR': return inputs[0] || inputs[1];
      case 'NOT': return !inputs[0];
      case 'XOR': return inputs[0] !== inputs[1];
      case 'NAND': return !(inputs[0] && inputs[1]);
      case 'NOR': return !(inputs[0] || inputs[1]);
      case 'XNOR': return inputs[0] === inputs[1];
      case 'REPEATER': return inputs[0];
      case 'COMPARATOR': return inputs[0]; // simplified
      case 'OUTPUT': return inputs[0];
      default: return null;
    }
  }
}

export default DebugAssistant;
