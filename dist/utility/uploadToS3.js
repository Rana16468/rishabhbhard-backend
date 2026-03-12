"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = exports.s3 = void 0;
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../app/config"));
const ApiError_1 = __importDefault(require("../app/error/ApiError"));
// Create S3 client
exports.s3 = new client_s3_1.S3Client({
    region: config_1.default.s3_bucket.aws_bucket_region,
    credentials: {
        accessKeyId: config_1.default.s3_bucket.aws_bucket_accesskey,
        secretAccessKey: config_1.default.s3_bucket.aws_bucket_secret_key,
    },
    ACL: "public-read",
});
const uploadToS3 = (file_1, ...args_1) => __awaiter(void 0, [file_1, ...args_1], void 0, function* (file, folder = config_1.default.file_path || "uploads") {
    var _a, _b, _c;
    if (!file || !file.path) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No file provided", "");
    }
    if (!fs_1.default.existsSync((_a = file === null || file === void 0 ? void 0 : file.path) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "/"))) {
        throw new Error("File not found on server");
    }
    folder = folder.replace(/^\/+|\/+$/g, "");
    const fileStream = fs_1.default.createReadStream((_b = file === null || file === void 0 ? void 0 : file.path) === null || _b === void 0 ? void 0 : _b.replace(/\\/g, "/"));
    const fileName = `${folder}/${Date.now()}-${file.originalname
        .replace(/\s+/g, "-")
        .toLowerCase()}`;
    const params = {
        Bucket: config_1.default.s3_bucket.aws_bucket_name,
        Key: fileName,
        Body: fileStream,
        ContentType: file.mimetype,
    };
    try {
        yield exports.s3.send(new client_s3_1.PutObjectCommand(params));
        fs_1.default.unlinkSync((_c = file === null || file === void 0 ? void 0 : file.path) === null || _c === void 0 ? void 0 : _c.replace(/\\/g, "/"));
        const url = `https://${config_1.default.s3_bucket.aws_bucket_name}.s3.${config_1.default.s3_bucket.aws_bucket_region}.amazonaws.com/${fileName}`;
        return url;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to upload file to S3", "");
    }
});
exports.uploadToS3 = uploadToS3;
