// chatBotServicesModified.ts

import httpStatus from "http-status";
import QueryBuilder from "../../app/builder/QueryBuilder";
import ApiError from "../../app/error/ApiError";
import {
  session,
  connectGemini,
  disconnectSession,
  saveConversationToDb,
  getCurrentTranscript,
  getCurrentExpression,
  resetTranscript,
} from "../../utility/Ai_Integation/AI_Integation";
import ChatHistoryModel from "./chatbot.model";
import catchError from "../../app/error/catchError";
import { Part } from "@google/genai";
import { partialUtil } from "zod/lib/helpers/partialUtil";
import { IChatHistory } from "./chatbot.interface";

/* ======================== INTERFACES ======================== */
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/* ======================== SESSION HELPERS ======================== */
async function sendTextMessageToSession(text: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const s: any = session;

  if (typeof s.sendClientContent !== "function")
    throw new Error("sendClientContent not found on session");

  await s.sendClientContent({
    turns: [{ role: "user", parts: [{ text }] }],
    turnComplete: true,
  });
}

async function sendAudioMessageToSession(audioData: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const s: any = session;

  if (typeof s.sendRealtimeInput !== "function")
    throw new Error("sendRealtimeInput not found on session");

  await s.sendRealtimeInput({
    mediaChunks: [{ mimeType: "audio/pcm", data: audioData }],
  });
}

/* ======================== WAIT FOR AI ======================== */
function waitForAiResponse(timeout = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/* ======================== TEXT CHAT ======================== */
export async function textToTextChatIntoDb(
  userId: string,
  text: string,
  history?: any[]
) {
  if (!text || !text.trim()) throw new Error("Text cannot be empty");

  try {
    const sessionId = Date.now().toString();

    if (!session) await connectGemini();

    resetTranscript();

    await sendTextMessageToSession(text);
    await waitForAiResponse();

    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    await saveConversationToDb(userId, text);

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0,
    };
  } catch (error) {
    console.error("textToTextChatIntoDb error:", error);
    throw error;
  }
}

/* ======================== AUDIO CHAT ======================== */
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
  if (!audioData || !audioData.trim())
    throw new Error("Audio data is required");

  try {
    const sessionId = Date.now().toString();

    if (!session) await connectGemini();

    resetTranscript();

    await sendAudioMessageToSession(audioData);
    await waitForAiResponse();

    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    await saveConversationToDb(userId, "User audio message");

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0,
    };
  } catch (error) {
    console.error("audioChatIntoDb error:", error);
    throw error;
  }
}

/* ======================== SESSION MANAGEMENT ======================== */
export async function startAudioSession(
  userId: string,
  userProfile?: UserProfile
) {
  try {
    return await connectGemini(userProfile);
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
    const qb = new QueryBuilder(ChatHistoryModel.find({ userId }), {})
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const history = await qb.modelQuery;
    const meta = await qb.countTotal();

    return { meta, history };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Error retrieving chat history for user ${userId}`,
      error
    );
  }
}

const deleteChatBotInfoInfoDb = async (userId: string, chatId: string) => {
  try {
    const result = await ChatHistoryModel.deleteOne({
      _id: chatId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Chat not found", "");
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


const chatDataStoreIntoDb=async(payload:Partial<IChatHistory>, userId:string)=>{


      try{

        const result=await ChatHistoryModel.create({...payload, userId});

         return result;

      }
      catch(error){
        catchError(error);
      }


    
}

/* ======================== EXPORT ======================== */
const chatBotServices = {
  startAudioSession,
  endAudioSession,
  textToTextChatIntoDb,
  audioChatIntoDb,
  getChatHistory,
  deleteChatBotInfoInfoDb,
  chatDataStoreIntoDb
};

export default chatBotServices;
