/**
 * CraftMind Circuits — Redstone Validator
 * Connects via mineflayer to test player-built circuits.
 */

export class RedstoneValidator {
  constructor(bot) {
    this.bot = bot;
  }

  async waitForLoad() {
    return new Promise(resolve => {
      if (this.bot.entity) return resolve();
      this.bot.once('spawn', resolve);
      setTimeout(resolve, 10000);
    });
  }

  setLever(pos, powered) {
    const block = this.bot.blockAt(pos);
    if (!block || block.name !== 'lever') throw new Error(`No lever at ${JSON.stringify(pos)}`);
    this.bot.activateBlock(block);
    // toggle if needed
    if ((powered && block.getState('powered') === 'false') || (!powered && block.getState('powered') === 'true')) {
      this.bot.activateBlock(block);
    }
  }

  isLampPowered(pos) {
    const block = this.bot.blockAt(pos);
    return block?.name === 'redstone_lamp' && block.getState('lit') === 'true';
  }

  isPistonExtended(pos) {
    const block = this.bot.blockAt(pos);
    return block?.name === 'piston' && block.getState('extended') === 'true';
  }

  getRedstonePower(pos) {
    return this.bot.blockAt(pos)?.getRedstonePower() ?? 0;
  }

  async pressButton(pos) {
    const block = this.bot.blockAt(pos);
    if (!block || !block.name.includes('button')) throw new Error(`No button at ${JSON.stringify(pos)}`);
    await this.bot.activateBlock(block);
  }

  /**
   * Validate a logic gate against a truth table.
   * @param {{ inputs: Array<{pos: [number,number,number]}>, output: {pos: [number,number,number]}, truthTable: Array<Array<boolean>> }} spec
   */
  async validateTruthTable(spec) {
    const results = [];
    for (const row of spec.truthTable) {
      for (let i = 0; i < spec.inputs.length; i++) {
        this.setLever(spec.inputs[i].pos, row[i]);
      }
      await delay(300);
      const actual = this.isLampPowered(spec.output.pos);
      results.push({ expected: row[row.length - 1], actual });
    }
    return results.every(r => r.expected === r.actual);
  }

  async measureTickSpeed(pos, samples = 10) {
    // Observe redstone lamp toggling to estimate clock speed
    const times = [];
    for (let i = 0; i < samples; i++) {
      const on = this.isLampPowered(pos);
      const start = Date.now();
      while (this.isLampPowered(pos) === on) {
        await delay(50);
        if (Date.now() - start > 10000) break;
      }
      times.push(Date.now() - start);
    }
    if (times.length < 2) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
