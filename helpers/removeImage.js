const { getFilename } = require("./getFileName");
const { STORAGE } = require("../config/storage");
const { CONFIG } = require("../config/config");

module.exports.removeImages = async (images) => {
    try {
        await Promise.all([...images.map(image => STORAGE.bucket(CONFIG.BUCKET_URL).file(getFilename(image)).delete())]);
    } catch (e) {}
}