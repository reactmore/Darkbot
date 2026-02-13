"use strict";

class Mutex {
    constructor() {
        this.locked = false;
        this.waiting = [];
    }

    async acquire() {
        while (this.locked) {
            await new Promise((resolve) => this.waiting.push(resolve));
        }
        this.locked = true;
    }

    release() {
        if (this.waiting.length > 0) {
            this.waiting.shift()();
        } else {
            this.locked = false;
        }
    }
}

class Semaphore {
    constructor(count) {
        this.count = count;
        this.waiting = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
            return;
        }

        await new Promise((resolve) => this.waiting.push(resolve));
        this.count--;
    }

    release() {
        this.count++;
        if (this.waiting.length > 0) {
            this.waiting.shift()();
        }
    }
}

module.exports = {
    Mutex,
    Semaphore,
};
