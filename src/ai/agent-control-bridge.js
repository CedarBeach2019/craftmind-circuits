/**
 * @module craftmind-circuits/ai/agent-control-bridge
 * @description The meta-game: circuits that control other game agents.
 * Build a circuit → it controls Fishing bot, Herding dogs, Ranch automation.
 * Circuits are visual programming for all the other CraftMind agents.
 */

import { clamp } from './utils.js';

// ── Circuit-as-Condition Language ──────────────────────────────────────────

/**
 * A circuit rule defines: IF <conditions> THEN <actions>
 * Conditions and actions are expressed as circuit signal paths.
 */
export class CircuitRule {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || 'Unnamed Rule';
    this.description = config.description || '';
    this.conditions = config.conditions || []; // [{ source, signal }]
    this.actions = config.actions || [];       // [{ target, command }]
    this.logic = config.logic || 'AND';        // AND, OR, NOT, XOR
    this.enabled = config.enabled !== false;
    this.triggerCount = 0;
    this.lastTriggered = null;
    this.circuitId = config.circuitId || null; // link to visual circuit
  }

  /**
   * Evaluate the rule against current world state.
   * @param {object} worldState - { weather, timeOfDay, fish_count, herd_status, ranch_feeds, ... }
   * @returns {{ triggered: boolean, satisfiedConditions: string[], message: string }}
   */
  evaluate(worldState) {
    const satisfied = [];

    for (const condition of this.conditions) {
      const value = worldState[condition.source];
      if (this._checkCondition(value, condition)) {
        satisfied.push(condition.source);
      }
    }

    let triggered = false;
    switch (this.logic) {
      case 'AND': triggered = satisfied.length === this.conditions.length && satisfied.length > 0; break;
      case 'OR': triggered = satisfied.length > 0; break;
      case 'NOT': triggered = satisfied.length === 0 && this.conditions.length > 0; break;
      case 'XOR': triggered = satisfied.length === 1 && this.conditions.length === 2; break;
    }

    if (triggered && this.enabled) {
      this.triggerCount++;
      this.lastTriggered = Date.now();
    }

    return {
      triggered: triggered && this.enabled,
      satisfiedConditions: satisfied,
      message: triggered ? this._buildMessage(satisfied) : null,
    };
  }

  _checkCondition(value, condition) {
    if (value === undefined) return false;
    switch (condition.operator || 'gt') {
      case 'gt': return value > condition.signal;
      case 'lt': return value < condition.signal;
      case 'eq': return value === condition.signal;
      case 'gte': return value >= condition.signal;
      case 'lte': return value <= condition.signal;
      case 'is': return String(value).toLowerCase() === String(condition.signal).toLowerCase();
      case 'not': return value !== condition.signal;
      default: return false;
    }
  }

  _buildMessage(satisfied) {
    if (satisfied.length === 0) return '';
    const condStr = satisfied.join(' AND ');
    const actionStr = this.actions.map(a => `${a.command} → ${a.target}`).join(', ');
    return `[${this.name}] ${condStr} → ${actionStr}`;
  }

  /** Get the actions to execute if triggered. */
  getActions() {
    return this.enabled ? this.actions : [];
  }
}

// ── Agent Control Bridge ───────────────────────────────────────────────────

export class AgentControlBridge {
  constructor() {
    this.rules = [];
    this.eventLog = [];
    this.gameTargets = new Map(); // gameName -> { sendCommand: fn }
  }

  /**
   * Register a game target that can receive commands.
   * @param {string} gameName - 'fishing', 'herding', 'ranch'
   * @param {object} handler - { sendCommand: (command, params) => Promise }
   */
  registerGame(gameName, handler) {
    this.gameTargets.set(gameName, handler);
  }

  /**
   * Add a circuit rule.
   */
  addRule(config) {
    const rule = new CircuitRule(config);
    this.rules.push(rule);
    return rule;
  }

  /**
   * Remove a rule by ID.
   */
  removeRule(ruleId) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * Evaluate all rules against current world state and execute triggered ones.
   * @param {object} worldState
   * @returns {object[]} results from each rule
   */
  process(worldState) {
    const results = [];

    for (const rule of this.rules) {
      const result = rule.evaluate(worldState);
      results.push({ ruleId: rule.id, ruleName: rule.name, ...result });

      if (result.triggered) {
        for (const action of rule.getActions()) {
          const handler = this.gameTargets.get(action.target);
          if (handler?.sendCommand) {
            handler.sendCommand(action.command, action.params || {});
            this.eventLog.push({
              ruleId: rule.id, target: action.target,
              command: action.command, timestamp: Date.now(),
            });
          }
        }
      }
    }

    return results;
  }

