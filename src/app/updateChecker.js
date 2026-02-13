const simpleGit = require("simple-git");

const git = simpleGit();

async function checkForUpdates(client) {
    try {
        const commits = await git.log(["main..origin/main"]);

        if (commits.total === 0) return;

        let changelog = "_Pending updates:_\n\n";

        commits.all.forEach((commit, index) => {
            changelog += `${index + 1}• **${commit.message}**\n`;
        });

        changelog += `\n_Use ".update start" to start the update_`;

        await client.sendMessage("me", { message: changelog });

    } catch (err) {
        console.log("Update check failed:", err.message);
    }
}

module.exports = {
    checkForUpdates,
};
