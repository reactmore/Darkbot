
# Darkbot

A simple Telegram User/Bot built using Gramjs.


## Features

- Run as **Telegram User** or **Telegram Bot**
- External plugin system (install directly from a gist)
- Support for external bot commands
- Flexible database support (SQLite, PostgreSQL, MySQL)


## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/darkdeathoriginal/Darkbot
cd Darkbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
npm run postinstall
```
Edit your .env file as needed.

`WEB_LOGIN_ENABLED=TRUE   # or FALSE`

### 4. Login and Run
If `WEB_LOGIN_ENABLED=TRUE` Darkbot will use Web Login Mode.
You should start the project with nodemon or pm2 for process management:

```bash
# Development with auto-restart
npm run dev

# Or production with PM2
npm start
```
If `WEB_LOGIN_ENABLED=FALSE` Darkbot will use Interactive Bash Login:

```
node .

phone number?:
otp?:
2FA?: 
```

## Database Configuration
Darkbot supports multiple databases. Configure via .env:

```env
# SQLite
DATABASE_URL="sqlite"

# PostgreSQL (optional)
DATABASE_URL="postgres://user:pass@localhost:5432/darkbot"

# MySQL (For MySQL, comment out DATABASE_URL)
DB_DATABASE=darkbot
DB_USERNAME=root
DB_PASSWORD=
DB_HOST=localhost
```

## Endpoint WEB Login

Routes:
```bash
# Page QR -> Redirect Home if Valid Sessions
GET - https://localhost:3000/auth/login
# Check Status -> TODO: STill Static without QR Flow
GET - https://localhost:3000/auth/status
# Get QR when Expired
GET - https://localhost:3000/auth/qr
# Sumbit Password 2FA
POST - https://localhost:3000/auth/submit-password

# Get Home 
GET - https://localhost:3000/

# Check Status Health 
GET - https://localhost:3000/health
```

## Usage/Examples adding plugins

Type `.list` to get list of all user command.

`.install <gist-url>` can install external plugins,

For external bot run `/addbot` in your bot . [Sample bot](https://gist.github.com/darkdeathoriginal/57995db444bdcafd004887a7de82e9c6)