  // ── Preset Rule Factories ──────────────────────────────────────────────

  /**
   * Create preset rules for cross-game integration.
   */
  static createPresets() {
    return [
      // Fishing automation
      new CircuitRule({
        id: 'fishing_storm_recall',
        name: 'Storm Recall',
        description: 'Recall fishing bot when a storm hits',
        conditions: [{ source: 'weather', signal: 'storm', operator: 'is' }],
        actions: [{ target: 'fishing', command: 'recall_to_dock' }],
        logic: 'AND',
      }),
      new CircuitRule({
        id: 'fishing_brag',
        name: 'Brag Broadcast',
        description: 'Broadcast brag when fish count exceeds threshold',
        conditions: [{ source: 'fish_count', signal: 10, operator: 'gt' }],
        actions: [{ target: 'fishing', command: 'broadcast_brag' }],
        logic: 'AND',
      }),

      // Herding automation
      new CircuitRule({
        id: 'herding_gather',
        name: 'Auto Gather',
        description: 'Gather herd when animals scatter',
        conditions: [{ source: 'herd_spread', signal: 15, operator: 'gt' }],
        actions: [{ target: 'herding', command: 'gather', params: { urgency: 'normal' } }],
        logic: 'AND',
      }),
      new CircuitRule({
        id: 'herding_storm',
        name: 'Storm Herding',
        description: 'Move herd to shelter when storm approaches',
        conditions: [{ source: 'weather', signal: 'storm', operator: 'is' }],
        actions: [{ target: 'herding', command: 'move_to_shelter' }],
        logic: 'AND',
      }),

      // Ranch automation
      new CircuitRule({
        id: 'ranch_feeder',
        name: 'Auto Feed',
        description: 'Trigger feeders when animals are hungry',
        conditions: [{ source: 'ranch_avg_hunger', signal: 0.7, operator: 'gt' }],
        actions: [{ target: 'ranch', command: 'feed_all' }],
        logic: 'AND',
      }),
      new CircuitRule({
        id: 'ranch_lights',
        name: 'Barn Lights',
        description: 'Turn on barn lights at night',
        conditions: [{ source: 'timeOfDay', signal: 'night', operator: 'is' }],
        actions: [{ target: 'ranch', command: 'lights_on', params: { location: 'barn' } }],
        logic: 'AND',
      }),

      // Cross-game: Research automation
      new CircuitRule({
        id: 'research_auto_experiment',
        name: 'Auto Experiment',
        description: 'Trigger research experiment when breeding data is available',
        conditions: [
          { source: 'ranch_breedings_today', signal: 2, operator: 'gte' },
          { source: 'research_busy', signal: false, operator: 'eq' },
        ],
        actions: [{ target: 'research', command: 'analyze_breeding_data' }],
        logic: 'AND',
      }),

      // Complex: Day/Night cycle
      new CircuitRule({
        id: 'night_security',
        name: 'Night Security',
        description: 'Activate security at night when predator risk is high',
        conditions: [
          { source: 'timeOfDay', signal: 'night', operator: 'is' },
          { source: 'predator_threat', signal: 0.5, operator: 'gt' },
        ],
        actions: [
          { target: 'herding', command: 'patrol', params: { area: 'perimeter' } },
          { target: 'ranch', command: 'lock_gates' },
        ],
        logic: 'AND',
      }),
    ];
  }

  /**
   * Get rules targeting a specific game.
   */
  getRulesForGame(gameName) {
    return this.rules.filter(r => r.actions.some(a => a.target === gameName));
  }

  /**
   * Get execution statistics.
   */
  getStats() {
    return {
      totalRules: this.rules.length,
      enabledRules: this.rules.filter(r => r.enabled).length,
      totalTriggers: this.rules.reduce((sum, r) => sum + r.triggerCount, 0),
      mostTriggered: this.rules.sort((a, b) => b.triggerCount - a.triggerCount)[0]?.name || null,
      gamesConnected: Array.from(this.gameTargets.keys()),
    };
  }
}

export default AgentControlBridge;
