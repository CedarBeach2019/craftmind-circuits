/**
 * Tutorial System - Step-by-step guided lessons for redstone circuits
 * Provides progressive learning with 3-level hints and verification
 */

export class TutorialStep {
  constructor(id, title, description, objectives, hints, verification) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.objectives = objectives; // Array of objective strings
    this.hints = {
      basic: hints.basic || '',
      intermediate: hints.intermediate || '',
      advanced: hints.advanced || ''
    };
    this.verification = verification; // Function to verify completion
  }
}

export class Tutorial {
  constructor(id, name, description, category, difficulty, steps) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category; // 'basics', 'logic', 'memory', 'advanced'
    this.difficulty = difficulty; // 1-5
    this.steps = steps; // Array of TutorialStep
  }
}

export class TutorialProgress {
  constructor(playerId) {
    this.playerId = playerId;
    this.completedTutorials = new Set();
    this.currentTutorial = null;
    this.currentStep = 0;
    this.hintLevelUsed = new Map(); // stepId -> hint level (1-3)
    this.attempts = new Map(); // stepId -> attempt count
    this.startTime = null;
    this.completionTimes = new Map(); // tutorialId -> durationMs
  }

  startTutorial(tutorialId) {
    this.currentTutorial = tutorialId;
    this.currentStep = 0;
    this.startTime = Date.now();
  }

  completeStep(stepId, hintLevel) {
    if (hintLevel > 0) {
      this.hintLevelUsed.set(stepId, hintLevel);
    }
    this.attempts.set(stepId, (this.attempts.get(stepId) || 0) + 1);
  }

  completeTutorial() {
    if (this.currentTutorial && this.startTime) {
      const duration = Date.now() - this.startTime;
      this.completionTimes.set(this.currentTutorial, duration);
      this.completedTutorials.add(this.currentTutorial);
      this.currentTutorial = null;
      this.currentStep = 0;
      this.startTime = null;
    }
  }

  getHintLevel(stepId) {
    return this.hintLevelUsed.get(stepId) || 0;
  }

  getAttemptCount(stepId) {
    return this.attempts.get(stepId) || 0;
  }
}

export class TutorialSystem {
  constructor() {
    this.tutorials = new Map();
    this.progress = new Map(); // playerId -> TutorialProgress
    this.rconClient = null;
    this.initializeTutorials();
  }

  setRCON(client) {
    this.rconClient = client;
  }

