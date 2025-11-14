
const fs = require("fs");
const makeWASocket = require('@whiskeysockets/baileys').default;

// Load settings
let settings = JSON.parse(fs.readFileSync("./database/settings.json"));

function saveSettings() {
    fs.writeFileSync("./database/settings.json", JSON.stringify(settings, null, 2));
}

async function startBot() {
    const sock = makeWASocket({ printQRInTerminal: true });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        const from = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // Alive
        if (text === ".alive") {
            return await sock.sendMessage(from, { text: "🟢 I am alive!" });
        }

        // Menu
        if (text === ".menu") {
            return await sock.sendMessage(from, { text: "📜 MENU:\n• .alive\n• .menu\n• .setting" });
        }

        // Settings menu
        if (text === ".setting") {
            return await sock.sendMessage(from, { text: `
┏━━━━━━ ❍ SETTINGS MENU ❍ ━━━━━━┓
⚙️ BOT SETTINGS

• .autoread on/off
• .antidelete on/off
• .antilink on/off
• .autostatus on/off
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`});
        }

        // ON/OFF SYSTEM COMMANDS
        if (text === ".autoread on") { settings.autoread = true; saveSettings(); await sock.sendMessage(from,{text:"✅ Auto Read ON"}); }
        if (text === ".autoread off") { settings.autoread = false; saveSettings(); await sock.sendMessage(from,{text:"❌ Auto Read OFF"}); }

        if (text === ".antilink on") { settings.antilink = true; saveSettings(); await sock.sendMessage(from,{text:"🛡️ AntiLink ON"}); }
        if (text === ".antilink off") { settings.antilink = false; saveSettings(); await sock.sendMessage(from,{text:"⚠️ AntiLink OFF"}); }

        if (text === ".antidelete on") { settings.antidelete = true; saveSettings(); await sock.sendMessage(from,{text:"🛡️ AntiDelete ON"}); }
        if (text === ".antidelete off") { settings.antidelete = false; saveSettings(); await sock.sendMessage(from,{text:"⚠️ AntiDelete OFF"}); }

        if (text === ".autostatus on") { settings.autostatus = true; saveSettings(); await sock.sendMessage(from,{text:"🔄 AutoStatus ON"}); }
        if (text === ".autostatus off") { settings.autostatus = false; saveSettings(); await sock.sendMessage(from,{text:"🔕 AutoStatus OFF"}); }

        // Auto Read
        if (settings.autoread) {
            await sock.readMessages([msg.key]);
        }
    });

    // Anti delete
    sock.ev.on("messages.update", async (update) => {
        if (!settings.antidelete) return;
        const msg = update[0];
        if (msg.message === null && msg.key.fromMe === false) {
            await sock.sendMessage(msg.key.remoteJid, { text: "🛑 Deleted message recovered!" });
        }
    });
}

startBot();
