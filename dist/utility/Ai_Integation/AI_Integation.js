"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = void 0;
exports.connectGemini = connectGemini;
exports.handleModelTurn = handleModelTurn;
exports.getCurrentTranscript = getCurrentTranscript;
exports.getCurrentExpression = getCurrentExpression;
exports.resetTranscript = resetTranscript;
exports.saveConversationToDb = saveConversationToDb;
exports.disconnectSession = disconnectSession;
exports.convertToWav = convertToWav;
const genai_1 = require("@google/genai");
const promises_1 = require("fs/promises");
const config_1 = __importDefault(require("../../app/config"));
const chatbot_model_1 = __importDefault(require("../../module/chatbot/chatbot.model"));
/* ======================== STATE ======================== */
exports.session = null;
let textAccumulator = "";
let audioParts = [];
let currentExpression = "NEUTRAL";
let currentJsonData = null;
/* ======================== SYSTEM PROMPT ======================== */
function buildAmiSystemInstruction(userProfile) {
    let userProfileContext = "";
    if (userProfile) {
        const { nickname, gender, age, hobbies } = userProfile;
        if (nickname)
            userProfileContext += `User's nickname: ${nickname}\n`;
        if (gender)
            userProfileContext += `Gender: ${gender}\n`;
        if (age)
            userProfileContext += `Age: ${age}\n`;
        if (hobbies === null || hobbies === void 0 ? void 0 : hobbies.length)
            userProfileContext += `Hobbies: ${hobbies.join(", ")}\n`;
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
function connectGemini(userProfile) {
    return __awaiter(this, void 0, void 0, function* () {
        const ai = new genai_1.GoogleGenAI({ apiKey: config_1.default.gemini_api_key });
        const systemInstruction = buildAmiSystemInstruction(userProfile);
        resetTranscript();
        exports.session = yield ai.live.connect({
            model: "gemini-2.0-flash-exp",
            callbacks: {
                onmessage: (msg) => handleModelTurn(msg),
            },
            config: {
                responseModalities: [genai_1.Modality.TEXT, genai_1.Modality.AUDIO],
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                },
            },
        });
        console.log("✓ Gemini session connected");
        return exports.session;
    });
}
/* ======================== STREAM HANDLER ======================== */
function handleModelTurn(message) {
    var _a, _b;
    const content = message.serverContent;
    if ((_a = content === null || content === void 0 ? void 0 : content.modelTurn) === null || _a === void 0 ? void 0 : _a.parts) {
        for (const part of content.modelTurn.parts) {
            if (part.text)
                textAccumulator += part.text;
            if ((_b = part.inlineData) === null || _b === void 0 ? void 0 : _b.data)
                audioParts.push(part.inlineData.data);
        }
    }
    if (content === null || content === void 0 ? void 0 : content.turnComplete) {
        processCompletedTurn();
    }
}
/* ======================== TURN COMPLETE ======================== */
function processCompletedTurn() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cleanText = textAccumulator
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            try {
                currentJsonData = JSON.parse(cleanText);
                currentExpression = currentJsonData.expression || "NEUTRAL";
            }
            catch (_a) {
                currentJsonData = {
                    aiResponse: cleanText,
                    expression: "NEUTRAL",
                    questionCategory: "none",
                    conversationTopic: "general",
                };
            }
            if (audioParts.length > 0) {
                const wavData = convertToWav(audioParts, "audio/pcm;rate=24000");
                yield saveBinaryFile("audio.wav", wavData);
            }
            textAccumulator = "";
            audioParts = [];
        }
        catch (error) {
            console.error("Turn processing error:", error);
        }
    });
}
/* ======================== GETTERS ======================== */
function getCurrentTranscript() {
    return (currentJsonData === null || currentJsonData === void 0 ? void 0 : currentJsonData.aiResponse) || "";
}
function getCurrentExpression() {
    return currentExpression;
}
function resetTranscript() {
    textAccumulator = "";
    audioParts = [];
    currentJsonData = null;
    currentExpression = "NEUTRAL";
}
/* ======================== SAVE TO DB ======================== */
function saveConversationToDb(userId, userMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentJsonData)
            return null;
        return chatbot_model_1.default.create({
            userId,
            userMessage,
            aiResponse: currentJsonData.aiResponse,
            expression: currentJsonData.expression,
            questionCategory: currentJsonData.questionCategory,
            conversationTopic: currentJsonData.conversationTopic,
        });
    });
}
/* ======================== DISCONNECT ======================== */
function disconnectSession() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            exports.session === null || exports.session === void 0 ? void 0 : exports.session.close();
        }
        catch (_a) { }
        exports.session = null;
        resetTranscript();
    });
}
function parseMimeType(mimeType) {
    const opt = {
        numChannels: 1,
        sampleRate: 24000,
        bitsPerSample: 16,
    };
    const parts = mimeType.split(";");
    for (const p of parts) {
        const [k, v] = p.split("=");
        if (k === "rate")
            opt.sampleRate = parseInt(v, 10);
    }
    return opt;
}
function convertToWav(rawData, mimeType) {
    const options = parseMimeType(mimeType);
    const chunks = rawData.map((d) => Uint8Array.from(Buffer.from(d, "base64")));
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
function createWavHeader(dataLength, o) {
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
function writeString(view, offset, text) {
    for (let i = 0; i < text.length; i++) {
        view.setUint8(offset + i, text.charCodeAt(i));
    }
}
function saveBinaryFile(fileName, content) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, promises_1.writeFile)(fileName, content);
    });
}
