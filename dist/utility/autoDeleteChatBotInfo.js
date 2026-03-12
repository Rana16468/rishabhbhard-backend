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
const catchError_1 = __importDefault(require("../app/error/catchError"));
const chatbot_model_1 = __importDefault(require("../module/chatbot/chatbot.model"));
const autoDeleteChatBotInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Current time
        const currentTime = new Date();
        // 2 months threshold
        const timeThreshold = new Date(currentTime);
        timeThreshold.setMonth(timeThreshold.getMonth() - 2);
        // Delete chats older than 2 months
        const deleteResult = yield chatbot_model_1.default.deleteMany({
            createdAt: { $lt: timeThreshold },
        });
        console.log(`[CRON] Chatbot cleanup completed. Deleted: ${deleteResult.deletedCount}`);
        return {
            deletedCount: deleteResult.deletedCount,
            message: "Chats older than 2 months deleted successfully",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error, "[Cron] Error in chatbot auto delete job:");
    }
});
exports.default = autoDeleteChatBotInfo;
