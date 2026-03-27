/**
 * Sandbox System - Free-build mode for circuit experimentation
 * Provides unlimited blocks, circuit saving/loading, and testing tools
 */

import { redstoneValidator } from './redstone-validator.js';
import { difficultySystem } from './difficulty.js';

export class CircuitDesign {
  constructor(id, name, author, timestamp) {
    this.id = id;
    this.name = name;
    this.author = author;
    this.timestamp = timestamp;
    this.description = '';
    this.tags = [];
    this.blocks = []; // { x, y, z, type, state }
    this.inputs = []; // { id, name, x, y, z, type }
    this.outputs = []; // { id, name, x, y, z, type }
    this.truthTable = []; // Array of input -> output mappings
    this.metadata = {
      blockCount: 0,
      estimatedDelay: 0,
      categories: []
    };
  }

  addBlock(x, y, z, type, state = {}) {
    // Remove existing block at position
    this.blocks = this.blocks.filter(b => !(b.x === x && b.y === y && b.z === z));
    this.blocks.push({ x, y, z, type, state });
    this.updateMetadata();
  }

  removeBlock(x, y, z) {
    this.blocks = this.blocks.filter(b => !(b.x === x && b.y === y && b.z === z));
    this.inputs = this.inputs.filter(i => !(i.x === x && i.y === y && i.z === z));
    this.outputs = this.outputs.filter(o => !(o.x === x && o.y === y && o.z === z));
    this.updateMetadata();
  }

  addInput(id, name, x, y, z, type = 'lever') {
    this.inputs.push({ id, name, x, y, z, type });
  }

  addOutput(id, name, x, y, z, type = 'lamp') {
    this.outputs.push({ id, name, x, y, z, type });
  }

  updateMetadata() {
    this.metadata.blockCount = this.blocks.length;
    // Estimate delay based on repeaters and comparators
    const repeaters = this.blocks.filter(b => b.type === 'repeater').length;
    const comparators = this.blocks.filter(b => b.type === 'comparator').length;
    this.metadata.estimatedDelay = repeaters + comparators * 2;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      author: this.author,
      timestamp: this.timestamp,
      description: this.description,
      tags: this.tags,
      blocks: this.blocks,
      inputs: this.inputs,
      outputs: this.outputs,
      truthTable: this.truthTable,
      metadata: this.metadata
    };
  }

  static fromJSON(data) {
    const design = new CircuitDesign(data.id, data.name, data.author, data.timestamp);
    design.description = data.description || '';
    design.tags = data.tags || [];
    design.blocks = data.blocks || [];
    design.inputs = data.inputs || [];
    design.outputs = data.outputs || [];
    design.truthTable = data.truthTable || [];
    design.metadata = data.metadata || { blockCount: 0, estimatedDelay: 0, categories: [] };
    return design;
  }
}

export class SandboxSession {
  constructor(playerId, worldId) {
    this.playerId = playerId;
    this.worldId = worldId;
    this.active = false;
    this.startTime = null;
    this.design = null;
    this.blocksPlaced = 0;
    this.blocksRemoved = 0;
    this.commandsUsed = [];
  }

  start() {
    this.active = true;
    this.startTime = Date.now();
  }

  stop() {
    this.active = false;
  }

  recordCommand(command) {
    this.commandsUsed.push({
      command,
      timestamp: Date.now()
    });
  }

  getDuration() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }
}

export class SandboxSystem {
  constructor() {
    this.sessions = new Map(); // playerId -> SandboxSession
    this.savedDesigns = new Map(); // designId -> CircuitDesign
    this.publicDesigns = new Map(); // designId -> CircuitDesign (community)
    this.rconClient = null;
    this.designCounter = 0;
  }

  setRCON(client) {
    this.rconClient = client;
  }

  // Session management
  startSession(playerId, worldId = 'sandbox') {
    if (this.sessions.has(playerId)) {
      return { success: false, error: 'Session already active' };
    }

    const session = new SandboxSession(playerId, worldId);
    session.start();

    // Create new design for this session
    const designId = this.generateDesignId();
    const design = new CircuitDesign(
      designId,
      `Sandbox-${Date.now()}`,
      playerId,
      Date.now()
    );

    session.design = design;
    this.sessions.set(playerId, session);

    return {
      success: true,
      session: {
        playerId,
        worldId,
        designId,
        unlimited: true
      }
    };
  }

