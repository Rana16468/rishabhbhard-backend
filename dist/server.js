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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("./app/error/ApiError"));
const connectSocket_1 = require("./socket/connectSocket");
let server;
// prevent listener leak warnings
require("events").EventEmitter.defaultMaxListeners = 20;
// ==============================
// Global graceful shutdown handlers
// ==============================
// Handle unexpected promise rejections
process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
    shutdownServer(1);
});
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    shutdownServer(1);
});
// Handle OS signals (Manual server stop) - PM2
process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    shutdownServer(0);
});
process.on("SIGINT", () => {
    console.log("SIGINT received");
    shutdownServer(0);
});
// ==============================
// Main Function
// ==============================
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.database_url);
            console.log("Database connected successfully");
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`🚀 Server running on http://${config_1.default.host}:${config_1.default.port}`);
            });
            // Initialize Socket only once
            (0, connectSocket_1.connectSocket)(server);
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Server unavailable", error);
        }
    });
}
// =================================
// Unified graceful shutdown function
// =================================
function shutdownServer(exitCode) {
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(exitCode);
        });
    }
    else {
        process.exit(exitCode);
    }
}
// ==============================
// Start server
// ==============================
main().then(() => {
    console.log("--- rishabhbhard-backend Server is running ---");
});
