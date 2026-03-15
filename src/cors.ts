import cors from "cors";
import { Application } from "express";

export function setupCors(app: Application) {
  app.set("trust proxy", 1);

  const allowedOrigins =
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) || [];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {

      // Allow mobile apps / Postman
      if (!origin) return callback(null, true);

      // Allow all origins if *
      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],

    exposedHeaders: ["Set-Cookie", "Authorization"],

    maxAge: 86400,
  };

  app.options(/.*/, cors(corsOptions));
  app.use(cors(corsOptions));
};

