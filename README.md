# ⚡ CraftMind Circuits

> A Cocapn-inspired Minecraft Redstone Academy — learn circuits through gamified challenges with XP, levels, achievements, and AI tutoring.

## 🔌 Quick Start

```bash
npm install
node examples/academy-demo.js    # Run the demo
npm test                          # Run tests
```

## 🎓 How It Works

CraftMind Circuits is a **redstone learning system** where players progress through 33 challenges across 5 difficulty tiers, earning XP, unlocking achievements, and getting AI-powered hints along the way.

### ⚡ XP & Leveling

| Level | XP Required | Unlocks |
|-------|------------|---------|
| 1 | 0 | Apprentice challenges |
| 2 | 100 | New challenge categories |
| 3 | 250 | Journeyman tier |
| 4 | 500 | Power-up drops |
| 5 | 900 | Artisan tier, Tournaments |
| 6 | 1,400 | Daily themed challenges |
| 7 | 2,100 | Master tier |
| 8 | 3,000 | Rare power-up recipes |
| 9 | 4,200 | Grandmaster tier |
| 10 | 5,800 | All content unlocked |

**XP Sources**: Challenge completion (×1-3 by stars), speed bonuses, accuracy bonuses, daily streak multiplier (up to ×3).

### ⭐ Star Rating

| Stars | Criteria |
|-------|----------|
| ⭐ | Circuit works correctly |
| ⭐⭐ | Works + under par block count |
| ⭐⭐⭐ | Works + efficient + fast (under 50% time) |

## 🧩 Challenge Catalog (33 Challenges)

### Apprentice (10 challenges)
| # | Challenge | Category | Par Blocks | Time |
|---|-----------|----------|-----------|------|
| 1 | AND Gate | Logic Gates | 8 | 2:00 |
| 2 | OR Gate | Logic Gates | 5 | 1:30 |
| 3 | NOT Gate | Logic Gates | 5 | 1:30 |
| 4 | 1Hz Clock | Clocks | 10 | 3:00 |
| 5 | Signal Strength Chain | Logic Gates | 20 | 3:00 |
| 6 | Repeater Delay Chain | Clocks | 12 | 3:00 |
| 7 | Single Piston Door | Trap Doors | 6 | 2:00 |
| 8 | Room Lighting System | Contraptions | 15 | 5:00 |
| 9 | Automatic Night Lights | Contraptions | 8 | 3:00 |
| 10 | Vertical Redstone | Logic Gates | 12 | 3:00 |

### Journeyman (7 challenges)
| # | Challenge | Category | Par Blocks | Time |
|---|-----------|----------|-----------|------|
| 11 | XOR Gate | Logic Gates | 14 | 5:00 |
| 12 | NAND Gate | Logic Gates | 10 | 4:00 |
| 13 | NOR Gate | Logic Gates | 8 | 3:00 |
| 14 | Pulse Shortener | Clocks | 12 | 5:00 |
| 15 | Observer Clock | Clocks | 6 | 3:00 |
| 16 | Item Transport Pipe | Transportation | 10 | 5:00 |
| 17 | Auto-Smoker System | Contraptions | 15 | 10:00 |
| 18 | Minecart Launch Station | Transportation | 20 | 10:00 |

### Artisan (7 challenges)
| # | Challenge | Category | Par Blocks | Time |
|---|-----------|----------|-----------|------|
| 19 | XNOR Gate | Logic Gates | 16 | 7:00 |
| 20 | T Flip-Flop | Memory | 18 | 10:00 |
| 21 | RS-NOR Latch | Memory | 14 | 7:00 |
| 22 | Monostable Circuit | Memory | 12 | 5:00 |
| 23 | 2×2 Piston Door | Trap Doors | 30 | 15:00 |
| 24 | Dispenser Trap | Contraptions | 8 | 5:00 |
| 25 | Note Block Jukebox | Contraptions | 15 | 10:00 |
| 26 | Double Piston Extender | Contraptions | 20 | 10:00 |

### Master (6 challenges)
| # | Challenge | Category | Par Blocks | Time |
|---|-----------|----------|-----------|------|
| 27 | 1-Bit Binary Adder | Computing | 40 | 30:00 |
| 28 | 3×3 Secret Door | Trap Doors | 60 | 40:00 |
| 29 | Automatic Wheat Farm | Contraptions | 35 | 20:00 |
| 30 | Multi-Item Sorter | Transportation | 50 | 30:00 |
| 31 | Combination Lock | Redstone Computers | 45 | 20:00 |

