"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const http_status_1 = __importDefault(require("http-status"));
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = __importDefault(require("../app/error/ApiError"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folderPath = "./src/public";
        if (file.mimetype.startsWith("image")) {
            folderPath = "./src/public/images";
        }
        else if (file.mimetype === "application/pdf") {
            folderPath = "./src/public/pdf";
        }
        else if (file.mimetype.startsWith("video")) {
            folderPath = "./src/public/videos";
        }
        else if (file.mimetype.startsWith("audio")) {
            folderPath = "./src/public/audios"; // ✅ Added for WAV/audio
        }
        else {
            cb(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only images, PDFs, videos, and audio files are allowed", ""), "./src/public");
            return;
        }
        // Ensure folder exists
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename(_req, file, cb) {
        const fileExt = path_1.default.extname(file.originalname);
        const fileName = `${file.originalname
            .replace(fileExt, "")
            .toLowerCase()
            .split(" ")
            .join("-")}-${(0, uuid_1.v4)()}`;
        cb(null, fileName + fileExt);
    },
});
// Multer limits
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 300 * 1024 * 1024, // 300 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/tiff",
            "image/svg+xml",
            "image/heic",
            "image/HEIC",
            "image/heif",
            "image/x-icon",
            "image/vnd.microsoft.icon",
            // ✅ Audio types added
            "audio/wav",
            "audio/x-wav",
            "audio/wave",
            "audio/x-pn-wav",
        ];
        // Allow images / pdf / audio
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        // Allow videos
        if (file.mimetype.startsWith("video")) {
            return cb(null, true);
        }
        // Allow other audio formats
        if (file.mimetype.startsWith("audio")) {
            return cb(null, true);
        }
        return cb(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only images, PDFs, videos, and audio files are allowed", ""));
    },
});
exports.default = upload;
