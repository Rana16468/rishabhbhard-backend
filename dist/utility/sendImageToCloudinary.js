"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.sendFileToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../app/config"));
const multer_1 = __importDefault(require("multer"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.uplode_file_cloudinary.cloudinary_cloud_name,
    api_key: config_1.default.uplode_file_cloudinary.cloudinary_api_key,
    api_secret: config_1.default.uplode_file_cloudinary.cloudinary_api_secret,
});
const sendFileToCloudinary = (fileName, filePath) => {
    return new Promise((resolve, reject) => {
        const ext = path_1.default.extname(filePath).toLowerCase();
        let resourceType = "raw";
        if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
            resourceType = "image";
        }
        else if ([".mp4", ".mov", ".avi"].includes(ext)) {
            resourceType = "video";
        }
        cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: "user-files",
            public_id: fileName,
        }, (error, result) => {
            fs_1.default.unlink(filePath, () => { });
            if (error)
                return reject(error);
            resolve(result);
        });
    });
};
exports.sendFileToCloudinary = sendFileToCloudinary;
// multer ---image uploding process
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/src/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
exports.upload = (0, multer_1.default)({ storage: storage });
