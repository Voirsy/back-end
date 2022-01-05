const { Storage } = require("@google-cloud/storage");
const { CONFIG } = require('./config');

module.exports.STORAGE = new Storage({
    projectId: CONFIG.PROJECT_ID,
    credentials: {
        type: CONFIG.TYPE,
        project_id: CONFIG.PROJECT_ID,
        private_key_id: CONFIG.PRIVATE_KEY_ID,
        private_key: CONFIG.PRIVATE_KEY.replace(/\\n/gm, '\n'),
        client_email: CONFIG.CLIENT_EMAIL,
        client_id: CONFIG.CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-j0oi5%40zpi-files.iam.gserviceaccount.com"
    }
});

module.exports.BUCKET = () => {
    const storage = new Storage({
        projectId: CONFIG.PROJECT_ID,
        credentials: {
            type: CONFIG.TYPE,
            project_id: CONFIG.PROJECT_ID,
            private_key_id: CONFIG.PRIVATE_KEY_ID,
            private_key: CONFIG.PRIVATE_KEY.replace(/\\n/gm, '\n'),
            client_email: CONFIG.CLIENT_EMAIL,
            client_id: CONFIG.CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-j0oi5%40zpi-files.iam.gserviceaccount.com"
        }
    });

    return storage.bucket(CONFIG.BUCKET_URL);
}