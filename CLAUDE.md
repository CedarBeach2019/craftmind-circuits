# CraftMind Circuits

A Minecraft redstone puzzle academy plugin for the CraftMind ecosystem. Players learn electronics through gamified circuit challenges with adaptive difficulty, AI tutoring, and cross-game automation.

## Project Overview

**Purpose**: Teach redstone circuit design through progressive challenges while integrating with other CraftMind plugins (fishing, herding, ranch) via circuit-based automation rules.

**Key Features**:
- 34 challenges across 5 difficulty tiers (Apprentice → Grandmaster)
- Daily challenge generator with AI-powered puzzle creation (ZAI API)
- AI Tutor Bot with context-aware hints
- Achievement system with 12+ achievements
- 7 power-ups with rarity-based drops and crafting
- Circuit validation via mineflayer integration
- Global and weekly leaderboards
- Player progression (XP, levels, streak multipliers)
- AI companion agents (Sparky, Professor Ohm, Debug Fairy, Competitor Chip)
- Circuit optimizer for design comparison
- Cross-game agent control bridge

## Architecture

### Core Systems

```
┌──────────────────────────────────────────────────┐
│              CraftMind Circuits                   │
├──────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Challenge│  │   Tutor   │  │   Power-up   │ │
│  │ Loader   │→ │   Bot     │→ │   Inventory  │ │
│  │ (34 ch)  │  │ (AI hint) │  │  (7 items)   │ │
│  └────┬─────┘  └─────�─────┘  └──────┬───────┘ │
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
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         AI Agents Layer                  │  │
│  │  Sparky │ Prof. Ohm │ Debug │ Chip      │  │
│  └──────────────────┬───────────────────────┘  │
│                     │                           │
│  ┌──────────────────────────────────────────┐  │
│  │    Agent Control Bridge (Cross-Game)     │  │
│  │  Circuits → Fishing/Herding/Ranch cmds   │  │
│  └──────────────────────────────────────────┘  │
├──────────────────────────────────────────────────┤
│              registerWithCore(core)              │
└──────────────────────────────────────────────────┘
```

### Challenge System

**Tiers** (Apprentice → Grandmaster):
- Each challenge has: id, name, tier, category, description, objectives, requiredBlocks, parBlocks, timeLimit, xpReward, pointsReward, hints
- Rating system: 0-3 stars based on correctness, efficiency (blocksUsed ≤ parBlocks), and speed (timeMs < timeLimit/2)

**Categories**: Logic Gates, Memory, Clocks, Trap Doors, Contraptions, Computing, Redstone Computers, Transportation

**Adaptive Difficulty**:
- Daily challenges scale to player level
- `_levelToDifficulty()`: Level 1-2 → Apprentice, 3-4 → Journeyman, 5-6 → Artisan, 7-8 → Master, 9+ → Grandmaster
- XP rewards scale with stars and streak multipliers

### AI Systems

**TutorBot**:
- Uses ZAI API (glm-4.7-flash) for AI hints
- Maintains conversation history per player (last 6 messages)
- Falls back to local hints when API unavailable
- Celebrates achievements with randomized messages

**Circuit Agents** (`src/ai/circuit-agents.js`):
- **Sparky** (companion): Enthusiastic beginner helper, 30% mistake rate
- **Professor Ohm** (teacher): Strict knowledge source, demands efficiency
- **Debug Fairy** (helper): Cryptic hints when circuits fail, 40% appear chance
- **Competitor Chip** (rival): Races players, optimizes designs

**Debug Assistant**:
- Analyzes circuits for: unconnected gates, double NOT redundancy, feedback loops, missing inputs, dangling outputs
- Simulates circuits with given inputs
- Provides explanations and hints

**Circuit Optimizer**:
- Scores solutions on 0-1 scale (correctness, efficiency, speed, elegance)
- Compares player solutions against community
- Tracks improvement over time

**Agent Control Bridge**:
- Circuits can trigger commands in other CraftMind plugins
- Preset rules for fishing storm recall, herding auto-gather, ranch auto-feed
- Supports AND/OR/NOT/XOR logic with multiple conditions

## File Structure

