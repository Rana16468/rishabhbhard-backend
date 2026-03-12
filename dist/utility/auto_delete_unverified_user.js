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
// auto_delete_unverified_user.ts
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = __importDefault(require("../module/user/user.model"));
const ApiError_1 = __importDefault(require("../app/error/ApiError"));
const catchError_1 = __importDefault(require("../app/error/catchError"));
const AUTO_DELETE_DAYS = 2; // ✅ 2 days
const auto_delete_unverified_user = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const thresholdTime = new Date(Date.now() - AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000 // 2 days in ms
        );
        const deleteResult = yield user_model_1.default.deleteMany({
            isVerify: false,
            createdAt: { $lt: thresholdTime },
        });
        if (!deleteResult) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Delete operation failed", "");
        }
        return {
            deletedCount: deleteResult.deletedCount || 0,
            message: deleteResult.deletedCount && deleteResult.deletedCount > 0
                ? "Unverified users deleted successfully (older than 2 days)"
                : "No unverified users found to delete",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error, "Cron job failed: auto_delete_unverified_user");
        return {
            deletedCount: 0,
            message: "Error occurred while deleting unverified users",
        };
    }
});
exports.default = auto_delete_unverified_user;
