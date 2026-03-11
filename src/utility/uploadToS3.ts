import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import status from "http-status";
import config from "../app/config";
import ApiError from "../app/error/ApiError";

// Create S3 client
export const s3 = new S3Client({
  region: config.s3_bucket.aws_bucket_region,
  credentials: {
    accessKeyId: config.s3_bucket.aws_bucket_accesskey,
    secretAccessKey: config.s3_bucket.aws_bucket_secret_key,
  },
  ACL: "public-read",
} as any);

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = config.file_path || "uploads",
): Promise<string> => {
  if (!file || !file.path) {
    throw new ApiError(status.NOT_FOUND, "No file provided", "");
  }
  if (!fs.existsSync(file?.path?.replace(/\\/g, "/"))) {
    throw new Error("File not found on server");
  }

  folder = folder.replace(/^\/+|\/+$/g, "");

  const fileStream = fs.createReadStream(file?.path?.replace(/\\/g, "/"));
  const fileName = `${folder}/${Date.now()}-${file.originalname
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  const params = {
    Bucket: config.s3_bucket.aws_bucket_name,
    Key: fileName,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  try {

    await s3.send(new PutObjectCommand(params));

  
    fs.unlinkSync(file?.path?.replace(/\\/g, "/"));
    const url = `https://${config.s3_bucket.aws_bucket_name}.s3.${config.s3_bucket.aws_bucket_region}.amazonaws.com/${fileName}`;

    return url;
  } catch (error) {
    
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to upload file to S3",""
    );
  }
};
