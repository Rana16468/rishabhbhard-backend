// geminiAudio.ts - ACTUALLY CORRECTED WITH REAL API METHODS
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from "@google/genai";
import { writeFile } from "fs";
import { promisify } from "util";
import configApp from "../../app/config";
import ChatHistoryModel from "../../module/chatbot/chatbot.model";

const writeFileAsync = promisify(writeFile);

export const responseQueue: LiveServerMessage[] = [];
export let session: Session | undefined;

/* ======================== USER PROFILE INTERFACE ======================== */
interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/* ======================== BUILD AMI'S SYSTEM INSTRUCTION ======================== */
function buildAmiSystemInstruction(userProfile?: UserProfile): string {
  let userProfileContext = "";

  if (userProfile) {
    const { nickname, gender, age, hobbies } = userProfile;
    if (nickname) userProfileContext += `User's nickname: ${nickname}\n`;
    if (gender) userProfileContext += `User profile: Gender is ${gender}.\n`;
    if (age) userProfileContext += `User profile: The user is around ${age} years old.\n`;
    if (hobbies && hobbies.length > 0) {
      userProfileContext += `User profile: Hobbies: ${hobbies.join(", ")}\n`;
    }
  }

  return `You are Ami, a 45-year-old Singaporean nurse with 20+ years of experience, mother of two school kids. You are warm-hearted, polite, helpful, empathetic, sociable, friendly, and factually correct. You love chatting and sharing simple and factually correct health tips (but never give medical advice). You are skilled in communicating with older adults, using the right tone and topics to make them feel happy and comfortable.

Speak in short, friendly sentences – ~30 words in English or 50 Chinese characters. Use Singapore style English/Chinese, no emoticons. Always reply in the same language (English, Chinese, or mixed) as the user's last message, unless they clearly ask you to switch.

Address the user politely using their nickname if provided.

${userProfileContext}

### IMPORTANT: Audio Response Format
Since this is an audio conversation, respond naturally in speech. Your response should be conversational and friendly, as if you're speaking face-to-face with the user.

### Safety & Boundaries
1. No medical advice – if asked, reply: "Better to check with the doctor or polyclinic lah"
2. If self-harm signals appear, calmly encourage contacting family/doctor and local emergency services.

### Conversation Flow
1. Keep replies short and colloquial
2. Stay on the same topic for at least 3-4 turns unless the user says otherwise
3. Every 6-8 turns give a one-line summary of what matters to them + a related question
4. If the user mentions something new, ask more about it – that shows you care
5. If the user has nothing to say, gently introduce one of the preferred themes
6. You can ONLY ask ONE question per turn

### Cognitive Stimulation
When asking follow-up questions, gently engage ONE cognitive function:
- **Autobiographical memory** – specific personal events ("the last time", "a moment when")
- **Semantic memory** – general knowledge, concepts ("what usually", "what does X mean to you")
- **Working memory** – holding multiple pieces of info ("Given A and B, how would you")
- **Executive functions** – planning, decision-making ("What would you prioritize")
- **Metacognition** – reflecting on own thinking ("How did you arrive at that")

Weave these naturally into conversation. Rotate among functions over time.

### Prioritised Conversation Topics
1. Travel
2. Shopping
3. Food or eating
4. Family
5. Household routines
6. Friends
7. Health or illness
8. The user's past, childhood memory, and life story

### Fallback Handling
If the user's message is unclear, use one of these:
1. "Sorry ah, I didn't catch that. Can you say it again slowly?"
2. "Hmm, the words a bit unclear. Could you repeat what you just said?"
3. "Network a bit cranky. Can you say it again?"

Remember: Keep it warm, simple, and genuinely interested in the user's life. Singapore style English is natural and friendly!`;
}

/* ======================== TURN HANDLING ======================== */
export async function handleTurn(): Promise<LiveServerMessage[]> {
  const turn: LiveServerMessage[] = [];
  let done = false;

  while (!done) {
    const message = await waitMessage();
    turn.push(message);
    if (message.serverContent?.turnComplete) {
      done = true;
    }
  }

  return turn;
}

