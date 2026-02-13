/**
 * @typedef {import('../lib/message/Message')} MessageType
 */

/**
 * @typedef {Object} ModuleType
 * @property {string} [pattern]
 * @property {boolean} [fromMe]
 * @property {string} [on]
 * @property {(m: MessageType, match?: string[]) => Promise<void>} callback
 */

/** @type {ModuleType[]} */
const modules = [];

/**
 * @param {Omit<ModuleType, "callback">} moduleConfig
 * @param {(m: MessageType, match?: string[]) => Promise<void>} callback
 */
function Module(moduleConfig, callback) {
    modules.push({ ...moduleConfig, callback });
}

module.exports = {
    Module,
    modules,
};
