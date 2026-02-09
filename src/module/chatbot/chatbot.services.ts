// chatBotServicesModified.ts

import httpStatus from "http-status";
import QueryBuilder from "../../app/builder/QueryBuilder";
import ApiError from "../../app/error/ApiError";
import {
  session,
  connectGemini,
  disconnectSession,
  getCurrentTranscript,
  handleTurn,
  resetTranscript,
  saveConversationToDb,
  getCurrentExpression,
} from "../../utility/Ai_Integation/AI_Integation";
import ChatHistoryModel from "./chatbot.model";
import catchError from "../../app/error/catchError";

/* ======================== INTERFACES ======================== */
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

interface SendMessageResult {
  transcript: string;
  expression: string;
}

/* ======================== SESSION HELPERS ======================== */
async function sendTextMessageToSession(text: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const sessionObj = session as any;

  if (typeof sessionObj.sendClientContent !== "function")
    throw new Error("sendClientContent method not found on session");

  await sessionObj.sendClientContent({
    turns: [
      { role: "user", parts: [{ text }] }
    ],
    turnComplete: true,
  });
}

async function sendAudioMessageToSession(audioData: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const sessionObj = session as any;

  if (typeof sessionObj.sendRealtimeInput !== "function")
    throw new Error("sendRealtimeInput method not found on session");

  await sessionObj.sendRealtimeInput({
    mediaChunks: [
      { mimeType: "audio/pcm", data: audioData }
    ]
  });
}

/* ======================== CHAT FUNCTIONS ======================== */

/**
 * Text chat -> always returns structured JSON
 */
export async function textToTextChatIntoDb(
  userId: string,
  text: string,
  history?: any[]
) {
  if (!text || text.trim().length === 0)
    throw new Error("Text cannot be empty");

  try {
    const sessionId = new Date().getTime().toString();

    if (!session) {
      await connectGemini();
    }

    resetTranscript();

    // Send message to AI
    await sendTextMessageToSession(text);

    // Wait for response
    await handleTurn();
    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    // Save to DB
    try {
      await saveConversationToDb(userId, text, JSON.stringify({
        aiResponse: transcript,
        expression,
        questionCategory: "general",
        conversationTopic: "general"
      }));
    } catch (dbError) {
      console.error("Failed to save chat to DB:", dbError);
    }

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0
    };

  } catch (error) {
    console.error("Error in textToTextChatIntoDb:", error);
    throw error;
  }
}

/**
 * Audio chat -> always returns structured JSON
 */
export async function audioChatIntoDb(
  userId: string,
  audioData: string,
  history?: any[]
): Promise<{
  success: true;
  message: string;
  expression: string;
  sessionId: string;
  timestamp: string;
  historyCount: number;
}> {
  if (!audioData || audioData.trim().length === 0)
    throw new Error("Audio data is required");

  try {
    const sessionId = new Date().getTime().toString();

    if (!session) await connectGemini();

    resetTranscript();

    // Send audio to AI
    await sendAudioMessageToSession(audioData);

    // Wait for response
    await handleTurn();
    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    // Save to DB
    try {
      await saveConversationToDb(userId, "User audio message", JSON.stringify({
        aiResponse: transcript,
        expression,
        questionCategory: "general",
        conversationTopic: "general"
      }));
    } catch (dbError) {
      console.error("Failed to save audio chat to DB:", dbError);
    }

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0
    };
  } catch (error) {
    console.error("Error in audioChatIntoDb:", error);
    throw error;
  }
}

/* ======================== SESSION MANAGEMENT ======================== */
export async function startAudioSession(
  userId: string,
  userProfile?: UserProfile
): Promise<any> {
  try {
    const audioSession = await connectGemini(userProfile);
    return audioSession;
  } catch (error) {
    console.error("Failed to start session:", error);
    throw error;
  }
}

export async function endAudioSession(): Promise<void> {
  try {
    await disconnectSession();
  } catch (error) {
    console.error("Error ending session:", error);
  }
}

/* ======================== CHAT HISTORY ======================== */
export async function getChatHistory(userId: string) {
  try {
    const allHistoryQuery = new QueryBuilder(ChatHistoryModel.find({ userId }), {})
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const history = await allHistoryQuery.modelQuery;
    const meta = await allHistoryQuery.countTotal();

    return { meta, history };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Error retrieving chat history for user ${userId}`,
      error
    );
  }
};

const deleteChatBotInfoInfoDb = async (userId: string, chatId: string) => {
  try {
    const result = await ChatHistoryModel.deleteOne({
      _id: chatId,
      userId: userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Chat not found or already deleted",
        ""
      );
    }

    return {
      status: true,
      message: "Chat deleted successfully",
    };
  } catch (error) {
    catchError(error);
    throw error; 
  }
};


/* ======================== EXPORT ======================== */
const chatBotServices = {
  startAudioSession,
  endAudioSession,
  textToTextChatIntoDb,
  audioChatIntoDb,
  getChatHistory,
 deleteChatBotInfoInfoDb 
};

export default chatBotServices;