```
src/
├── academy.js              # Player, Academy, XP/level/streak system
├── circuit-challenges.js   # loadChallenges(), getChallengesByTier(), rateChallenge()
├── daily-challenges.js     # DailyChallengeGenerator (ZAI API + fallback)
├── tutor-bot.js           # TutorBot (AI hints via ZAI API)
├── redstone-validator.js  # RedstoneValidator (mineflayer circuit testing)
├── achievements.js        # AchievementSystem (12 achievements)
├── inventory.js           # Inventory, POWERUPS, CRAFTING
├── scoreboard.js          # Scoreboard (global/weekly leaderboards)
├── index.js               # Main exports, registerWithCore()
└── ai/
    ├── circuit-agents.js       # SPARKY, PROFESSOR_OHM, DEBUG_FAIRY, COMPETITOR_CHIP
    ├── circuit-optimizer.js    # CircuitOptimizer (solution comparison)
    ├── debug-assistant.js      # DebugAssistant (circuit analysis)
    ├── agent-control-bridge.js # AgentControlBridge (cross-game automation)
    ├── circuit-actions.js      # Circuit action definitions
    └── utils.js                # pickRandom(), clamp()

data/
├── challenges.json         # 34 challenge definitions
└── achievements.json       # Achievement conditions

tests/
├── test-all.js            # 31 integration tests
└── test-ai.js             # AI module tests

examples/
├── demo.js                # Standalone demo
└── academy-demo.js         # Academy usage demo

scripts/
└── playtest.js            # Simulated plugin test
```

## Current State

**Completed Features** (v1.0.0):
- ✅ 34 challenges across 5 tiers with complete data
- ✅ Daily challenge generator with ZAI API integration
- ✅ Tutor bot with AI-powered hints (6-message conversation memory)
- ✅ Achievement system with 12 achievements
- ✅ Power-up inventory (7 items) with crafting recipes
- ✅ Redstone validator for mineflayer integration
- ✅ Scoreboard with global/weekly leaderboards
- ✅ Player progression (10 levels, XP thresholds, streak multipliers up to 3x)
- ✅ 4 AI companion agents with full dialogue trees
- ✅ Circuit optimizer with solution comparison
- ✅ Debug assistant with circuit simulation
- ✅ Agent control bridge with 8+ preset rules
- ✅ 31 integration tests passing
- ✅ Plugin registration via `registerWithCore()`

**Test Coverage**:
- 31 tests covering: Player/Academy, Challenges, Achievements, Inventory, Scoreboard, Tutor Bot, Daily Challenge Generator, Data integrity
- All tests pass (`npm test`)

## 5 Improvements for v1.1

1. **Adaptive Learning Path**
   - Track player weakness categories (e.g., failing Memory circuits)
   - Recommend specific challenges based on performance
   - Dynamic difficulty adjustment within tiers

2. **Collaborative Building**
   - Multiplayer circuit building sessions
   - Share circuit designs as blueprints
   - Community circuit marketplace

3. **Enhanced AI Feedback**
   - Real-time circuit analysis during building
   - Visual debugging overlay (highlight problem areas)
   - Voice hints via text-to-speech

4. **Time-Attack Mode**
   - Daily leaderboards for fastest completions
   - Ghost replays of top solutions
   - Speed-running challenges with par times

5. **Integrated Circuit Sandbox**
   - Free-build mode with unlimited blocks
   - Save/load circuit designs
   - Test bench with custom truth tables

## Core Integration

**Plugin Registration** (`src/index.js`):
```js
import { registerWithCore } from 'craftmind-circuits';
registerWithCore(core); // Registers as 'circuits' plugin
```

**Exposed Modules**:
- `RedstoneValidator`: Circuit testing via mineflayer
- `TutorBot`: AI tutoring system
- `Academy`: Player and challenge management
- `DailyChallengeGenerator`: Procedural challenges
- `Scoreboard`: Leaderboard management

**Cross-Game Integration** (via AgentControlBridge):
```js
const bridge = new AgentControlBridge();
bridge.registerGame('fishing', fishingBot);
bridge.registerGame('herding', herdingBot);
bridge.addRule({
  id: 'storm_recall',
  conditions: [{ source: 'weather', signal: 'storm', operator: 'is' }],
  actions: [{ target: 'fishing', command: 'recall_to_dock' }],
  logic: 'AND'
});
```

**World State Inputs**:
- `weather`, `timeOfDay`, `fish_count`, `herd_spread`, `ranch_avg_hunger`, `ranch_breedings_today`, `research_busy`, `predator_threat`

## Environment Variables

```bash
ZAI_API_KEY=your_key_here  # For AI hints and daily challenges
```

## Development Notes

- All modules use ES6 imports (type: "module")
- No external dependencies besides Node.js ≥18
- mineflayer integration requires external bot instance
- Data files use JSON for easy editing
- Test files can be run directly with Node
- Fallback behavior when ZAI_API_KEY is missing