  stopSession(playerId, saveDesign = false, designName = null) {
    const session = this.sessions.get(playerId);
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    session.stop();

    if (saveDesign && session.design) {
      if (designName) {
        session.design.name = designName;
      }
      this.savedDesigns.set(session.design.id, session.design);
    }

    const summary = {
      duration: session.getDuration(),
      blocksPlaced: session.blocksPlaced,
      blocksRemoved: session.blocksRemoved,
      commandsUsed: session.commandsUsed.length
    };

    this.sessions.delete(playerId);

    return {
      success: true,
      saved: saveDesign,
      designId: saveDesign ? session.design.id : null,
      summary
    };
  }

  getSession(playerId) {
    return this.sessions.get(playerId);
  }

  // Command handlers
  handleCommand(playerId, command, args) {
    const session = this.sessions.get(playerId);
    if (!session || !session.active) {
      return { success: false, error: 'No active sandbox session' };
    }

    session.recordCommand(command);

    switch (command) {
      case 'place':
        return this.cmdPlace(session, args);
      case 'remove':
        return this.cmdRemove(session, args);
      case 'fill':
        return this.cmdFill(session, args);
      case 'clear':
        return this.cmdClear(session, args);
      case 'copy':
        return this.cmdCopy(session, args);
      case 'paste':
        return this.cmdPaste(session, args);
      case 'test':
        return this.cmdTest(session, args);
      case 'help':
        return this.cmdHelp();
      default:
        return { success: false, error: 'Unknown command' };
    }
  }

  cmdPlace(session, args) {
    const [blockType, x, y, z, ...stateArgs] = args;

    if (!blockType || x === undefined || y === undefined || z === undefined) {
      return {
        success: false,
        error: 'Usage: !place <block> <x> <y> <z> [state...]',
        example: '!place redstone_wire 0 1 0'
      };
    }

    const coords = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };

    if (isNaN(coords.x) || isNaN(coords.y) || isNaN(coords.z)) {
      return { success: false, error: 'Invalid coordinates' };
    }

    // Parse block state if provided
    const state = {};
    if (stateArgs.length > 0) {
      for (let i = 0; i < stateArgs.length; i += 2) {
        state[stateArgs[i]] = stateArgs[i + 1];
      }
    }

    // Add to design
    session.design.addBlock(coords.x, coords.y, coords.z, blockType, state);
    session.blocksPlaced++;

    // Execute via RCON if available
    if (this.rconClient) {
      this.rconClient.send(`/setblock ${coords.x} ${coords.y} ${coords.z} ${blockType}`);
    }

