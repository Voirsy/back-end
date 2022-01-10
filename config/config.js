module.exports.CONFIG = {
    DB_CONNECT: process.env.DB_CONNECT,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    PROJECT_ID: process.env.PROJECT_ID,
    KEY_FILENAME: process.env.KEY_FILENAME,
    BUCKET_URL: process.env.BUCKET_URL,
    PORT: process.env.PORT || 8080,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL,
    CLIENT_ID: process.env.CLIENT_ID,
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
    TYPE: process.env.TYPE,
    PRIVATE_KEY: process.env.PRIVATE_KEY
}