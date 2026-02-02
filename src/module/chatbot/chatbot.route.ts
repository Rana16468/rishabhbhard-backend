// chatbot.routes.ts

import express, { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import validationRequest from "../../middleware/validationRequest";
import chatbotValidation from "./chatbot.validation";
import chatBotController from "./chatbot.controller";

const router: Router = express.Router();

/**
 * @route   POST /api/v1/chat/text_to_text
 * @desc    Send text message to chatbot and get AI response
 * @access  Protected (User role required)
 * @param   {string} text - Text message
 * @param   {array} history - Optional conversation history
 * @returns {Object} AI response with metadata
 */
router.post(
  "/text_to_text",
  auth(USER_ROLE.user),
  validationRequest(chatbotValidation.chatbotValidationSchema),
  chatBotController.textToTextChat
);

/**
 * @route   GET /api/v1/chat/history
 * @desc    Get chat history for the current authenticated user
 * @access  Protected (User role required)
 * @query   {number} limit - Number of records (default: 50, max: 100)
 * @query   {number} page - Page number (default: 1)
 * @returns {Array} Chat history records
 */
router.get(
  "/history",
  auth(USER_ROLE.user),
  validationRequest(chatbotValidation.getChatHistoryValidationSchema),
  chatBotController.getChatHistory
);

/**
 * @route   POST /api/v1/chat/audio
 * @desc    Send audio message to Ami
 * @access  Protected (User role required)
 * @param   {string} audioData - Base64 encoded audio data
 * @param   {string} sessionId - Session ID
 * @returns {Object} AI response transcript
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

export const chatBotRoutes = router;
export default router;