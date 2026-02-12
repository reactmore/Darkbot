"use strict";

const axios = require("axios");
const fs = require("fs");

async function dl(url, path = false, options) {
    const retries = 5;
    const retryDelay = 1000;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                method: "get",
                url,
                responseType: "stream",
                timeout: 60000,
                ...options,
            });

            if (path) {
                return new Promise((resolve, reject) => {
                    const writer = fs.createWriteStream(path);
                    response.data.pipe(writer);
                    writer.on("finish", () => resolve(path));
                    writer.on("error", reject);
                });
            }

            return new Promise((resolve, reject) => {
                const chunks = [];
                response.data.on("data", (chunk) => chunks.push(chunk));
                response.data.on("end", () =>
                    resolve(Buffer.concat(chunks))
                );
                response.data.on("error", reject);
            });
        } catch (error) {
            if (i < retries - 1) {
                await new Promise((r) => setTimeout(r, retryDelay));
            } else {
                throw error;
            }
        }
    }
}

module.exports = { dl };
