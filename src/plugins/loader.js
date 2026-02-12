const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const { ExternalPluginsModel } = require("../models");

async function loadPlugins() {
    await ExternalPluginsModel.sync();

    const plugins = await ExternalPluginsModel.findAll();
    const pluginFolder = path.join(__dirname, "..", "modules");

    // Download external plugins if not exists
    for (const plugin of plugins) {
        const pluginName = plugin.name;
        const pluginUrl = plugin.url;

        const pluginPath = path.join(pluginFolder, pluginName + ".js");

        if (!fs.existsSync(pluginPath)) {
            let url;

            try {
                url = new URL(pluginUrl);
            } catch {
                console.log("Invalid URL:", pluginUrl);
                continue;
            }

            if (
                url.host === "gist.github.com" ||
                url.host === "gist.githubusercontent.com"
            ) {
                url = !url.toString().endsWith("raw")
                    ? url.toString() + "/raw"
                    : url.toString();
            } else {
                url = url.toString();
            }

            try {
                const response = await axios(url + "?timestamp=" + new Date());
                fs.writeFileSync(pluginPath, response.data);
                console.log("Downloaded plugin:", pluginName);
            } catch (e) {
                console.log("Failed to download plugin:", pluginName);
                console.log(e.message);
            }
        }
    }

    // Load all plugins
    const files = fs.readdirSync(pluginFolder);

    files.forEach((file) => {
        if (file.endsWith(".js")) {
            const filePath = path.join(pluginFolder, file);
            require(filePath);
        }
    });

    console.log("Plugins loaded.");
}

module.exports = {
    loadPlugins,
};
