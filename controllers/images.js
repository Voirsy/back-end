const { BUCKET } = require("../config/storage");

const bucket = BUCKET();

exports.uploadImages = async (req, res, next) => {
    try {
        let files = req.files;
        let filesToUpload = []
        if (files) {
            await Promise.all([...files.map(file => uploadFileToStorage(file))]).then((success) => {
                filesToUpload = success
            }).catch((error) => {
                console.error(error);
            });
        }
        req.filesToUpload = filesToUpload
        
        res.status(200).json({
            message: 'images successfully uploaded',
            links: filesToUpload
        })
    } catch (e) {
        next(e)
    }
}

const uploadFileToStorage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No image file');
        }

        console.log(file.fieldname)

        let newFileName = `${file.fieldname}_${file.originalname}_${Date.now()}`;

        let fileUpload = bucket.file(newFileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            reject('Something is wrong! Unable to upload at the moment.');
        });

        blobStream.on('finish', () => {
            const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
            resolve(url);
        });

        blobStream.end(file.buffer);
    });
}