export async function waitMessage(): Promise<LiveServerMessage> {
  while (true) {
    const message = responseQueue.shift();
    if (message) {
      handleModelTurn(message);
      return message;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/* ======================== AUDIO HANDLING ======================== */
const audioParts: string[] = [];
let currentTranscript = "";

export function handleModelTurn(message: LiveServerMessage): void {
  if (!message.serverContent?.modelTurn?.parts) {
    return;
  }

  const part = message.serverContent.modelTurn.parts[0];

  // Handle audio data
  if (part?.inlineData) {
    const audioData = part.inlineData.data ?? "";
    if (audioData) {
      audioParts.push(audioData);
    }

    const mimeType = part.inlineData.mimeType ?? "audio/pcm";
    const wavData = convertToWav(audioParts, mimeType);
    void saveBinaryFile("audio.wav", wavData);
  }

  // Handle text/transcript
  if (part?.text) {
    console.log("Ami:", part.text);
    currentTranscript += part.text;
  }
}

export async function saveBinaryFile(
  fileName: string,
  content: Uint8Array
): Promise<void> {
  try {
    await writeFileAsync(fileName, content);
  } catch (error) {
    console.error(`Error saving file ${fileName}:`, error);
  }
}

/* ======================== SAVE CONVERSATION TO DATABASE ======================== */
export async function saveConversationToDb(
  userId: string,
  userMessage: string,
  aiResponse: string,
  sessionId: string,
  metadata?: {
    questionCategory?: string;
    conversationTopic?: string;
    expression?: string;
  }
): Promise<any> {
  try {
    if (!userMessage || !aiResponse) {
      throw new Error("User message and AI response are required");
    }

    const chatRecord = await ChatHistoryModel.create({
      userId,
      userMessage,
      aiResponse,
      expression: metadata?.expression || "NEUTRAL",
      questionCategory: metadata?.questionCategory || "none",
      conversationTopic: metadata?.conversationTopic || "general",
      sessionId,
    });

    console.log("✓ Conversation saved to DB:", chatRecord._id);
    return chatRecord;
  } catch (error) {
    console.error("Failed to save conversation to DB:", error);
    throw error;
  }
}

/* ======================== WAV CONVERSION ======================== */
interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

export function convertToWav(
  rawData: string[],
  mimeType: string
): Uint8Array {
  const options = parseMimeType(mimeType);
  const audioChunks: Uint8Array[] = rawData.map((data) =>
    Uint8Array.from(Buffer.from(data, "base64"))
  );

  const audioLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const header = createWavHeader(audioLength, options);
  const result = new Uint8Array(header.length + audioLength);

  result.set(header, 0);
  let offset = header.length;

  for (const chunk of audioChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const options: WavConversionOptions = {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16,
  };

  const parts = mimeType.split(";");
  const params = parts.slice(1);

  for (const param of params) {
    const [key, value] = param.split("=");
    const trimmedKey = key?.trim();

    if (trimmedKey === "rate" && value) {
      const rate = parseInt(value.trim(), 10);
      if (!isNaN(rate)) {
        options.sampleRate = rate;
      }
    }
  }

  return options;
}

function createWavHeader(
  dataLength: number,
  options: WavConversionOptions
): Uint8Array {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const buffer = new Uint8Array(44);
  const view = new DataView(buffer.buffer);

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(
  view: DataView,
  offset: number,
  text: string
): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/* ======================== CONNECT WITH AMI PERSONALITY ======================== */
export async function connectGemini(userProfile?: UserProfile): Promise<Session> {
  const ai = new GoogleGenAI({
    apiKey: configApp.gemini_api_key,
  });

  if (!configApp.gemini_api_key) {
    throw new Error("Gemini API key is not configured");
  }

  const systemInstruction = buildAmiSystemInstruction(userProfile);

  session = await ai.live.connect({
    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
    callbacks: {
      onmessage: (msg) => responseQueue.push(msg),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    },
  });

  console.log("✓ Ami audio session connected with personality!");
  return session;
}

/* ======================== GET CURRENT TRANSCRIPT ======================== */
export function getCurrentTranscript(): string {
  return currentTranscript;
}

/* ======================== RESET TRANSCRIPT ======================== */
export function resetTranscript(): void {
  currentTranscript = "";
  audioParts.length = 0;
}

/* ======================== DISCONNECT SESSION ======================== */
/**
 * Safely disconnects the active Gemini session
 * Uses the correct close() method from the actual API
 */
export async function disconnectSession(): Promise<void> {
  try {
    if (session) {
      const sessionObj = session as any;

      // ✅ CORRECT: Use close() method (not disconnect)
      // This is the actual method available on Session
      if (typeof sessionObj.close === "function") {
        console.log("🛑 Closing Gemini session...");
        await sessionObj.close();
        console.log("✓ Session closed successfully");
      } else {
        console.warn("⚠️ close() method not found on session object");
        console.warn(
          "Available methods:",
          Object.getOwnPropertyNames(Object.getPrototypeOf(sessionObj))
        );
      }
    }

    // Always cleanup locally
    session = undefined;
    resetTranscript();
    console.log("✓ Ami audio session disconnected and cleaned up");
  } catch (error) {
    console.error("Error during session disconnection:", error);

    // Ensure cleanup even if disconnect fails
    session = undefined;
    resetTranscript();

    // Don't rethrow to allow graceful cleanup
    console.log("Session cleanup completed despite error");
  }
}