const { CustomFile } = require("teleproto/client/uploads");
const fs = require("fs");

/**
 * @param {string} path
 * @param {"image"|"video"} type
 */
async function createUrlFile(path, type = "image") {
    return new CustomFile(
        type === "image" ? "file.png" : "file.mp4",
        fs.statSync(path).size,
        path
    );
}

/**
 * @param {Buffer} buffer
 * @param {"image"|"video"} type
 */
async function createBufferFile(buffer, type = "image") {
    return new CustomFile(
        type === "image" ? "file.png" : "file.mp4",
        buffer.length,
        "",
        buffer
    );
}

module.exports = {
    createUrlFile,
    createBufferFile,
};
