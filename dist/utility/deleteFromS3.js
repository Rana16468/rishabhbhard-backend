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
exports.deleteFromS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uploadToS3_1 = require("./uploadToS3");
const config_1 = __importDefault(require("../app/config"));
const deleteFromS3 = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!fileUrl)
            return false;
        // Extract S3 key from URL
        const bucketName = config_1.default.s3_bucket.aws_bucket_name;
        const region = config_1.default.s3_bucket.aws_bucket_region;
        // URL format:
        // https://bucket-name.s3.region.amazonaws.com/folder/filename.jpg
        const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
        const key = fileUrl.replace(prefix, "");
        if (!key)
            return false;
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        yield uploadToS3_1.s3.send(new client_s3_1.DeleteObjectCommand(params));
        return true;
    }
    catch (err) {
        console.error("S3 Delete Error:", err);
        return false;
    }
});
exports.deleteFromS3 = deleteFromS3;
