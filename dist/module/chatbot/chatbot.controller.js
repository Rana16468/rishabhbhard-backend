"use strict";
// chatbot.controller.ts
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
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utility/catchAsync"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const chatbot_services_1 = __importDefault(require("./chatbot.services"));
/**
 * Handle text to text chat requests
 * POST /api/v1/chat/text_to_text
 */
const textToTextChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { text, history } = req.body;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "guest";
    // Validate input
    if (!text || typeof text !== "string" || text.trim() === "") {
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Text is required and must be a non-empty string",
            data: null,
        });
        return;
    }
    try {
        const result = yield chatbot_services_1.default.textToTextChatIntoDb(userId, text.trim(), history);
        // Directly return the AI JSON output
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Chat response generated successfully",
            data: result, // result already has {message, expression, sessionId, timestamp, historyCount}
        });
    }
    catch (error) {
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
            success: false,
            message: error instanceof Error ? error.message : "Error generating chat response",
            data: null,
        });
    }
}));
/**
 * Get chat history for authenticated user
 * GET /api/v1/chat/history
 */
const getChatHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "guest";
    if (!userId) {
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "User ID is required",
            data: null,
        });
        return;
    }
    try {
        const result = yield chatbot_services_1.default.getChatHistory(userId);
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Chat history retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        (0, sendRespone_1.default)(res, {
            statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error retrieving chat history",
            data: null,
        });
    }
}));
const deleteChatBotInfoInfo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.deleteChatBotInfoInfoDb(req.user.id, req.params.id);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully delete",
        data: result,
    });
}));
const chatDataStore = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.chatDataStoreIntoDb(req.body, req.user.id);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully recorded",
        data: result,
    });
}));
const conversationMemoryRecorded = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.conversationMemoryRecordedIntoDb(req, req.user.id);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "successfully recorded",
        data: result,
    });
}));
const findMyAllConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.findMyAllConversationIntoDb(req.user.id, req.query);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully Find My Conversation",
        data: result,
    });
}));
const findAllConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.findAllConversationIntoDb(req.query, req.params.userId);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully Find All Conversation",
        data: result,
    });
}));
const deleteConversationMemory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.deleteConversationMemoryFromDb(req.params.id);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully delete",
        data: result,
    });
}));
const getConversationGrowth = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatbot_services_1.default.getConversationGrowthIntoDb(req.query);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully get conversation growth",
        data: result,
    });
}));
const chatBotController = {
    textToTextChat,
    getChatHistory,
    deleteChatBotInfoInfo,
    chatDataStore,
    conversationMemoryRecorded,
    findMyAllConversation,
    findAllConversation,
    deleteConversationMemory,
    getConversationGrowth
};
exports.default = chatBotController;
