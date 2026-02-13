"use strict";

const zlib = require("zlib");

function compressText(text) {
    const original = Buffer.from(text);
    const compressed = zlib.deflateSync(original);
    return compressed.length < original.length ? compressed : original;
}

function decompressText(buffer) {
    try {
        return zlib.inflateSync(buffer).toString();
    } catch {
        return buffer.toString();
    }
}

module.exports = {
    compressText,
    decompressText,
};
