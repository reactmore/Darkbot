const { buildReplyMarkup } = require("teleproto/client/buttons");
const { Button } = require("teleproto/tl/custom/button");
const { compressText } = require("../../lib/helpers");
class ButtonBuilder {
    constructor() {
        this.button = []
    }
    add(array) {
        this.button.push(array)
    }
    build() {
        return buildReplyMarkup(this.button)
    }
    inline(title, data) {
        return Button.inline(title, compressText(data))
    }

}
exports.ButtonBuilder = ButtonBuilder