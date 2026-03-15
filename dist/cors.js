"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCors = setupCors;
const cors_1 = __importDefault(require("cors"));
function setupCors(app) {
    var _a;
    app.set("trust proxy", 1);
    const allowedOrigins = ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",").map((o) => o.trim()).filter(Boolean)) || [];
    const corsOptions = {
        origin: (origin, callback) => {
            // Allow mobile apps / Postman
            if (!origin)
                return callback(null, true);
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
    app.options(/.*/, (0, cors_1.default)(corsOptions));
    app.use((0, cors_1.default)(corsOptions));
}
;
