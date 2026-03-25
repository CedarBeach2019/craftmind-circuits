# ⚡ CraftMind Circuits

> Redstone puzzle academy — learn electronics through Minecraft's circuit system.

## Features

- **34 Challenges** — Across 5 tiers (Apprentice → Grandmaster)
- **Daily Challenge Generator** — AI-generated puzzles via ZAI API
- **Tutor Bot** — Context-aware hints and encouragement
- **Achievement System** — Tiered rewards and milestones
- **Power-up Inventory** — 7 collectible power-ups (blueprints, time freeze, etc.)
- **Redstone Validator** — Verify circuit correctness
- **Scoreboard** — Global leaderboards and personal bests
- **Player Progression** — XP, levels, streak multipliers

## Quick Start

```bash
npm install
node examples/demo.js    # Run standalone demo
node scripts/playtest.js # Simulated plugin test
npm test                 # Run test suite (31 tests)
```

## API Documentation

### Academy & Player (`src/academy.js`)
| Class/Method | Description |
|---|---|
| `new Player(id, name)` | Create player with XP/level tracking |
| `new Academy()` | Academy managing players and challenges |
| `academy.registerPlayer(id, name)` | Register a player |
| `academy.completeChallenge(id, chId, {stars, timeMs})` | Score a challenge |

### Challenges (`src/circuit-challenges.js`)
| Function | Description |
|---|---|
| `loadChallenges()` | Load all 34 challenges |
| `getChallengesByTier(tier)` | Filter by difficulty |

### Tutor Bot (`src/tutor-bot.js`)
| Method | Description |
|---|---|
| `tutor.getHint(playerId, context)` | Get AI-powered hint |
| `tutor.celebrate(playerId, achievement)` | Congratulate player |

### Inventory (`src/inventory.js`)
| Export | Description |
|---|---|
| `POWERUPS` | 7 power-up definitions |
| `Inventory.use(playerId, powerupId)` | Consume a power-up |

## Plugin Integration

```js
import { registerWithCore } from 'craftmind-circuits';
registerWithCore(core); // Registers as 'circuits' plugin
```

## Architecture

```
┌──────────────────────────────────────────────────┐
│              CraftMind Circuits                   │
├──────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Challenge│  │   Tutor   │  │   Power-up   │ │
│  │ Loader   │→ │   Bot     │→ │   Inventory  │ │
│  │ (34 ch)  │  │ (AI hint) │  │  (7 items)   │ │
│  └────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
│       │              │               │         │
│       ▼              ▼               ▼         │
│  ┌──────────────────────────────────────────┐   │
│  │        Challenge Pipeline                │   │
│  │  Load → Build → Validate → Score → Rank  │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                           │
│  ┌──────────┐ ┌─────┴──────┐ ┌────────────┐   │
│  │  Daily   │ │ Redstone   │ │ Scoreboard │   │
│  │Challenge │ │ Validator  │ │ (ranks)    │   │
│  └──────────┘ └────────────┘ └────────────┘   │
│                                                  │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Achievement │  │       Academy            │  │
│  │   System    │  │  (players + progression) │  │
│  └─────────────┘  └──────────────────────────┘  │
├──────────────────────────────────────────────────┤
│              registerWithCore(core)              │
└──────────────────────────────────────────────────┘
```

## Testing

```bash
npm test          # 31 tests
node examples/demo.js
node scripts/playtest.js
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed plans.

## License

MIT