### Grandmaster (3 challenges)
| # | Challenge | Category | Par Blocks | Time |
|---|-----------|----------|-----------|------|
| 32 | 4-Bit Shift Register | Computing | 80 | 60:00 |
| 33 | Redstone Calculator | Redstone Computers | 120 | 120:00 |
| 34 | Binary to Decimal Display | Computing | 100 | 60:00 |

## 🏅 Achievements (21 achievements)

### Bronze 🥉
| Achievement | Description | Reward |
|-------------|-------------|--------|
| 🌱 First Circuit | Complete your first challenge | +50 XP |
| 🔌 Getting Wired | Complete 5 challenges | +75 XP |
| 🦉 Night Owl | Complete a challenge at night | +50 XP |
| 🔥 On a Roll | 3-day login streak | +50 XP |

### Silver 🥈
| Achievement | Description | Reward |
|-------------|-------------|--------|
| ⚡ Speed Demon | Complete challenge under 30s | +100 XP |
| 🔧 Circuit Apprentice | Complete 10 challenges | +150 XP |
| ✨ Minimalist | Complete with ≤3 blocks | +100 XP |
| 📅 Weekly Warrior | 7-day streak | +150 XP |
| 🌟 Star Collector | 3 stars on 5 challenges | +150 XP |

### Gold 🏅
| Achievement | Description | Reward |
|-------------|-------------|--------|
| 💎 Perfectionist | Zero wasted blocks | +150 XP |
| ⚙️ Redstone Artisan | Complete 20 challenges | +300 XP |
| 🎯 Category Master | Master 3 categories | +250 XP |
| 🚀 Speed Architect | 5 challenges under 60s (hidden) | +250 XP |
| 💫 Perfection Incarnate | 3 stars on 15 challenges | +300 XP |

### Diamond 💎
| Achievement | Description | Reward |
|-------------|-------------|--------|
| 👑 Redstone Master | Complete all challenges | +1000 XP |
| 🏆 Unstoppable | 30-day streak | +500 XP |
| 🌟 Grand Engineer | Reach Level 10 | +500 pts |
| 🧠 Logic Pro | Complete all Logic Gates | +400 XP |

### Hidden Achievements
| Achievement | Description | Reward |
|-------------|-------------|--------|
| 👁️ Visionary | Use Observer Eye on 10 challenges | +100 XP |
| 💰 Redstone Hoarder | Collect 500 total points | +200 XP |

## 🎒 Power-Ups & Inventory

| Item | Rarity | Effect |
|------|--------|--------|
| 📐 Circuit Blueprint | Common | Reveals solution hint |
| 🧭 Redstone Compass | Common | Finds nearest redstone component |
| 🧲 Block Magnet | Uncommon | Auto-collects required blocks |
| ⏸️ Time Freeze | Rare | Pauses timer for 30s |
| 👁️ Observer Eye | Rare | Highlights redstone connections |
| ⚡ XP Boost | Epic | Doubles next challenge XP |
| ⭐ Star Shine | Legendary | Guarantees 2+ stars |

**Crafting Recipes**:
- Observer Eye = 3× Blueprint + 2× Compass
- Time Freeze = 2× Block Magnet + 1× Compass
- XP Boost = 5× Blueprint + 3× Block Magnet
- Star Shine = 2× XP Boost + 2× Observer Eye + 1× Time Freeze

## 🤖 AI Tutor

The tutor bot observes your building and offers contextual hints:
- "Check your repeater orientation — the small line points in the signal direction."
- "Try breaking the problem into smaller sub-circuits."
- Celebrates your achievements automatically

## 🏆 Competitive Play

- **Global Leaderboard** — compete for highest XP
- **Weekly Tournaments** — special rankings each week
- **Category Rankings** — fastest, most efficient, most completed
- **Friend Comparisons** — see how you stack up

## 📦 Modules

| Module | Description |
|--------|-------------|
| `src/academy.js` | Player leveling, XP, quests, streaks |
| `src/circuit-challenges.js` | Challenge loading, rating, categorization |
| `src/redstone-validator.js` | Mineflayer-based circuit testing bot |
| `src/achievements.js` | Achievement detection and tracking |
| `src/daily-challenges.js` | LLM-generated daily challenges |
| `src/inventory.js` | Power-up system with crafting |
| `src/scoreboard.js` | Leaderboards and rankings |
| `src/tutor-bot.js` | AI tutor with contextual hints |

## License

MIT — see [LICENSE](LICENSE)
