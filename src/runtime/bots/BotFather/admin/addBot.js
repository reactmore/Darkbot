const fs = require("fs");
const path = require("path");
const axios = require("axios");
const unzipper = require("unzipper");

const ConversationManager = require("../../../conversation/ConversationManager");
const { ExternalBotModel } = require("../../../../models");
const botsRoot = path.join(__dirname, "../../../bots"); 

const flowName = "addBot";

/*
|--------------------------------------------------------------------------
| REGISTER FLOW
|--------------------------------------------------------------------------
*/

ConversationManager.register(flowName, [

    // STEP 1
    async (msg) => {
        await msg.send("Send bot token");
    },

    // STEP 2
    async (msg, data) => {
        data.token = msg.message.trim();
        await msg.send("Send GIST raw URL or GitHub repository URL");
    },

    // STEP 3
    async (msg, data, session) => {

        const link = msg.message.trim();

        let url;
        try {
            url = new URL(link);
        } catch {
            return await msg.send("Invalid URL");
        }

        let sourceType = "gist";
        let branch = "main";

        if (url.host.includes("github.com") && !url.host.includes("gist")) {
            sourceType = "repo";

            const parts = url.pathname.split("/");
            if (parts.includes("tree")) {
                branch = parts[parts.indexOf("tree") + 1] || "main";
            }
        }

        await msg.send(`Detected source type: ${sourceType}`);

        const name = extractNameFromUrl(url);
        const folderPath = path.join(botsRoot, name);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // =========================
        // DOWNLOAD NOW (NOT LOADER)
        // =========================

        if (sourceType === "gist") {

            let rawUrl = url.toString();

            if (
                url.host === "gist.github.com" ||
                url.host === "gist.githubusercontent.com"
            ) {
                rawUrl = rawUrl.endsWith("raw")
                    ? rawUrl
                    : rawUrl + "/raw";
            }

            const response = await axios(rawUrl + "?t=" + Date.now());

            const content = response.data.replace(
                "BOT_TOKEN",
                `BOT_TOKEN:"${data.token}"`
            );

            fs.writeFileSync(
                path.join(folderPath, "index.js"),
                content
            );
        }

        if (sourceType === "repo") {

            const repoUrl = url.toString().replace(/\.git$/, "");
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

            const indexPath = path.join(folderPath, "index.js");

            if (fs.existsSync(indexPath)) {

                let content = fs.readFileSync(indexPath, "utf-8");

                content = content.replace(
                    "BOT_TOKEN",
                    `BOT_TOKEN:"${data.token}"`
                );

                fs.writeFileSync(indexPath, content);
            }
        }

        // =========================
        // SAVE TO DB
        // =========================

        await ExternalBotModel.create({
            url: url.toString(),
            name,
            token: data.token,
            sourceType,
            branch,
            isActive: true
        });

        await msg.send("Bot installed.");
        await msg.send("Restarting runtime...");

        await ConversationManager.finish(session);

        // 🔥 NOW restart clean
        process.exit(1);
    }

]);


function extractNameFromUrl(url) {

    if (url.host.includes("gist")) {
        return "GistBot_" + Date.now();
    }

    const parts = url.pathname.split("/").filter(Boolean);
    return parts[1] || "RepoBot_" + Date.now();
}

module.exports = {
    pattern: "addbot",
    description: "Add external bot",
    admin: true,

    callback: async (m, match, botInstance) => {

        await ConversationManager.stop(m.jid, botInstance.token);

        await ConversationManager.start(
            m.jid,
            botInstance.token,
            flowName,
            m
        );
    }
};
