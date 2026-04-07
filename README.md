# craftmind-circuits

You've spent hours debugging a broken redstone clock. Most tutorials only show you how to replicate circuits, not design them. This plugin helps you bridge that gap through structured, gamified learning.

A Cocapn Fleet Minecraft plugin offering progressive redstone challenges with in-world validation and optional AI-assisted guidance.

---

## Why this exists

Learning redstone design often involves inefficient trial and error. This plugin provides a scaffolded path from basic concepts to complex logic, integrating directly with your server. It runs on your infrastructure with no mandatory external services.

## What it provides

*   **34 Challenges**: Organized across 5 difficulty tiers, from introductory repeaters to advanced arithmetic units.
*   **Live Validation**: Tests the physical redstone you build in your world, not multiple-choice answers.
*   **Player Progression**: Tracks XP, streaks, and achievements with per-server leaderboards.
*   **Optional AI Tutoring**: When configured with your API keys, it can offer contextual hints and ask guiding questions to help you reason through problems.
*   **Circuit Optimizer**: Reviews your working designs and suggests improvements for size, speed, or reliability.
*   **Fleet Native**: Player progress is portable across any server in your Cocapn Fleet.

## How it works

*   **In-World Validation**: Each challenge has criteria that are tested against the blocks and signals in your build area.
*   **Fork-First Design**: Server operators can freely modify, add, or remove challenges to fit their community.
*   **Local AI Processing**: When enabled, tutoring hints are generated locally using your configured API keys; no build data is sent to us.
*   **Zero Dependencies**: No external database is required; it uses the Fleet's distributed protocol.

## A note on limitations

The core challenge progression and validation work immediately. The AI-guided features—contextual hints, daily challenges, and the circuit optimizer—require you to supply and configure your own API keys for an AI provider. They are a powerful optional layer, not the core experience.

## Quick start

1.  **Fork this repository.** This is fork-first software; you maintain your instance.
2.  **Build the plugin** from your forked source.
3.  Place the generated `.jar` file into your server's `plugins` directory.
4.  Restart your server. Basic challenges and progression are now active.
5.  *(Optional)*: To enable AI features, add your service keys to the generated `config.yml` file.

You can browse a public Fleet instance showcasing the challenge library and leaderboards:
https://the-fleet.casey-digennaro.workers.dev

## Configure AI features (BYOK)

To use the AI tutoring, puzzle generation, or optimizer, you must bring your own keys. Add your LLM provider API key to `config.yml`. This keeps your data local and lets you control costs and models.

## Contributing

This project follows a fork-first philosophy. The best way to contribute is to fork the repository, implement the change or challenge you want, and run it on your server. If you believe your modification would benefit others, you are welcome to submit a pull request.

## License

MIT License · Superinstance & Lucineer (DiGennaro et al.)

---

<div align="center">
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> · 
  <a href="https://cocapn.ai">Cocapn</a>
</div>