import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Session,
} from "@google/genai";
import { writeFile } from "fs/promises";
import configApp from "../../app/config";
import ChatHistoryModel from "../../module/chatbot/chatbot.model";

/* ======================== STATE ======================== */
export let session: Session | null = null;

let textAccumulator = "";
let audioParts: string[] = [];
let currentExpression: "HAPPY" | "SAD" | "NEUTRAL" | "WORRIED" = "NEUTRAL";
let currentJsonData: any = null;

/* ======================== USER PROFILE ======================== */
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/* ======================== SYSTEM PROMPT ======================== */
function buildAmiSystemInstruction(userProfile?: UserProfile): string {
  let userProfileContext = "";

  if (userProfile) {
    const { nickname, gender, age, hobbies } = userProfile;
    if (nickname) userProfileContext += `User's nickname: ${nickname}\n`;
    if (gender) userProfileContext += `Gender: ${gender}\n`;
    if (age) userProfileContext += `Age: ${age}\n`;
    if (hobbies?.length) userProfileContext += `Hobbies: ${hobbies.join(", ")}\n`;
  }

  return `You are Ami, a Singaporean nurse.
Warm, friendly, simple English, talk to elderly users.

${userProfileContext}

Rules:
- Reply ONLY in JSON
- No explanations
- Ask at most ONE question

JSON FORMAT:
{
  "aiResponse": "text",
  "expression": "HAPPY | SAD | NEUTRAL | WORRIED",
  "questionCategory": "autobiographical memory | semantic memory | working memory | executive functions | metacognition | none",
  "conversationTopic": "daily_life | food | family | travel | activity | general"
}`;
}

/* ======================== CONNECT ======================== */
export async function connectGemini(userProfile?: UserProfile): Promise<Session> {
  const ai = new GoogleGenAI({ apiKey: configApp.gemini_api_key });
  const systemInstruction = buildAmiSystemInstruction(userProfile);

  resetTranscript();

  session = await ai.live.connect({
    model: "gemini-2.0-flash-exp",
    callbacks: {
      onmessage: (msg: LiveServerMessage) => handleModelTurn(msg),
    },
    config: {
      responseModalities: [Modality.TEXT, Modality.AUDIO],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    },
  });

  console.log("✓ Gemini session connected");
  return session;
}

/* ======================== STREAM HANDLER ======================== */
export function handleModelTurn(message: LiveServerMessage): void {
  const content = message.serverContent;

  if (content?.modelTurn?.parts) {
    for (const part of content.modelTurn.parts) {
      if (part.text) textAccumulator += part.text;
      if (part.inlineData?.data) audioParts.push(part.inlineData.data);
    }
  }

  if (content?.turnComplete) {
    processCompletedTurn();
  }
}

/* ======================== TURN COMPLETE ======================== */
async function processCompletedTurn() {
  try {
    const cleanText = textAccumulator
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      currentJsonData = JSON.parse(cleanText);
      currentExpression = currentJsonData.expression || "NEUTRAL";
    } catch {
      currentJsonData = {
        aiResponse: cleanText,
        expression: "NEUTRAL",
        questionCategory: "none",
        conversationTopic: "general",
      };
    }

    if (audioParts.length > 0) {
      const wavData = convertToWav(audioParts, "audio/pcm;rate=24000");
      await saveBinaryFile("audio.wav", wavData);
    }

    textAccumulator = "";
    audioParts = [];
  } catch (error) {
    console.error("Turn processing error:", error);
  }
}

/* ======================== GETTERS ======================== */
export function getCurrentTranscript(): string {
  return currentJsonData?.aiResponse || "";
}

export function getCurrentExpression(): string {
  return currentExpression;
}

export function resetTranscript() {
  textAccumulator = "";
  audioParts = [];
  currentJsonData = null;
  currentExpression = "NEUTRAL";
}

/* ======================== SAVE TO DB ======================== */
export async function saveConversationToDb(
  userId: string,
  userMessage: string
) {
  if (!currentJsonData) return null;

  return ChatHistoryModel.create({
    userId,
    userMessage,
    aiResponse: currentJsonData.aiResponse,
    expression: currentJsonData.expression,
    questionCategory: currentJsonData.questionCategory,
    conversationTopic: currentJsonData.conversationTopic,
  });
}

/* ======================== DISCONNECT ======================== */
export async function disconnectSession() {
  try {
    (session as any)?.close();
  } catch {}
  session = null;
  resetTranscript();
}

/* ======================== WAV HELPERS ======================== */
interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const opt: WavConversionOptions = {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16,
  };
  const parts = mimeType.split(";");
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === "rate") opt.sampleRate = parseInt(v, 10);
  }
  return opt;
}

export function convertToWav(rawData: string[], mimeType: string): Uint8Array {
  const options = parseMimeType(mimeType);
  const chunks = rawData.map((d) =>
    Uint8Array.from(Buffer.from(d, "base64"))
  );

  const length = chunks.reduce((s, c) => s + c.length, 0);
  const header = createWavHeader(length, options);
  const out = new Uint8Array(header.length + length);

  out.set(header, 0);
  let offset = header.length;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function createWavHeader(dataLength: number, o: WavConversionOptions): Uint8Array {
  const buffer = new Uint8Array(44);
  const view = new DataView(buffer.buffer);

  const byteRate = (o.sampleRate * o.numChannels * o.bitsPerSample) / 8;
  const blockAlign = (o.numChannels * o.bitsPerSample) / 8;

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, o.numChannels, true);
  view.setUint32(24, o.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, o.bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

async function saveBinaryFile(fileName: string, content: Uint8Array) {
  await writeFile(fileName, content);
}
