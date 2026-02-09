// chatbot.controller.ts

import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utility/catchAsync";
import sendRespone from "../../utility/sendRespone";
import chatBotServices from "./chatbot.services";

/**
 * Handle text to text chat requests
 * POST /api/v1/chat/text_to_text
 */
const textToTextChat: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { text, history } = req.body;
    const userId = req.user?.id || "guest";

    // Validate input
    if (!text || typeof text !== "string" || text.trim() === "") {
      sendRespone(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Text is required and must be a non-empty string",
        data: null,
      });
      return;
    }

    try {
      const result = await chatBotServices.textToTextChatIntoDb(userId, text.trim(), history);

      // Directly return the AI JSON output
      sendRespone(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Chat response generated successfully",
        data: result, // result already has {message, expression, sessionId, timestamp, historyCount}
      });
    } catch (error) {
      sendRespone(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message:
          error instanceof Error ? error.message : "Error generating chat response",
        data: null,
      });
    }
  }
);

/**
 * Get chat history for authenticated user
 * GET /api/v1/chat/history
 */
const getChatHistory: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id || "guest";

    if (!userId) {
      sendRespone(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "User ID is required",
        data: null,
      });
      return;
    }

    try {
      const result = await chatBotServices.getChatHistory(userId);

      sendRespone(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Chat history retrieved successfully",
        data: result,
      });
    } catch (error) {
      sendRespone(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error retrieving chat history",
        data: null,
      });
    }
  }
);

const chatBotController = {
  textToTextChat,
  getChatHistory,
};

export default chatBotController;
