
# Darkbot

A simple Telegram User/Bot built using Gramjs.


## Features

- Can run both user and bot accounts
- External plugin support
- External Bot support


## Run Locally

Clone the project

```bash
git clone https://github.com/darkdeathoriginal/Darkbot
```

Go to the project directory

```bash
cd Darkbot
```

Install dependencies
```bash
npm install
```

### Setup Environment Variables

```bash
npm run postinstall 
```

### Setup account
```bash
  node .
```

Start BOT
```bash
  npm start
```

## Database Support

```
DATABASE_URL="sqlite"   # for SQLite
DATABASE_URL="https://" # for Postgres/optional

# For MySQL, comment out DATABASE_URL and set the following variables:
DB_DATABASE=darkbot
DB_USERNAME=root 
DB_PASSWORD=
DB_HOST="localhost"
```


## Usage/Examples adding plugins

Type `.list` to get list of all user command.

`.install <gist-url>` can install external plugins,

For external bot run `/addbot` in your bot . [Sample bot](https://gist.github.com/darkdeathoriginal/57995db444bdcafd004887a7de82e9c6)


## MIgrate: 

```cli
npx sequelize-cli migration:generate --name alter-conversation-bot
```

