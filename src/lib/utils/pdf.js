"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");

async function createPdf(arr, path, sendPath = false, isLarge = false) {
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(path);
    doc.pipe(stream);

    try {
        for (let imagePath of arr) {
            await processImage(imagePath, doc, isLarge);
        }
    } catch (error) {
        doc.end();
        stream.end();
        await fs.promises.unlink(path).catch(() => { });
        throw error;
    }

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on("finish", async () => {
            try {
                if (sendPath) return resolve(path);
                const buffer = await fs.promises.readFile(path);
                await fs.promises.unlink(path);
                resolve(buffer);
            } catch (error) {
                reject(error);
            }
        });

        stream.on("error", reject);
    });
}

async function processImage(imagePath, doc, isLarge) {
    const newPath = imagePath + ".jpeg";
    let finalPath, metadata;

    if (isLarge) {
        finalPath = newPath;
        metadata = await sharp(imagePath)
            .toFormat("jpeg", { quality: 80, mozjpeg: true })
            .toFile(newPath);
    } else {
        finalPath = imagePath;
        metadata = await sharp(imagePath).metadata();
    }

    doc.addPage({ size: [metadata.width, metadata.height] });
    doc.image(finalPath, 0, 0);

    if (isLarge) {
        await fs.promises.unlink(newPath).catch(() => { });
    }
}

module.exports = { createPdf };
