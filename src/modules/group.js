const { Module } = require("../core/moduleRegistry");

// aturan per group
const GROUP_RULES = {
  "3837695651": {
    triggers: ["seller", "seler"],  // Keyword              
    trigger_require: [],
    trigger_exclude: [],
    reply: `🔥 ON Kak 🔥

✅ Crypto ecer / nampung  
✅ Ready P2P di beberapa exchange  

📩 DM: @fvckinD`,
    mode: "save",
  },
  "3541121270": { // Airdrop Pedia
    triggers: ["seller", "seler"],  // Keyword              
    trigger_require: [],
    trigger_exclude: [],
    reply: `🔥 ON Kak 🔥

✅ Crypto ecer / nampung  
✅ Ready P2P di beberapa exchange  

📩 DM: @fvckinD`,
    mode: "save",
  },
  "1922755763": { //Cloud Airdrop Disscusion 🇮🇩 🇯🇵 🇷🇺
    triggers: ["seller", "seler"],  // Keyword              
    trigger_require: [],
    trigger_exclude: [],
    reply: `🔥 ON Kak 🔥

✅ Crypto ecer / nampung  
✅ Ready P2P di beberapa exchange  

📩 DM: @fvckinD`,
    mode: "save",
  }
};

const DESK_GROUP_ID = Object.keys(GROUP_RULES)[2]

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (minMs, maxMs) => Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

function buildMessageLink(m, chatId) {
  // kalau ada username group, pakai itu
  const username = m.chat?.username || m.data?.peerId?.username;
  if (username) {
    return `https://t.me/${username}/${m.id}`;
  }

  let id = String(chatId);
  if (id.startsWith("-100")) id = id.slice(4);
  if (id.startsWith("-")) id = id.slice(1);

  return `https://t.me/c/${id}/${m.id}`;
}

Module(
  { on: "message", fromMe: false, desc: "Auto reply by group rules", use: "utility" },
  async (m) => {
    try {
      // di wrapper kamu, m.message itu sudah string
      const text = (m.message || "").toLowerCase().trim();
      if (!text) return;

      const chatId = String(m.jid);

      const rule = GROUP_RULES[chatId];
      if (!rule) return;

      // ❌ jangan respon kalau termasuk kalimat rujukan ke seller lain
      if (rule.trigger_exclude && rule.trigger_exclude.some(t => text.includes(t))) {
        return;
      }

      // ✅ cek apakah kena keyword langsung ATAU konteks cari
      const hitTrigger = rule.triggers?.some(t => text.includes(t)) || false;
      const hitRequire = rule.trigger_require?.some(t => text.includes(t)) || false;

      // kalau dua-duanya tidak kena → skip
      if (!hitTrigger && !hitRequire) {
        return;
      }

      // delay natural: 2–5 detik
      const delay = randomDelay(2000, 5000);
      await sleep(delay);

      // MODE: AUTO → langsung reply di group
      if (rule.mode === "auto") {
        await m.client.sendMessage(m.jid, {
          message: rule.reply,
          replyTo: m.id,
        });
        return;
      }

      // MODE: SAVE → kirim ke "me"
      if (rule.mode === "save") {
        // ambil username kamu sendiri buat mention
        let me;
        try {
          me = await m.client.getMe();
        } catch (_) { }

        const mention = me?.username ? `@${me.username}` : "(ping)";

        // bikin link message
        let link;
        try {
          link = buildMessageLink(m, chatId);
        } catch (_) {
          link = null;
        }

        const infoLines = [
          `${mention} Trigger masuk (SAVE MODE)`,
          link ? `🔗 Link: ${link}` : "🔗 Link: (tidak tersedia, diforward)",
          `🗨️ Pesan: ${m.message}`,
          `🆔 Group ID: ${chatId}`,
        ];

        // kirim info ke "me"
        await m.client.sendMessage(Number(DESK_GROUP_ID), {
          message: infoLines.join("\n"),
        });

        // kalau link nggak bisa diakses (private), forward message-nya juga biar aman
        if (!link) {
          await m.client.forwardMessages("me", {
            messages: [m.id],
            fromPeer: m.jid,
          });
        }
      }
    } catch (e) {
      console.error("group-rules module error:", e);
    }
  }
);

Module(
  {
    pattern: "gpp ?(.*)",
    fromMe: true,
    desc: "changes/gets group image",
    use: "utility",
  },
  async (m, match) => {
    if (m.quoted) {
      const quoted = await m.getQuoted();
      let id = quoted.id;
      const r1 = await m.client.getMessages(m.jid, {
        ids: id,
      });
      if (r1[0]?.media?.photo) {
        await m.updatGroupImage(id);
        return await m.send("Profile picture updated");
      }
    }
    const buffer = await m.client.downloadProfilePhoto(m.jid, { isBig: true });
    await m.client.send(m.jid, { image: buffer });
  }
);
Module(
  {
    pattern: "gname ?(.*)",
    fromMe: true,
    desc: "change group title",
    use: "utility",
  },
  async (m, match) => {
    let username = await m.getUsername();
    await m.changeGroupTitle(username, match[1]);
  }
);
