"use strict";
// chatbot.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBotRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constant_1 = require("../user/user.constant");
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const chatbot_validation_1 = __importDefault(require("./chatbot.validation"));
const chatbot_controller_1 = __importDefault(require("./chatbot.controller"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const uplodeFile_1 = __importDefault(require("../../utility/uplodeFile"));
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/chat/text_to_text
 * @desc    Send text message to chatbot and get AI response
 * @access  Protected (User role required)
 * @param   {string} text - Text message
 * @param   {array} history - Optional conversation history
 * @returns {Object} AI response with metadata
 */
router.post("/text_to_text", (0, auth_1.default)(user_constant_1.USER_ROLE.user), (0, validationRequest_1.default)(chatbot_validation_1.default.chatbotValidationSchema), chatbot_controller_1.default.textToTextChat);
/**
 * @route   GET /api/v1/chat/history
 * @desc    Get chat history for the current authenticated user
 * @access  Protected (User role required)
 * @query   {number} limit - Number of records (default: 50, max: 100)
 * @query   {number} page - Page number (default: 1)
 * @returns {Array} Chat history records
 */
router.get("/history", (0, auth_1.default)(user_constant_1.USER_ROLE.user), chatbot_controller_1.default.getChatHistory);
/**
 * @route
 * @desc
 * @access
 * @param   {string} audioData
 * @param   {string} sessionId
 * @returns {Object}
 */
// Uncomment when audio endpoint is implemented
// router.post(
//   "/audio",
//   auth(USER_ROLE.user),
//   validationRequest(chatbotValidation.audioMessageValidationSchema),
//   chatBotController.sendAudioMessage
// );
/**
 * @route   POST /api/v1/chat/session/start
 * @desc    Start a new audio session with Ami
 * @access  Protected (User role required)
 * @param   {Object} userProfile - Optional user profile for personalization
 * @returns {Object} Session information
 */
// Uncomment when session endpoint is implemented
// router.post(
//   "/session/start",
//   auth(USER_ROLE.user),
//   validationRequest(chatbotValidation.startAudioSessionValidationSchema),
//   chatBotController.startSession
// );
/**
 * @route   POST /api/v1/chat/session/end
 * @desc    End the active audio session
 * @access  Protected (User role required)
 * @returns {Object} Success message
 */
// Uncomment when session endpoint is implemented
// router.post(
//   "/session/end",
//   auth(USER_ROLE.user),
//   chatBotController.endSession
// );
/* delete chat  */
router.delete("/delete_specific_chatbot/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), chatbot_controller_1.default.deleteChatBotInfoInfo);
router.post("/store_chat_data", (0, auth_1.default)(user_constant_1.USER_ROLE.user), (0, validationRequest_1.default)(chatbot_validation_1.default.ChatHistoryZodSchema), chatbot_controller_1.default.chatDataStore);
router.post("/conversation_memory_recorded", uplodeFile_1.default.single("file"), (req, res, next) => {
    try {
        if (req.body.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JSON data", ""));
    }
}, (0, auth_1.default)(user_constant_1.USER_ROLE.user), (0, validationRequest_1.default)(chatbot_validation_1.default.ConversationMemoryZodSchema), chatbot_controller_1.default.conversationMemoryRecorded);
router.get("/find_my_all_conversation", (0, auth_1.default)(user_constant_1.USER_ROLE.user), chatbot_controller_1.default.findMyAllConversation);
router.get("/find_all_conversation/:userId", (0, auth_1.default)(user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), chatbot_controller_1.default.findAllConversation);
router.delete("/delete_conversation_memory/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), chatbot_controller_1.default.deleteConversationMemory);
router.get("/conversation_growth", (0, auth_1.default)(user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), chatbot_controller_1.default.getConversationGrowth);
router.get("/find_by_all_conversation_zip/:userId", (0, auth_1.default)(user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), chatbot_controller_1.default.findAllConversationZip);
exports.chatBotRoutes = router;
exports.default = router;
