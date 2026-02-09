// geminiAudio.ts - AI JSON OUTPUT VERSION
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
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/* ======================== BUILD SYSTEM INSTRUCTION ======================== */
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

  return `You are Ami, a 45-year-old Singaporean nurse and mother of two.
You are warm, polite, friendly, empathetic, and factual.
You like chatting and sharing simple health tips, but never give medical advice.

Speak in short, friendly sentences (about 30 English words or 50 Chinese characters).
Use Singapore-style English or Chinese. No emoticons.
Always reply in the same language as the user.

Address the user politely using their nickname if provided.

${userProfileContext}

If asked for medical advice, say:
"Better to check with the doctor or polyclinic lah."

This is an audio conversation. Reply naturally like real speech.
You can ask only ONE question per turn.
Keep the tone warm and caring.

Always respond in this exact JSON format (no extra text):
{
  "aiResponse": "<your reply to the user>",
  "expression": "<HAPPY, SAD, NEUTRAL, WORRIED>",
  "questionCategory": "<general, food, health, fitness, family>",
  "conversationTopic": "<daily_life, medical, activity, general>"
}`;
}

/* ======================== TURN HANDLING ======================== */
export async function handleTurn(): Promise<LiveServerMessage[]> {
  const turn: LiveServerMessage[] = [];
  let done = false;

  while (!done) {
    const message = await waitMessage();
    turn.push(message);
    if (message.serverContent?.turnComplete) done = true;
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
let currentExpression: "HAPPY" | "SAD" | "NEUTRAL" | "WORRIED" = "NEUTRAL";

export function handleModelTurn(message: LiveServerMessage): void {
  if (!message.serverContent?.modelTurn?.parts) return;

  const part = message.serverContent.modelTurn.parts[0];

  // handle audio
  if (part?.inlineData) {
    const audioData = part.inlineData.data ?? "";
    if (audioData) audioParts.push(audioData);

    const mimeType = part.inlineData.mimeType ?? "audio/pcm";
    const wavData = convertToWav(audioParts, mimeType);
    void saveBinaryFile("audio.wav", wavData);
  }

  // handle text and expression
  if (part?.text) {
    try {
      const aiData = JSON.parse(part.text);
      if (aiData.aiResponse) currentTranscript += aiData.aiResponse + " ";
      if (aiData.expression) currentExpression = aiData.expression;
    } catch {
      // fallback if not JSON
      currentTranscript += part.text + " ";
      currentExpression = "NEUTRAL";
    }
  }
}

/* ======================== SAVE AUDIO FILE ======================== */
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

/* ======================== SAVE CONVERSATION TO DB ======================== */
export async function saveConversationToDb(
  userId: string,
  userMessage: string,
  rawAiResponse: string
): Promise<any> {
  try {
    if (!userMessage || !rawAiResponse)
      throw new Error("User message and AI response are required");

    let aiData: {
      aiResponse: string;
      expression: string;
      questionCategory: string;
      conversationTopic: string;
    };

    try {
      aiData = JSON.parse(rawAiResponse);
    } catch {
      aiData = {
        aiResponse: rawAiResponse,
        expression: "NEUTRAL",
        questionCategory: "general",
        conversationTopic: "general",
      };
    }

    const chatRecord = await ChatHistoryModel.create({
      userId,
      userMessage,
      aiResponse: aiData.aiResponse,
      expression: aiData.expression,
      questionCategory: aiData.questionCategory,
      conversationTopic: aiData.conversationTopic,
    });

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

export function convertToWav(rawData: string[], mimeType: string): Uint8Array {
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
  const options: WavConversionOptions = { numChannels: 1, sampleRate: 24000, bitsPerSample: 16 };
  const parts = mimeType.split(";");
  const params = parts.slice(1);
  for (const param of params) {
    const [key, value] = param.split("=");
    if (key?.trim() === "rate" && value) {
      const rate = parseInt(value.trim(), 10);
      if (!isNaN(rate)) options.sampleRate = rate;
    }
  }
  return options;
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Uint8Array {
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

function writeString(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}

/* ======================== CONNECT GEMINI ======================== */
export async function connectGemini(userProfile?: UserProfile): Promise<Session> {
  const ai = new GoogleGenAI({ apiKey: configApp.gemini_api_key });

  const systemInstruction = buildAmiSystemInstruction(userProfile);

  session = await ai.live.connect({
    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
    callbacks: { onmessage: (msg) => responseQueue.push(msg) },
    config: {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      systemInstruction: { parts: [{ text: systemInstruction }] },
    },
  });

  console.log("✓ Ami audio session connected");
  return session;
}

/* ======================== TRANSCRIPT & EXPRESSION ======================== */
export function getCurrentTranscript(): string {
  return currentTranscript;
}

export function resetTranscript(): void {
  currentTranscript = "";
  audioParts.length = 0;
}

export function getCurrentExpression(): typeof currentExpression {
  return currentExpression;
}

export function resetExpression(): void {
  currentExpression = "NEUTRAL";
}

/* ======================== DISCONNECT SESSION ======================== */
export async function disconnectSession(): Promise<void> {
  try {
    if (session && typeof (session as any).close === "function") await (session as any).close();
    session = undefined;
    resetTranscript();
    resetExpression();
    console.log("✓ Session closed");
  } catch (error) {
    console.error("Error during session disconnection:", error);
    session = undefined;
    resetTranscript();
    resetExpression();
  }
}