    return {
      success: true,
      message: `Placed ${blockType} at (${coords.x}, ${coords.y}, ${coords.z})`,
      block: { type: blockType, coords, state }
    };
  }

  cmdRemove(session, args) {
    const [x, y, z] = args;

    if (x === undefined || y === undefined || z === undefined) {
      return {
        success: false,
        error: 'Usage: !remove <x> <y> <z>',
        example: '!remove 0 1 0'
      };
    }

    const coords = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };

    if (isNaN(coords.x) || isNaN(coords.y) || isNaN(coords.z)) {
      return { success: false, error: 'Invalid coordinates' };
    }

    // Remove from design
    session.design.removeBlock(coords.x, coords.y, coords.z);
    session.blocksRemoved++;

    // Execute via RCON if available
    if (this.rconClient) {
      this.rconClient.send(`/setblock ${coords.x} ${coords.y} ${coords.z} air`);
    }

    return {
      success: true,
      message: `Removed block at (${coords.x}, ${coords.y}, ${coords.z})`,
      coords
    };
  }

  cmdFill(session, args) {
    const [blockType, x1, y1, z1, x2, y2, z2] = args;

    if (!blockType || args.length < 7) {
      return {
        success: false,
        error: 'Usage: !fill <block> <x1> <y1> <z1> <x2> <y2> <z2>',
        example: '!fill stone 0 0 0 10 5 10'
      };
    }

    const start = { x: parseInt(x1), y: parseInt(y1), z: parseInt(z1) };
    const end = { x: parseInt(x2), y: parseInt(y2), z: parseInt(z2) };

    // Add blocks to design
    for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
      for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
        for (let z = Math.min(start.z, end.z); z <= Math.max(start.z, end.z); z++) {
          session.design.addBlock(x, y, z, blockType, {});
          session.blocksPlaced++;
        }
      }
    }

    // Execute via RCON if available
    if (this.rconClient) {
      this.rconClient.send(`/fill ${start.x} ${start.y} ${start.z} ${end.x} ${end.y} ${end.z} ${blockType}`);
    }

    return {
      success: true,
      message: `Filled area with ${blockType}`,
      blockType,
      volume: (Math.abs(end.x - start.x) + 1) * (Math.abs(end.y - start.y) + 1) * (Math.abs(end.z - start.z) + 1)
    };
  }

  cmdClear(session, args) {
    const [x1, y1, z1, x2, y2, z2] = args;

    if (args.length < 6) {
      return {
        success: false,
        error: 'Usage: !clear <x1> <y1> <z1> <x2> <y2> <z2>',
        example: '!clear 0 0 0 10 5 10'
      };
    }

    const start = { x: parseInt(x1), y: parseInt(y1), z: parseInt(z1) };
    const end = { x: parseInt(x2), y: parseInt(y2), z: parseInt(z2) };

    // Remove blocks from design
    const removed = session.design.blocks.filter(b =>
      b.x >= Math.min(start.x, end.x) && b.x <= Math.max(start.x, end.x) &&
      b.y >= Math.min(start.y, end.y) && b.y <= Math.max(start.y, end.y) &&
      b.z >= Math.min(start.z, end.z) && b.z <= Math.max(start.z, end.z)
    );

    for (const block of removed) {
      session.design.removeBlock(block.x, block.y, block.z);
      session.blocksRemoved++;
    }

    // Execute via RCON if available
    if (this.rconClient) {
      this.rconClient.send(`/fill ${start.x} ${start.y} ${start.z} ${end.x} ${end.y} ${end.z} air`);
    }

    return {
      success: true,
      message: `Cleared area`,
      blocksRemoved: removed.length
    };
  }

  cmdCopy(session, args) {
    const [x1, y1, z1, x2, y2, z2] = args;

    if (args.length < 6) {
      return {
        success: false,
        error: 'Usage: !copy <x1> <y1> <z1> <x2> <y2> <z2>',
        example: '!copy 0 0 0 10 5 10'
      };
    }

    session.clipboard = {
      start: { x: parseInt(x1), y: parseInt(y1), z: parseInt(z1) },
      end: { x: parseInt(x2), y: parseInt(y2), z: parseInt(z2) },
      blocks: session.design.blocks.filter(b =>
        b.x >= Math.min(x1, x2) && b.x <= Math.max(x1, x2) &&
        b.y >= Math.min(y1, y2) && b.y <= Math.max(y1, y2) &&
        b.z >= Math.min(z1, z2) && b.z <= Math.max(z1, z2)
      ).map(b => ({
        ...b,
        relX: b.x - Math.min(x1, x2),
        relY: b.y - Math.min(y1, y2),
        relZ: b.z - Math.min(z1, z2)
      }))
    };

    return {
      success: true,
      message: `Copied ${session.clipboard.blocks.length} blocks to clipboard`,
      blocksCopied: session.clipboard.blocks.length
    };
  }

  cmdPaste(session, args) {
    const [x, y, z] = args;

    if (!session.clipboard) {
      return { success: false, error: 'Nothing copied to clipboard' };
    }

    if (x === undefined || y === undefined || z === undefined) {
      return {
        success: false,
        error: 'Usage: !paste <x> <y> <z>',
        example: '!paste 20 0 0'
      };
    }

    const origin = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };

    for (const block of session.clipboard.blocks) {
      const newX = origin.x + block.relX;
      const newY = origin.y + block.relY;
      const newZ = origin.z + block.relZ;
      session.design.addBlock(newX, newY, newZ, block.type, block.state);
      session.blocksPlaced++;

      if (this.rconClient) {
        this.rconClient.send(`/setblock ${newX} ${newY} ${newZ} ${block.type}`);
      }
    }

    return {
      success: true,
      message: `Pasted ${session.clipboard.blocks.length} blocks`,
      blocksPasted: session.clipboard.blocks.length
    };
  }

  cmdTest(session, args) {
    const [testType, ...testArgs] = args;

    if (!testType) {
      return {
        success: false,
        error: 'Usage: !test <type> [args...]',
        types: ['inputs', 'outputs', 'simulate', 'validate']
      };
    }

    switch (testType) {
      case 'inputs':
        return this.testInputs(session);
      case 'outputs':
        return this.testOutputs(session);
      case 'simulate':
        return this.testSimulate(session, testArgs);
      case 'validate':
        return this.testValidate(session, testArgs);
      default:
        return { success: false, error: `Unknown test type: ${testType}` };
    }
  }

  testInputs(session) {
    const inputs = session.design.blocks.filter(b =>
      b.type === 'lever' || b.type === 'button' || b.type === 'pressure_plate'
    );

    return {
      success: true,
      inputs: inputs.map(b => ({ type: b.type, coords: { x: b.x, y: b.y, z: b.z } })),
      count: inputs.length,
      message: `Found ${inputs.length} input blocks`
    };
  }

  testOutputs(session) {
    const outputs = session.design.blocks.filter(b =>
      b.type === 'redstone_lamp' || b.type === 'piston' || b.type === 'note_block' || b.type === 'command_block'
    );

    return {
      success: true,
      outputs: outputs.map(b => ({ type: b.type, coords: { x: b.x, y: b.y, z: b.z } })),
      count: outputs.length,
      message: `Found ${outputs.length} output blocks`
    };
  }

  async testSimulate(session, args) {
    // Basic simulation based on redstone distances
    const inputs = session.design.blocks.filter(b =>
      b.type === 'lever' || b.type === 'redstone_torch'
    );
    const outputs = session.design.blocks.filter(b =>
      b.type === 'redstone_lamp' || b.type === 'piston'
    );

    const results = [];
    for (const output of outputs) {
      let powered = false;
      let powerLevel = 0;

      for (const input of inputs) {
        const distance = Math.abs(output.x - input.x) + Math.abs(output.y - input.y) + Math.abs(output.z - input.z);
        if (distance <= 15) {
          powered = true;
          powerLevel = Math.max(powerLevel, 16 - distance);
        }
      }

      results.push({
        output: { type: output.type, coords: { x: output.x, y: output.y, z: output.z } },
        powered,
        powerLevel
      });
    }

    return {
      success: true,
      results,
      message: `Simulated ${outputs.length} outputs`
    };
  }

  async testValidate(session, args) {
    // Use redstone validator if available
    const circuitData = {
      blocks: session.design.blocks,
      inputs: session.design.inputs,
      outputs: session.design.outputs
    };

    try {
      const result = await redstoneValidator.validateCircuit(circuitData);
      return {
        success: true,
        validation: result,
        message: result.valid ? 'Circuit is valid!' : 'Circuit has issues'
      };
    } catch (error) {
      return {
        success: true,
        validation: { valid: null, error: error.message },
        message: 'Validation unavailable'
      };
    }
  }

  cmdHelp() {
    return {
      success: true,
      commands: [
        { cmd: '!place <block> <x> <y> <z> [state...]', desc: 'Place a block' },
        { cmd: '!remove <x> <y> <z>', desc: 'Remove a block' },
        { cmd: '!fill <block> <x1> <y1> <z1> <x2> <y2> <z2>', desc: 'Fill an area' },
        { cmd: '!clear <x1> <y1> <z1> <x2> <y2> <z2>', desc: 'Clear an area' },
        { cmd: '!copy <x1> <y1> <z1> <x2> <y2> <z2>', desc: 'Copy blocks to clipboard' },
        { cmd: '!paste <x> <y> <z>', desc: 'Paste blocks from clipboard' },
        { cmd: '!test inputs', desc: 'List all input blocks' },
        { cmd: '!test outputs', desc: 'List all output blocks' },
        { cmd: '!test simulate', desc: 'Simulate circuit behavior' },
        { cmd: '!test validate', desc: 'Validate circuit design' },
        { cmd: '!save <name>', desc: 'Save current design' },
        { cmd: '!load <id>', desc: 'Load a saved design' },
        { cmd: '!help', desc: 'Show this help' }
      ]
    };
  }

  // Design management
  saveDesign(playerId, designName, isPublic = false) {
    const session = this.sessions.get(playerId);
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    const designId = this.generateDesignId();
    const design = session.design;
    design.id = designId;
    design.name = designName;
    design.author = playerId;
    design.timestamp = Date.now();

    if (isPublic) {
      this.publicDesigns.set(designId, design);
    } else {
      this.savedDesigns.set(designId, design);
    }

    return {
      success: true,
      designId,
      design,
      message: `Saved design "${designName}" as ${designId}`
    };
  }

  loadDesign(playerId, designId) {
    const design = this.savedDesigns.get(designId) || this.publicDesigns.get(designId);
    if (!design) {
      return { success: false, error: 'Design not found' };
    }

    const session = this.sessions.get(playerId);
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // Clone design to session
    session.design = CircuitDesign.fromJSON(design.toJSON());
    session.design.id = this.generateDesignId(); // New ID for loaded design

    // Place blocks in world via RCON
    if (this.rconClient) {
      for (const block of session.design.blocks) {
        const stateStr = Object.entries(block.state || {}).map(([k, v]) => `${k}=${v}`).join(',');
        this.rconClient.send(`/setblock ${block.x} ${block.y} ${block.z} ${block.type}${stateStr ? `[${stateStr}]` : ''}`);
      }
    }

    return {
      success: true,
      design: session.design,
      message: `Loaded design "${design.name}"`
    };
  }

  listDesigns(playerId, includePublic = true) {
    const userDesigns = Array.from(this.savedDesigns.values())
      .filter(d => d.author === playerId)
      .map(d => ({ id: d.id, name: d.name, timestamp: d.timestamp, blocks: d.blocks.length }));

    const publicDesigns = includePublic ? Array.from(this.publicDesigns.values())
      .map(d => ({ id: d.id, name: d.name, author: d.author, timestamp: d.timestamp, blocks: d.blocks.length })) : [];

    return {
      success: true,
      private: userDesigns,
      public: publicDesigns,
      total: userDesigns.length + publicDesigns.length
    };
  }

  deleteDesign(playerId, designId) {
    const design = this.savedDesigns.get(designId);
    if (!design) {
      return { success: false, error: 'Design not found' };
    }

    if (design.author !== playerId) {
      return { success: false, error: 'Not your design' };
    }

    this.savedDesigns.delete(designId);
    return { success: true, message: 'Design deleted' };
  }

  generateDesignId() {
    return `design_${Date.now()}_${++this.designCounter}`;
  }

  // Session statistics
  getSessionStats(playerId) {
    const session = this.sessions.get(playerId);
    if (!session) {
      return { error: 'No active session' };
    }

    return {
      playerId: session.playerId,
      active: session.active,
      duration: session.getDuration(),
      blocksPlaced: session.blocksPlaced,
      blocksRemoved: session.blocksRemoved,
      netBlocks: session.blocksPlaced - session.blocksRemoved,
      commandsUsed: session.commandsUsed.length,
      design: {
        id: session.design.id,
        blockCount: session.design.blocks.length,
        inputs: session.design.inputs.length,
        outputs: session.design.outputs.length
      }
    };
  }

  exportDesign(designId) {
    const design = this.savedDesigns.get(designId) || this.publicDesigns.get(designId);
    if (!design) {
      return null;
    }
    return design.toJSON();
  }

  importDesign(data, isPublic = false) {
    const design = CircuitDesign.fromJSON(data);
    if (isPublic) {
      this.publicDesigns.set(design.id, design);
    } else {
      this.savedDesigns.set(design.id, design);
    }
    return design;
  }
}

// Singleton instance
export const sandboxSystem = new SandboxSystem();
