const PDFDocument = require("pdfkit");
const fs = require("fs");
const axios = require("axios");
const zlib = require("zlib");

const htmlFormatter = {
  bold: (text) => `<b>${text}</b>`,
  italic: (text) => `<i>${text}</i>`,
  underline: (text) => `<u>${text}</u>`,
  strike: (text) => `<s>${text}</s>`,
  link: (text, url) => `<a href="${url}">${text}</a>`,
  br: () => `<br/>`,
  hr: () => `<hr/>`,
  code: (text) => `<code>${text}</code>`,
  pre: (text) => `<pre>${text}</pre>`,
  blockquote: (text) => `<blockquote>${text}</blockquote>`,
};

async function createPdf(arr, path,sendPath=false) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false });

    for (let i of arr) {
      try {
        const image = doc.openImage(i);
        doc.addPage({ size: [image.width, image.height] });
        doc.image(image, 0, 0);
      } catch (error) {
        console.log(error);
      }
    }

    const stream = fs.createWriteStream(path);

    doc.pipe(stream);

    stream.on("finish", async () => {
      try {
        if(sendPath) return resolve(path)
        let buffer = await fs.promises.readFile(path);
        await fs.promises.unlink(path);
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", (error) => {
      reject(error);
    });

    doc.end();
  });
}

function dl(text,path = false) {
  retries = 5
  return new Promise((resolve, reject) => {
    const downloadWithRetries = async (retryCount) => {
      try {
        const response = await axios({
          method: "get",
          url: text,
          responseType: "arraybuffer",
          timeout: 60000,
        });

        if (response.data instanceof Buffer) {
          if(path){
            fs.writeFileSync(path, response.data)
            resolve(path)
            return
          }
          resolve(response.data);
        } else {
          const buffer = Buffer.from(response.data);
          if(path){
            fs.writeFileSync(path, buffer)
            resolve(path)
            return
          }
          resolve(buffer);
        }
      } catch (error) {
        console.error(`Error downloading: ${text}`);
        if (retryCount > 0) {
          console.log(`Retrying... (attempts left: ${retryCount})`);
          await new Promise((r) => setTimeout(r, 1000));
          await downloadWithRetries(retryCount - 1);
        } else {
          console.error("Exceeded maximum retries. Giving up.");
          reject(error);
        }
      }
    };

    downloadWithRetries(retries);
  });
}

function compressText(text) {
  const originalBuffer = Buffer.from(text);
  const compressedBuffer = zlib.deflateSync(originalBuffer);
  if (compressedBuffer.length < originalBuffer.length) {
    return compressedBuffer;
  }
  return originalBuffer;
}

function decompressText(buffer) {
  try {
    const decompressedBuffer = zlib.inflateSync(buffer);
    return decompressedBuffer.toString();
  } catch (error) {
    return buffer.toString();
  }
}

class Mutex {
  constructor() {
    this.locked = false;
    this.waitingList = [];
  }

  async acquire() {
    while (this.locked) {
      await new Promise((resolve) => this.waitingList.push(resolve));
    }
    this.locked = true;
  }

  release() {
    if (this.waitingList.length > 0) {
      const resolve = this.waitingList.shift();
      resolve();
    } else {
      this.locked = false;
    }
  }
}

class Semaphore {
  constructor(initialCount) {
    this.count = initialCount;
    this.waitingList = [];
    this.lock = new Mutex();
    this.positionChangeCallbacks = []; // Map to store callbacks for each waiting task
  }

  async acquire(callback) {
    await this.lock.acquire();
    if (this.count > 0) {
      this.count--;
      this.lock.release();
    } else {
      const position = this.waitingList.length + 1;
      const promise = new Promise((resolve) => {
        this.waitingList.push({ resolve, position });
      });
      if (typeof callback === "function") {
        callback(position);
        this.positionChangeCallbacks.push({ position, callback });
      }
      this.lock.release();
      await promise;
    }
  }

  release() {
    this.count++;
    if (this.waitingList.length > 0) {
      const { resolve, position } = this.waitingList.shift();
      for (let i of this.positionChangeCallbacks) {
        i.position--;
        if (i.position <= 0) {
          this.positionChangeCallbacks.shift();
          continue;
        }
        i.callback(i.position);
      }
      resolve();
    }
  }

  getCurrentWaitingList() {
    return this.waitingList.map(({ position, resolve }) => ({
      position,
      resolve,
    }));
  }
}

module.exports = {
  htmlFormatter,
  createPdf,
  dl,
  compressText,
  decompressText,
  Semaphore,
};
