
# Darkbot

A simple Telegram User/Bot built using Gramjs.


## Features

- Can run both user and bot accounts
- External plugin support
- External Bot support
- PM2

## Run Locally

- Clone the project

```bash
git clone https://github.com/darkdeathoriginal/Darkbot
```

- Go to the project directory

```bash
cd Darkbot
```

- Install dependencies

```bash
npm install
```

- Create file env

```bash
cp .env.example .env
```

- Setup Environment Variables

```text
API_ID="" | API ID From Telegram API  
API_HASH="" | API HASH From Telegram API  
AS_BOT_API=TRUE | Running Script As Bot API
BOT_TOKEN="" | Need Fill Bot Token IF As Bot API True
LOG_DETAIL="INFO"
SESSION="" | Generate Sessions Code or Empty This to Auto Generate
DATABASE_URL="./bot.db" | Optional Database Remote | Default SQLITE
```

- Setup account

```bash
  node .
```

- Start BOT

```bash
  npm start
```


## Usage/Examples

Type `.list` to get list of all user command.

`.install <gist-url>` can install external plugins,

For external bot run `/addbot` in your bot . [Sample bot](https://gist.github.com/darkdeathoriginal/57995db444bdcafd004887a7de82e9c6)


