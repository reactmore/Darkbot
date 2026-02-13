# Darkbot

A modular Telegram multi-bot runtime powered by Darkbot migrate Gramjs with **Teleproto**.

Supports:

- Userbot
- Multi Bot Tokens
- External Bot via Gist
- External Bot via GitHub Repository
- Modular Command Architecture
- Database-backed Conversation System

---

## 🚀 Features

- Multi bot instance manager
- Modular bot structure (admin/user/system)
- Gist plugin support
- GitHub repository support
- Auto BOT_TOKEN injection
- Conversation flow engine (DB based)
- PM2 ready
- SQLite / MySQL support

---

## 📦 Installation

```bash
git clone https://github.com/reactmore/DarkRuntime
cd DarkRuntime
npm install
```

---

## ⚙ Setup Environment

```bash
npm run postinstall
```

Edit `.env` file if needed.

---

## 🧪 Run Development

```bash
npm run dev
```

---

## 🏭 Run Production (Recommended)

```bash
npm start
```

(Powered by PM2)

---

## 🗄 Database Configuration

### SQLite (default)

```
DATABASE_URL="sqlite"
```

### MySQL

```
DB_DATABASE=darkruntime
DB_USERNAME=root
DB_PASSWORD=
DB_HOST=localhost
```

---

# 🤖 External Bot Installation

Inside BotFather:

```
/addbot
```

You will be asked:

1. Bot Token  
2. Gist Raw URL OR GitHub Repository URL  

---

# 📦 Supported External Bot Formats

---

## 1️⃣ GIST FORMAT (Single File)

Example:

```
https://gist.github.com/reactmore/77c6a9825a8ef70c9086ee3c80869753
```

Example file:

```js
const { botHandler } = require("../../handler");

botHandler({
  name: "PingExternalBot",
  BOT_TOKEN,
  commands: [
    {
      pattern: "start",
      description: "Start command",
      callback: async (m) => {
        await m.send("Bot running 🚀");
      }
    }
  ]
});
```

---

## 2️⃣ REPOSITORY FORMAT (Recommended)

Example:

```
https://github.com/reactmore/PingProBot
```

### Repository structure:

```
PingProBot/
 ├── index.js
 ├── admin/
 │    └── stats.js
 ├── user/
 │    ├── ping.js
 │    └── start.js
 └── system/
      └── inline.js
```

### index.js example:

```js
const { botHandler } = require("../../handler");

botHandler({
  name: "PingProBot",
  BOT_TOKEN,
  commandsPath: __dirname
});
```

---

# 🧩 Modular Command Example

### user/ping.js

```js
module.exports = {
  pattern: "ping",
  description: "Ping test",
  callback: async (m) => {
    await m.send("Pong 🚀");
  }
};
```

---

# 🔄 Conversation System

Conversation stored in DB:

- userId
- botToken
- flow
- step
- active
- completedAt

Supports:

```
/cancel
```

to stop active conversation.

---

# 🛠 Migrations

```bash
npx sequelize-cli db:migrate
```

---

# 📁 Project Bot Token Structure

```
runtime/
 ├── bots/
 ├── loader/
 ├── manager/
 ├── conversation/
```

---

# ⚠ Notes

- Use PM2 in production
- Avoid rapid bot restarts (Telegram flood protection)
- FloodWait automatically handled
- External bots are auto-downloaded if missing

---

# 🏷 Version

Current version: **2.0.0**

---

# 🧠 Architecture Summary

- Teleproto based runtime
- Multi-bot support
- DB-driven conversations
- Modular external bot system
- Gist & GitHub repository support
- Clean restart model (no hot reload hacks)

---
