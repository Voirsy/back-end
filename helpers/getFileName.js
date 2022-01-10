const path = require("path");

module.exports.getFilename = (link) => {
    const url = new URL(link);
    return path.basename(url.pathname);
}