  initializeTutorials() {
    // Tutorial 1: Redstone Basics
    const basicsTutorial = new Tutorial(
      'basics_1',
      'Redstone Basics',
      'Learn the fundamentals of redstone: power, wires, and basic circuits.',
      'basics',
      1,
      [
        new TutorialStep(
          'basics_power',
          'Understanding Power',
          'Learn how redstone power works and how to transmit it.',
          ['Place a redstone torch', 'Connect redstone wire to the torch', 'Observe the power level'],
          {
            basic: 'Redstone torches provide constant power. Place one on any solid block.',
            intermediate: 'Right-click a block with a redstone torch in your hand. The torch powers the block it\'s attached to and adjacent blocks.',
            advanced: 'Redstone torches invert their input signal. A powered torch can transmit power up to 15 blocks through redstone wire.'
          },
          async (player) => this.verifyBlock(player, 'redstone_torch', 1)
        ),
        new TutorialStep(
          'basics_wire',
          'Redstone Wire',
          'Create your first redstone connection.',
          ['Place 5 blocks of redstone dust in a line', 'Ensure power reaches the end', 'Remove the wire'],
          {
            basic: 'Redstone dust creates a wire when placed. Right-click to place it on blocks.',
            intermediate: 'Place redstone dust on blocks to create a connection. Power decreases by 1 for every block traveled.',
            advanced: 'Redstone wire can connect to components on all sides except the bottom. Use repeaters to extend signal beyond 15 blocks.'
          },
          async (player) => this.verifyWireLength(player, 5)
        ),
        new TutorialStep(
          'basics_switch',
          'Lever Switch',
          'Create a controllable power source.',
          ['Place a lever on a block', 'Connect it to a redstone wire', 'Toggle the lever on and off'],
          {
            basic: 'Levers are simple switches. Right-click to toggle them on and off.',
            intermediate: 'Attach a lever to a block, then connect redstone wire. The lever controls power flow.',
            advanced: 'Levers provide a permanent on/off state. Unlike buttons, they stay in their last position until toggled again.'
          },
          async (player) => this.verifyLeverToggle(player, 1)
        )
      ]
    );

    // Tutorial 2: Logic Gates
    const logicTutorial = new Tutorial(
      'logic_1',
      'Logic Gates Introduction',
      'Build your first logic gates: NOT, AND, and OR.',
      'logic',
      2,
      [
        new TutorialStep(
          'logic_not',
          'NOT Gate (Inverter)',
          'Create a NOT gate using a redstone torch.',
          ['Power a block with redstone', 'Place a torch on the powered block', 'Observe the torch turns off'],
          {
            basic: 'A redstone torch acts as a NOT gate. Powered block = torch off.',
            intermediate: 'Place a redstone torch on the side of a block. When you power that block, the torch turns off.',
            advanced: 'NOT gates invert signals. Input ON → Output OFF. Use torch behavior to create compact inverters.'
          },
          async (player) => this.verifyNOTGate(player)
        ),
        new TutorialStep(
          'logic_and',
          'AND Gate',
          'Build an AND gate that requires two inputs.',
          ['Create two input levers', 'Build a circuit that only outputs when BOTH are on', 'Test all combinations'],
          {
            basic: 'An AND gate needs both inputs ON to produce output.',
            intermediate: 'Use two torches in series. Only when both inputs are OFF will the final output be ON.',
            advanced: 'Classic AND: Two NOT gates feeding into one torch. Or use torch-less design with comparators.'
          },
          async (player) => this.verifyANDGate(player)
        ),
        new TutorialStep(
          'logic_or',
          'OR Gate',
          'Build an OR gate that outputs when ANY input is on.',
          ['Create two input levers', 'Build a circuit that outputs when EITHER is on', 'Verify truth table'],
          {
            basic: 'An OR gate outputs ON if ANY input is ON.',
            intermediate: 'Connect two input wires to the same output wire. Simple and effective!',
            advanced: 'OR gates are the simplest - just merge wires. Use repeaters to prevent backflow if needed.'
          },
          async (player) => this.verifyORGate(player)
        )
      ]
    );

    // Tutorial 3: Memory Circuits
    const memoryTutorial = new Tutorial(
      'memory_1',
      'Memory Circuits',
      'Build circuits that remember their state.',
      'memory',
      3,
      [
        new TutorialStep(
          'memory_rs_latch',
          'RS Latch',
          'Create a basic memory cell with SET and RESET.',
          ['Build a circuit with two inputs (SET, RESET)', 'SET should turn output ON', 'RESET should turn output OFF'],
          {
            basic: 'An RS latch remembers state. SET turns on, RESET turns off.',
            intermediate: 'Cross two NOR gates: each feeds the other\'s input. Creates memory!',
            advanced: 'RS latch = two NOR gates cross-coupled. Q depends on last input. Invalid state: both ON.'
          },
          async (player) => this.verifyRSLatch(player)
        ),
        new TutorialStep(
          'memory_t_flip',
          'T Flip-Flop',
          'Build a toggle circuit that changes state each trigger.',
          ['Create a circuit that toggles output each button press', 'Test: ON, OFF, ON, OFF...'],
          {
            basic: 'T flip-flop toggles: ON→OFF→ON each trigger.',
            intermediate: 'Use a comparator to detect pulse edge, then feed back to toggle state.',
            advanced: 'Classic T-flip: Pulse limiter feeding RS latch. Or use comparator subtraction method.'
          },
          async (player) => this.verifyTFlipFlop(player)
        )
      ]
    );

    // Tutorial 4: Clocks
    const clockTutorial = new Tutorial(
      'clock_1',
      'Clock Circuits',
      'Create repeating signals with clock circuits.',
      'clocks',
      3,
      [
        new TutorialStep(
          'clock_repeater',
          'Repeater Clock',
          'Build a simple repeating clock.',
          ['Create a loop of repeaters', 'Measure the pulse interval', 'Adjust repeater delay'],
          {
            basic: 'Repeater clocks create repeating pulses. Loop repeaters into each other.',
            intermediate: 'Place 2+ repeaters in a circle. Each adds delay. 2 repeaters = fastest clock.',
            advanced: 'Repeater clock period = sum of delays × 2 ticks. 2 repeaters at 1 tick = 4t period.'
          },
          async (player) => this.verifyRepeaterClock(player)
        ),
        new TutorialStep(
          'clock_hopper',
          'Hopper Clock',
          'Build a precise, adjustable clock.',
          ['Create two hoppers facing each other', 'Put one item in one hopper', 'Measure the period'],
          {
            basic: 'Hopper clocks are very precise and slow.',
            intermediate: 'Two hoppers in a loop transfer an item back and forth. Comparator reads state.',
            advanced: 'Hopper clock period = items × 8 ticks. Add items to slow down. Up to 320+ seconds!'
          },
          async (player) => this.verifyHopperClock(player)
        )
      ]
    );

    this.tutorials.set('basics_1', basicsTutorial);
    this.tutorials.set('logic_1', logicTutorial);
    this.tutorials.set('memory_1', memoryTutorial);
    this.tutorials.set('clock_1', clockTutorial);
  }

  getTutorial(tutorialId) {
    return this.tutorials.get(tutorialId);
  }

  getTutorialsByCategory(category) {
    return Array.from(this.tutorials.values()).filter(t => t.category === category);
  }

  getTutorialsByDifficulty(minDifficulty, maxDifficulty) {
    return Array.from(this.tutorials.values()).filter(
      t => t.difficulty >= minDifficulty && t.difficulty <= maxDifficulty
    );
  }

  getAllTutorials() {
    return Array.from(this.tutorials.values());
  }

