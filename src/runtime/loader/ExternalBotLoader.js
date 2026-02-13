const fs = require("fs");
const path = require("path");
const axios = require("axios");
const unzipper = require("unzipper");

const { ExternalBotModel } = require("../../models");

const botFolder = path.join(__dirname, "../bots");

async function ensureBotFolder(name) {
    const folderPath = path.join(botFolder, name);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
}

async function downloadGist(bot, folderPath) {

    let url = new URL(bot.url);

    if (
        url.host === "gist.github.com" ||
        url.host === "gist.githubusercontent.com"
    ) {
        url = url.toString().endsWith("raw")
            ? url.toString()
            : url.toString() + "/raw";
    }

    const response = await axios(url + "?t=" + Date.now());

    const content = response.data.replace(
        "BOT_TOKEN",
        `BOT_TOKEN:"${bot.token}"`
    );

    fs.writeFileSync(
        path.join(folderPath, "index.js"),
        content
    );
}

async function downloadRepo(bot, folderPath) {

    const repoUrl = bot.url.replace(/\.git$/, "");
    const branch = bot.branch || "main";

    const zipUrl = `${repoUrl}/archive/refs/heads/${branch}.zip`;

    const response = await axios({
        url: zipUrl,
        method: "GET",
        responseType: "stream"
    });

    const tempZip = path.join(folderPath, "temp.zip");

    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(tempZip);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });

    await fs.createReadStream(tempZip)
        .pipe(unzipper.Extract({ path: folderPath }))
        .promise();

    fs.unlinkSync(tempZip);

    const extractedFolder = fs.readdirSync(folderPath)
        .find(f => f.includes(branch));

    if (extractedFolder) {

        const extractedPath = path.join(folderPath, extractedFolder);
        const files = fs.readdirSync(extractedPath);

        for (const file of files) {
            fs.renameSync(
                path.join(extractedPath, file),
                path.join(folderPath, file)
            );
        }

        fs.rmSync(extractedPath, { recursive: true, force: true });
    }

    // replace BOT_TOKEN
    const indexPath = path.join(folderPath, "index.js");

    if (fs.existsSync(indexPath)) {

        let content = fs.readFileSync(indexPath, "utf-8");

        content = content.replace(
            "BOT_TOKEN",
            `BOT_TOKEN:"${bot.token}"`
        );

        fs.writeFileSync(indexPath, content);
    }
}

async function loadExternalBots() {

    await ExternalBotModel.sync();

    const bots = await ExternalBotModel.findAll({
        where: { isActive: true }
    });

    // 🔥 STEP 1 — DOWNLOAD ALL FIRST
    for (const bot of bots) {

        const folderPath = await ensureBotFolder(bot.name);

        const indexPath = path.join(folderPath, "index.js");

        if (!fs.existsSync(indexPath)) {

            console.log("Downloading:", bot.name);

            if (bot.sourceType === "gist") {
                await downloadGist(bot, folderPath);
            }

            if (bot.sourceType === "repo") {
                await downloadRepo(bot, folderPath);
            }

            console.log("Download finished:", bot.name);
        }
    }

    // 🔥 STEP 2 — REQUIRE AFTER ALL DOWNLOAD COMPLETE
    for (const bot of bots) {

        const indexPath = path.join(botFolder, bot.name, "index.js");

        if (fs.existsSync(indexPath)) {

            try {
                require(indexPath);
                console.log("Loaded:", bot.name);
            } catch (err) {
                console.error("Failed loading:", bot.name);
                console.error(err);
            }
        }
    }
}

module.exports = { loadExternalBots };
