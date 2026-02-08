// chatbot.services.ts - CORRECTLY FIXED WITH ACTUAL API METHODS

import httpStatus from "http-status";
import QueryBuilder from "../../app/builder/QueryBuilder";
import ApiError from "../../app/error/ApiError";
import { session, connectGemini,
  disconnectSession,
  getCurrentTranscript,
  handleTurn,
  resetTranscript,
  saveConversationToDb, } from "../../utility/Ai_Integation/AI_Integation";
import ChatHistoryModel from "./chatbot.model";



/* ======================== EXTENDED INTERFACES ======================== */

/**
 * User Profile for Ami personalization
 */
interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/**
 * Response from sending a message
 */
interface SendMessageResult {
  turn: any[];
  transcript: string;
}

/**
 * Extended Session interface with actual method names
 * Based on actual Google GenAI SDK available methods:
 * - sendClientContent()
 * - sendRealtimeInput()
 * - sendToolResponse()
 * - close()
 */
interface ExtendedSession {
  sendClientContent(params: {
    turns: Array<{
      role: "user" | "model";
      parts: Array<{
        text?: string;
      }>;
    }>;
    turnComplete: boolean;
  }): Promise<void>;

  sendRealtimeInput(params: {
    mediaChunks: Array<{
      mimeType: string;
      data: string;
    }>;
  }): Promise<void>;

  sendToolResponse(params: any): Promise<void>;
  close(): Promise<void>;
}

/* ======================== SESSION MESSAGE HELPER ======================== */

/**
 * Type-safe helper function to send text messages to the session
 * Uses the correct sendClientContent() method
 */
async function sendTextMessageToSession(
  text: string
): Promise<void> {
  if (!session) {
    throw new Error("No active session. Please connect first.");
  }

  try {
    const sessionObj = session as any;

    // Use the correct method: sendClientContent()
    if (typeof sessionObj.sendClientContent === "function") {
      await sessionObj.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });
    } else {
      throw new Error(
        "sendClientContent method not found on session object"
      );
    }
  } catch (error) {
    console.error("Error sending text message to session:", error);
    throw error;
  }
}

/**
 * Type-safe helper function to send audio messages to the session
 * Uses the correct sendRealtimeInput() method
 */
async function sendAudioMessageToSession(
  audioData: string
): Promise<void> {
  if (!session) {
    throw new Error("No active session. Please connect first.");
  }

  try {
    const sessionObj = session as any;

    // Use the correct method: sendRealtimeInput()
    if (typeof sessionObj.sendRealtimeInput === "function") {
      await sessionObj.sendRealtimeInput({
        mediaChunks: [
          {
            mimeType: "audio/pcm",
            data: audioData,
          },
        ],
      });
    } else {
      throw new Error(
        "sendRealtimeInput method not found on session object"
      );
    }
  } catch (error) {
    console.error("Error sending audio message to session:", error);
    throw error;
  }
}

/* ======================== AUDIO SESSION FUNCTIONS ======================== */

/**
 * Start an audio session with Ami
 * @param userId - User ID
 * @param userProfile - Optional user profile for personalization
 * @returns Session object
 * @throws Error if session cannot be established
 */
