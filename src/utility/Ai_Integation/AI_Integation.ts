// geminiAudio.ts
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from "@google/genai";
import { writeFile } from "fs";
import configApp from "../../app/config";

export const responseQueue: LiveServerMessage[] = [];
export let session: Session | undefined;

/* ---------------- TURN HANDLING ---------------- */

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
    await new Promise((r) => setTimeout(r, 100));
  }
}

/* ---------------- AUDIO ---------------- */

const audioParts: string[] = [];

export function handleModelTurn(message: LiveServerMessage) {
  if (!message.serverContent?.modelTurn?.parts) return;

  const part = message.serverContent.modelTurn.parts[0];

  if (part?.inlineData) {
    audioParts.push(part.inlineData.data ?? "");
    const wavData = convertToWav(audioParts, part.inlineData.mimeType ?? "");
    saveBinaryFile("audio.wav", wavData);
  }

  if (part?.text) {
    console.log(part.text);
  }
}

export function saveBinaryFile(fileName: string, content: Uint8Array) {
  writeFile(fileName, content, (err) => {
    if (err) console.error(err);
  });
}

/* ---------------- WAV ---------------- */

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

  const audioLength = audioChunks.reduce((s, c) => s + c.length, 0);
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

  const [, ...params] = mimeType.split(";");

  for (const param of params) {
    const [key, value] = param.split("=");
    if (key?.trim() === "rate") {
      options.sampleRate = parseInt(value);
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

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, (sampleRate * numChannels * bitsPerSample) / 8, true);
  view.setUint16(32, (numChannels * bitsPerSample) / 8, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/* ---------------- CONNECT ---------------- */

export async function connectGemini() {
  const ai = new GoogleGenAI({
    apiKey: configApp.gemini_api_key,
  });

  session = await ai.live.connect({
    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
    callbacks: {
      onmessage: (msg) => responseQueue.push(msg),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
    },
  });

  return session;
}
