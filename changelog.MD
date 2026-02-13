# v2.0.0 — Teleproto Runtime Refactor

🔥 BREAKING CHANGES

- Migrated from GramJS (telegram) to Teleproto
- Removed adm-zip
- Rewritten ExternalBot system
- Rewritten Conversation system (DB-backed)
- BotFather now fully modular
- External bots now stored per-folder (runtime/bots/<BotName>/)

✨ Major Improvements

- Multi-bot runtime architecture
- Modular command structure:
    - admin/
    - user/
    - system/
- Database-backed Conversation Manager
    - active flag
    - completedAt timestamp
    - cancel support
- External bot support:
    - Gist raw URL
    - GitHub repository (auto zip download)
- Automatic BOT_TOKEN injection
- Safe restart system (PM2 recommended)
- FloodWaitError handling
- Cleaner loader sequence (download → require)

⚙ Architecture Changes

- BotInstance rewritten
- ExternalBotLoader rewritten
- ConversationManager refactored
- Runtime auto-load structure

🧹 Cleanup

- Removed hot-reload hacks
- Removed legacy single-file plugin system
- Removed global state logic in BotFather
- Removed telegram dependency

📦 New External Bot System

Supports:

1. Single-file Gist
2. Full modular repository

Example repo structure:

1. Single External Bot (gist): https://github.com/reactmore/Darkbot/tree/main/example/PingExternalBot
2. Modular External Bot: https://github.com/reactmore/Darkbot/tree/main/example/PingProBot