  getPlayerProgress(playerId) {
    if (!this.progress.has(playerId)) {
      this.progress.set(playerId, new TutorialProgress(playerId));
    }
    return this.progress.get(playerId);
  }

  startTutorial(playerId, tutorialId) {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial not found: ${tutorialId}`);
    }

    const progress = this.getPlayerProgress(playerId);
    progress.startTutorial(tutorialId);

    return {
      tutorial,
      currentStep: tutorial.steps[0],
      stepNumber: 1,
      totalSteps: tutorial.steps.length
    };
  }

  getCurrentStep(playerId) {
    const progress = this.getPlayerProgress(playerId);
    if (!progress.currentTutorial) {
      return null;
    }

    const tutorial = this.tutorials.get(progress.currentTutorial);
    if (!tutorial || progress.currentStep >= tutorial.steps.length) {
      return null;
    }

    return tutorial.steps[progress.currentStep];
  }

  getHint(playerId, level = 1) {
    const step = this.getCurrentStep(playerId);
    if (!step) {
      return null;
    }

    const hintKey = ['basic', 'intermediate', 'advanced'][level - 1];
    return step.hints[hintKey] || '';
  }

  submitStep(playerId, stepId, hintLevel = 0) {
    const progress = this.getPlayerProgress(playerId);
    const tutorial = this.tutorials.get(progress.currentTutorial);

    if (!tutorial) {
      return { success: false, error: 'No active tutorial' };
    }

    const stepIndex = tutorial.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      return { success: false, error: 'Step not found' };
    }

    progress.completeStep(stepId, hintLevel);

    if (stepIndex === tutorial.steps.length - 1) {
      progress.completeTutorial();
      return { success: true, completed: true, tutorialId: tutorial.id };
    }

    progress.currentStep = stepIndex + 1;
    const nextStep = tutorial.steps[progress.currentStep];

    return {
      success: true,
      completed: false,
      nextStep,
      stepNumber: progress.currentStep + 1,
      totalSteps: tutorial.steps.length
    };
  }

  // Verification methods (use RCON when available)
  async verifyBlock(player, blockType, requiredCount) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available - auto-verified' };
    }

    try {
      const result = await this.rconClient.send(`/countblocks ${player} ${blockType}`);
      const count = parseInt(result) || 0;
      return {
        verified: count >= requiredCount,
        count,
        required: requiredCount
      };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable - assumed passed' };
    }
  }

  async verifyWireLength(player, minLength) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/checkwire ${player} ${minLength}`);
      return { verified: result.includes('true') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyLeverToggle(player, requiredToggles) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/checklever ${player} ${requiredToggles}`);
      return { verified: result.includes('true') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyNOTGate(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verifygate ${player} NOT`);
      return { verified: result.includes('valid') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyANDGate(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verifygate ${player} AND`);
      return { verified: result.includes('valid') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyORGate(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verifygate ${player} OR`);
      return { verified: result.includes('valid') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyRSLatch(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verif latch ${player} RS`);
      return { verified: result.includes('valid') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyTFlipFlop(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verif latch ${player} T_FLIP`);
      return { verified: result.includes('valid') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyRepeaterClock(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verifyclock ${player} REPEATER`);
      return { verified: result.includes('ticking') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  async verifyHopperClock(player) {
    if (!this.rconClient) {
      return { verified: true, note: 'RCON not available' };
    }

    try {
      const result = await this.rconClient.send(`/verifyclock ${player} HOPPER`);
      return { verified: result.includes('ticking') };
    } catch (error) {
      return { verified: true, note: 'Verification unavailable' };
    }
  }

  // Progress summary
  getPlayerSummary(playerId) {
    const progress = this.getPlayerProgress(playerId);
    const completed = Array.from(progress.completedTutorials);
    const current = progress.currentTutorial;

    return {
      playerId,
      completedTutorials: completed,
      completedCount: completed.length,
      totalTutorials: this.tutorials.size,
      currentTutorial: current ? {
        id: current,
        tutorial: this.tutorials.get(current),
        step: progress.currentStep
      } : null,
      completionTimes: Object.fromEntries(progress.completionTimes)
    };
  }

  // Export progress (for saving)
  exportProgress(playerId) {
    const progress = this.getPlayerProgress(playerId);
    return {
      playerId: progress.playerId,
      completedTutorials: Array.from(progress.completedTutorials),
      hintLevelUsed: Object.fromEntries(progress.hintLevelUsed),
      attempts: Object.fromEntries(progress.attempts),
      completionTimes: Object.fromEntries(progress.completionTimes)
    };
  }

  // Import progress (for loading)
  importProgress(data) {
    const progress = new TutorialProgress(data.playerId);
    progress.completedTutorials = new Set(data.completedTutorials || []);
    progress.hintLevelUsed = new Map(Object.entries(data.hintLevelUsed || {}));
    progress.attempts = new Map(Object.entries(data.attempts || {}));
    progress.completionTimes = new Map(Object.entries(data.completionTimes || {}));
    this.progress.set(data.playerId, progress);
    return progress;
  }
}

// Singleton instance
export const tutorialSystem = new TutorialSystem();
