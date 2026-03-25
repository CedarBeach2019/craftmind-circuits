/**
 * CraftMind Circuits — Daily Challenge Generator
 * Uses ZAI API (glm-4.7-flash) to procedurally generate challenges.
 */

const API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

export class DailyChallengeGenerator {
  constructor() {
    this.apiKey = process.env.ZAI_API_KEY || '';
  }

  async generate(playerLevel, seed) {
    if (!this.apiKey) return this._fallback(playerLevel, seed);

    const theme = this._getTheme();
    const difficulty = this._levelToDifficulty(playerLevel);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: 'glm-4.7-flash',
        messages: [{
          role: 'user',
          content: `Generate a Minecraft redstone challenge for a level ${playerLevel} player (${difficulty} difficulty).${theme ? ` Theme: ${theme}.` : ''} Return JSON only: { "name": "...", "description": "...", "objectives": ["..."], "requiredBlocks": ["..."], "parBlocks": number, "timeLimit": number, "hints": ["..."], "category": "..." }`
        }]
      })
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return this._fallback(playerLevel, seed);

    try {
      const parsed = JSON.parse(match[0]);
      return {
        id: `daily-${seed}`,
        tier: difficulty,
        ...parsed,
        xpReward: playerLevel * 20,
        pointsReward: playerLevel * 10,
        theme
      };
    } catch {
      return this._fallback(playerLevel, seed);
    }
  }

  _getTheme() {
    const month = new Date().getMonth();
    if (month === 9) return 'Halloween: build a spooky trap with redstone';
    if (month === 11) return 'Christmas: build a flashing light display';
    if (month === 1) return 'Valentines: build a heart-shaped redstone display';
    return null;
  }

  _levelToDifficulty(level) {
    if (level <= 2) return 'Apprentice';
    if (level <= 4) return 'Journeyman';
    if (level <= 6) return 'Artisan';
    if (level <= 8) return 'Master';
    return 'Grandmaster';
  }

  _fallback(level, seed) {
    const templates = [
      { name: 'Quick Pulse', desc: 'Build a clock circuit that pulses every 2 seconds', blocks: ['redstone_dust', 'repeater', 'redstone_torch'], par: 8, time: 120, cat: 'Clocks' },
      { name: 'Double Door', desc: 'Create a 2-wide piston door that opens with one button', blocks: ['piston', 'sticky_piston', 'redstone_dust', 'repeater', 'button'], par: 20, time: 180, cat: 'Trap Doors' },
      { name: 'Signal Splitter', desc: 'Split one redstone signal into 4 separate outputs', blocks: ['redstone_dust', 'repeater', 'redstone_block'], par: 12, time: 90, cat: 'Logic Gates' },
      { name: 'Item Sorter', desc: 'Build a basic hopper item sorter for one item type', blocks: ['hopper', 'chest', 'comparator', 'redstone_dust'], par: 15, time: 300, cat: 'Transportation' },
      { name: 'Binary Counter', desc: 'Build a 2-bit binary counter using pistons and redstone', blocks: ['piston', 'redstone_dust', 'repeater', 'redstone_torch', 'button'], par: 25, time: 600, cat: 'Computing' },
    ];
    const t = templates[seed % templates.length];
    return { id: `daily-${seed}`, name: t.name, description: t.desc, objectives: [t.desc], requiredBlocks: t.blocks, parBlocks: t.par, timeLimit: t.time, hints: ['Start with the input on the left', 'Use repeaters to control timing'], category: t.cat, tier: this._levelToDifficulty(level), xpReward: level * 20, pointsReward: level * 10, theme: null };
  }
}
