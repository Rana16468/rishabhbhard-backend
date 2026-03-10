import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import status from "http-status";
import fs from "fs";
import ApiError from "../app/error/ApiError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath = "./src/public";

    if (file.mimetype.startsWith("image")) {
      folderPath = "./src/public/images";
    } else if (file.mimetype === "application/pdf") {
      folderPath = "./src/public/pdf";
    } else if (file.mimetype.startsWith("video")) {
      folderPath = "./src/public/videos";
    } else if (file.mimetype.startsWith("audio")) {
      folderPath = "./src/public/audios";   // ✅ Added for WAV/audio
    } else {
      cb(
        new ApiError(
          status.BAD_REQUEST,
          "Only images, PDFs, videos, and audio files are allowed",
          ""
        ),
        "./src/public"
      );
      return;
    }

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename(_req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${file.originalname
      .replace(fileExt, "")
      .toLowerCase()
      .split(" ")
      .join("-")}-${uuidv4()}`;

    cb(null, fileName + fileExt);
  },
});

// Multer limits
const upload = multer({
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

    return cb(
      new ApiError(
        status.BAD_REQUEST,
        "Only images, PDFs, videos, and audio files are allowed",
        ""
      )
    );
  },
});

export default upload;