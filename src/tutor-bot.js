/**
 * CraftMind Circuits — AI Tutor Bot
 * Observes player building and offers hints via ZAI API.
 */

const API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

export class TutorBot {
  constructor(apiKey = process.env.ZAI_API_KEY || '') {
    this.apiKey = apiKey;
    this.conversations = new Map(); // playerId -> message history
  }

  async getHint(playerId, context) {
    if (!this.apiKey) return this._localHint(context);

    const history = this.conversations.get(playerId) || [];
    const systemPrompt = `You are a friendly Minecraft redstone tutor. You help players learn redstone circuits by giving encouraging hints. Keep responses short (1-3 sentences). Use Minecraft terminology. Be supportive and celebrate progress.`;

    history.push({ role: 'user', content: this._formatContext(context) });

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model: 'glm-4.7-flash', messages: [{ role: 'system', content: systemPrompt }, ...history.slice(-6)] })
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Keep experimenting! Redstone is all about trial and error.';
      history.push({ role: 'assistant', content: reply });
      this.conversations.set(playerId, history);
      return reply;
    } catch {
      return this._localHint(context);
    }
  }

  celebrate(playerId, achievement) {
    const messages = [
      `🎉 Amazing! You just earned "${achievement.name}"! You're becoming a true redstone engineer!`,
      `⚡ ${achievement.name} unlocked! That's ${achievement.emoji} level brilliance right there!`,
      `🔥 WOW — ${achievement.name}! Keep that momentum going!`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  _formatContext(ctx) {
    return `Player is working on: "${ctx.challenge}" (difficulty: ${ctx.difficulty}). They've placed these blocks: ${ctx.blocksPlaced?.join(', ') || 'none yet'}. ${ctx.mistake ? `Mistake detected: ${ctx.mistake}.` : ''} ${ctx.requested ? `Player asks: ${ctx.requested}` : 'Give a subtle hint about what to try next.'}`;
  }

  _localHint(ctx) {
    if (ctx.mistake?.includes('repeater')) return "Check your repeater orientation — the small line points in the signal direction.";
    if (ctx.difficulty === 'Apprentice') return "Start by placing your input on the left and output on the right. Think about the signal path!";
    if (ctx.difficulty === 'Journeyman') return "Remember: repeaters can both delay and boost a signal. Use them strategically.";
    if (ctx.difficulty === 'Artisan') return "Try breaking the problem into smaller sub-circuits. Build and test each part separately.";
    if (ctx.difficulty === 'Master') return "Consider using comparators for analog signals — they're more versatile than repeaters.";
    return "You're tackling advanced stuff! Think about signal timing and use observers for edge detection.";
  }
}