async function startAudioSession(
  userId: string,
  userProfile?: UserProfile
): Promise<any> {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Valid user ID is required");
  }

  try {
    const audioSession = await connectGemini(userProfile);

    if (!audioSession) {
      throw new Error("Failed to establish audio session");
    }

    console.log(`✓ Audio session started for user ${userId}`);
    return audioSession;
  } catch (error) {
    console.error(`✗ Failed to start audio session for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Send audio message to Ami
 * @param userId - User ID
 * @param audioData - Base64 encoded audio data
 * @param sessionId - Session ID
 * @returns Response with transcript and turn data
 * @throws Error if parameters invalid or session not active
 */
async function sendAudioMessage(
  userId: string,
  audioData: string,
  sessionId: string
): Promise<SendMessageResult> {
  // Validate inputs
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Valid user ID is required");
  }

  if (!audioData || typeof audioData !== "string" || audioData.trim() === "") {
    throw new Error("Valid audio data is required");
  }

  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new Error("Valid session ID is required");
  }

  if (!session) {
    throw new Error("No active session. Please connect first.");
  }

  try {
    resetTranscript();

    console.log("📤 Sending audio message to Ami...");

    // Use the correct method: sendRealtimeInput()
    await sendAudioMessageToSession(audioData);

    // Wait for response
    const turn = await handleTurn();
    const aiResponse = getCurrentTranscript();

    if (!aiResponse || aiResponse.trim() === "") {
      console.warn("⚠️ Ami did not respond with any text");
    } else {
      console.log(`✓ Ami responded: ${aiResponse}`);
    }

    // Save to database
    try {
      await saveConversationToDb(
        userId,
        "User audio message",
        aiResponse 
    
       
      );
      console.log("✓ Audio message saved to database");
    } catch (dbError) {
      console.error("⚠️ Failed to save audio message to database:", dbError);
      // Don't throw - still return the response even if DB save fails
    }

    return {
      turn,
      transcript: aiResponse,
    };
  } catch (error) {
    console.error("✗ Error sending audio message:", error);
    throw error;
  }
}

/* ======================== TEXT MESSAGE FUNCTIONS ======================== */

/**
 * Send text message to Ami
 * @param userId - User ID
 * @param text - User text message
 * @param sessionId - Session ID
 * @returns Response with transcript and turn data
 * @throws Error if parameters invalid or session not active
 */
async function sendTextMessage(
  userId: string,
  text: string,
  sessionId: string
): Promise<SendMessageResult> {
  // Validate inputs
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Valid user ID is required");
  }

  if (!text || typeof text !== "string") {
    throw new Error("Text message is required and must be a string");
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    throw new Error("Text message cannot be empty");
  }

  if (trimmedText.length > 5000) {
    throw new Error("Text message cannot exceed 5000 characters");
  }

  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new Error("Valid session ID is required");
  }

  if (!session) {
    throw new Error("No active session. Please connect first.");
  }

  try {
    resetTranscript();

    console.log(`📤 Sending text message to Ami: "${trimmedText}"`);

    // Use the correct method: sendClientContent()
    await sendTextMessageToSession(trimmedText);

    // Wait for response
    const turn = await handleTurn();
    const aiResponse = getCurrentTranscript();

    if (!aiResponse || aiResponse.trim() === "") {
      console.warn("⚠️ Ami did not respond with any text");
    } else {
      console.log(`✓ Ami responded: ${aiResponse}`);
    }

    // Save to database
    try {
      await saveConversationToDb(
        userId,
        trimmedText,
        aiResponse || "(No response)"
      
      );
      console.log("✓ Text message saved to database");
    } catch (dbError) {
      console.error("⚠️ Failed to save message to database:", dbError);
      // Don't throw - still return the response even if DB save fails
    }

    return {
      turn,
      transcript: aiResponse,
    };
  } catch (error) {
    console.error("✗ Error sending text message:", error);
    throw error;
  }
}

/* ======================== SESSION MANAGEMENT ======================== */

/**
 * End the audio session
 * @throws Error if disconnection fails
 */
async function endAudioSession(): Promise<void> {
  try {
    await disconnectSession();
    console.log("✓ Audio session ended gracefully");
  } catch (error) {
    console.error("✗ Error ending audio session:", error);
    throw error;
  }
}

/* ======================== EXAMPLE FLOW ======================== */

/**
 * Complete example flow demonstrating the chatbot functionality
 */
async function exampleFlow(): Promise<void> {
  const userId = "user123";
  const sessionId = new Date().getTime().toString();

  try {
    // 1. Define user profile
    const userProfile: UserProfile = {
      nickname: "Ah Lian",
      gender: "female",
      age: 68,
      hobbies: ["gardening", "cooking", "mahjong"],
    };

    // 2. Start session
    console.log("🚀 Starting audio session...");
    await startAudioSession(userId, userProfile);

    // 3. Send first text message
    console.log("📝 Sending first message...");
    await sendTextMessage(userId, "Hi Ami, how are you today?", sessionId);

    // 4. Send second message
    console.log("📝 Sending second message...");
    await sendTextMessage(
      userId,
      "What did you cook for dinner yesterday?",
      sessionId
    );

    // 5. End session
    console.log("🛑 Ending session...");
    await endAudioSession();

    console.log("✓ Example flow completed successfully");
  } catch (error) {
    console.error("✗ Error in example flow:", error);
    try {
      await endAudioSession();
    } catch (disconnectError) {
      console.error("Failed to cleanup on error:", disconnectError);
    }
  }
}

/* ======================== TEXT TO TEXT CHAT ======================== */

/**
 * Text to text chat integration with database storage
 * @param userId - User ID
 * @param options - Chat options including text and history
 * @returns Chat response with session info
 */
async function textToTextChatIntoDb(
  userId: string,
  options: {
    text: string;
    history?: any[];
  }
): Promise<any> {
  const { text, history } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("Text is required and cannot be empty");
  }

  try {
    const sessionId = new Date().getTime().toString();

    // Ensure session is active
    if (!session) {
      console.log("📡 No active session. Connecting...");
      await connectGemini();
    }

    // Send text message
    const result = await sendTextMessage(userId, text, sessionId);

    return {
      success: true,
      message: result.transcript,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0,
    };
  } catch (error) {
    console.error("✗ Error in textToTextChatIntoDb:", error);
    throw error;
  }
}

/* ======================== CHAT HISTORY ======================== */

/**
 * Get chat history for a user
 * @param userId - User ID
 * @returns Array of chat history records
 * @throws Error if user ID invalid or database error
 */
async function getChatHistory(userId: string) {
  try {
  
     const allHistoryQuery = new QueryBuilder(
      ChatHistoryModel
        .find({ userId }),  
     {}
    )
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const history = await allHistoryQuery .modelQuery;
    const meta = await allHistoryQuery .countTotal();

    return { meta,  history};



  } catch (error:any) {

    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE,`✗ Error retrieving chat history for user ${userId}:`, error);
  }
}

/* ======================== EXPORTS ======================== */

/**
 * Chatbot Services Export
 * All functions use the correct Google GenAI SDK methods:
 * - sendClientContent() for text messages
 * - sendRealtimeInput() for audio messages
 * - close() for session termination
 */
const chatBotServices = {
  startAudioSession,
  sendAudioMessage,
  sendTextMessage,
  endAudioSession,
  exampleFlow,
  textToTextChatIntoDb,
  getChatHistory,
  sendTextMessageToSession, // Helper function if needed externally
  sendAudioMessageToSession, // Helper function if needed externally
};

export default chatBotServices;

/* ======================== TYPE EXPORTS ======================== */
export type { UserProfile, SendMessageResult, ExtendedSession };