"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    send_email: {
        nodemailer_email: process.env.NODEMAILER_EMAIL,
        nodemailer_password: process.env.NODEMAILER_PASSWORD,
    },
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    expires_in: process.env.EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.REFRESH_EXPIRES_IN,
    host: process.env.HOST,
    file_path: process.env.FILE_PATH,
    uplode_file_cloudinary: {
        cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    gemini_api_key: process.env.GEMINI_API_KEY,
    s3_bucket: {
        aws_bucket_accesskey: process.env.AWS_BUCKET_ACCESS_KEY,
        aws_bucket_secret_key: process.env.AWS_BUCKET_SECRET_KEY,
        aws_bucket_region: process.env.AWS_BUCKET_REGION,
        aws_bucket_name: process.env.AWS_BUCKET_NAME,
    },
};
