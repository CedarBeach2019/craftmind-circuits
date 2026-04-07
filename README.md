# craftmind-circuits ✨

You build redstone. The server validates the circuit in your world. You learn by doing, with 34 gamified challenges. Fork this repository first—you own every part of your instance.

**Live Demo:** Join `craftmind.demo.cocapn.ai` (Minecraft 1.20+).  
**Quick Start:** Fork → Build → Drop the `.jar` into your server's `plugins/` folder.

---

## Why This Exists

Most redstone tutorials end with “build it yourself,” but nothing checks your work. This plugin validates the actual circuits you place in your world, focusing on behavior, not multiple-choice answers.

---

## How It Works

Challenges define block-and-signal criteria. When you build, the plugin tests your circuit directly in the world. Your progress is stored locally and can sync across any server in your Cocapn Fleet. AI features (like hints) run using your API keys on Cloudflare Workers—your data stays on your infrastructure.

## What You Get

- **34 Challenges** across 5 tiers, from basic repeaters to arithmetic units.
- **In-World Validation:** Tests the redstone you place, not your quiz answers.
- **Progression System:** XP, streaks, achievements, and per-server leaderboards.
- **Optional AI Tutor:** Provide your own API key for contextual, non-spoilery hints.
- **Circuit Optimizer:** Suggests improvements for size, speed, or reliability (requires API key).
- **Fleet-Native:** Progress travels with you across servers in your Cocapn Fleet.
- **Zero Dependencies:** Runs on the Cloudflare Workers protocol; no external database needed.
- **MIT Licensed:** Open source. No telemetry.

---

## What Makes This Different

1.  It validates circuit behavior, not answers. Most challenges accept many valid solutions.
2.  Your data stays with you. AI uses your keys on your infrastructure.
3.  Fork-first. You own your instance and can modify challenges, tiers, or logic.

---

## Quick Start (Under 2 Minutes)

1.  **Fork this repo.** This is your own instance.
2.  Build the plugin: `mvn clean package`.
3.  Copy the generated `.jar` into your server’s `plugins/` folder.
4.  Restart your server. Core challenges work immediately.
5.  *(Optional)* Add your AI API key in `config.yml` to enable hints and the optimizer.

---

## Limitations

- AI features (hints, optimizer) require you to supply and manage your own external API key; they will not function without one and may incur usage costs based on your provider.

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>