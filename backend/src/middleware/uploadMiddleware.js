import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    const allowedExtensions = /jpeg|jpg|png|webp|pdf/;

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    const extensionMatch =
        allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    const mimeTypeMatch =
        allowedMimeTypes.includes(file.mimetype);

    if (extensionMatch && mimeTypeMatch) {
        callback(null, true);
    } else {
        callback(
            new AppError(
                "Only JPEG, PNG, WEBP and PDF are allowed.",
                400
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export default upload;