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
Object.defineProperty(exports, "__esModule", { value: true });
// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
const genai_1 = require("@google/genai");
const fs_1 = require("fs");
const responseQueue = [];
let session = undefined;
function handleTurn() {
    return __awaiter(this, void 0, void 0, function* () {
        const turn = [];
        let done = false;
        while (!done) {
            const message = yield waitMessage();
            turn.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                done = true;
            }
        }
        return turn;
    });
}
function waitMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        let done = false;
        let message = undefined;
        while (!done) {
            message = responseQueue.shift();
            if (message) {
                handleModelTurn(message);
                done = true;
            }
            else {
                yield new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return message;
    });
}
const audioParts = [];
function handleModelTurn(message) {
    var _a, _b, _c, _d, _e, _f, _g;
    if ((_b = (_a = message.serverContent) === null || _a === void 0 ? void 0 : _a.modelTurn) === null || _b === void 0 ? void 0 : _b.parts) {
        const part = (_e = (_d = (_c = message.serverContent) === null || _c === void 0 ? void 0 : _c.modelTurn) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0];
        if (part === null || part === void 0 ? void 0 : part.fileData) {
            console.log(`File: ${part === null || part === void 0 ? void 0 : part.fileData.fileUri}`);
        }
        if (part === null || part === void 0 ? void 0 : part.inlineData) {
            const fileName = 'audio.wav';
            const inlineData = part === null || part === void 0 ? void 0 : part.inlineData;
            audioParts.push((_f = inlineData === null || inlineData === void 0 ? void 0 : inlineData.data) !== null && _f !== void 0 ? _f : '');
            const buffer = convertToWav(audioParts, (_g = inlineData.mimeType) !== null && _g !== void 0 ? _g : '');
            saveBinaryFile(fileName, buffer);
        }
        if (part === null || part === void 0 ? void 0 : part.text) {
            console.log(part === null || part === void 0 ? void 0 : part.text);
        }
    }
}
function saveBinaryFile(fileName, content) {
    (0, fs_1.writeFile)(fileName, content, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file ${fileName}:`, err);
            return;
        }
        console.log(`Appending stream content to file ${fileName}.`);
    });
}
function convertToWav(rawData, mimeType) {
    const options = parseMimeType(mimeType);
    const dataLength = rawData.reduce((a, b) => a + b.length, 0);
    const wavHeader = createWavHeader(dataLength, options);
    const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')));
    return Buffer.concat([wavHeader, buffer]);
}
function parseMimeType(mimeType) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');
    const options = {
        numChannels: 1,
        bitsPerSample: 16,
    };
    if (format && format.startsWith('L')) {
        const bits = parseInt(format.slice(1), 10);
        if (!isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }
    for (const param of params) {
        const [key, value] = param.split('=').map(s => s.trim());
        if (key === 'rate') {
            options.sampleRate = parseInt(value, 10);
        }
    }
    return options;
}
function createWavHeader(dataLength, options) {
    const { numChannels, sampleRate, bitsPerSample, } = options;
    // http://soundfile.sapp.org/doc/WaveFormat
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0); // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    buffer.write('WAVE', 8); // Format
    buffer.write('fmt ', 12); // Subchunk1ID
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    buffer.write('data', 36); // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size
    return buffer;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ai = new genai_1.GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
        const model = 'models/gemini-2.5-flash-native-audio-preview-12-2025';
        const tools = [
            { googleSearch: {} },
        ];
        const config = {
            responseModalities: [
                genai_1.Modality.AUDIO,
            ],
            mediaResolution: genai_1.MediaResolution.MEDIA_RESOLUTION_MEDIUM,
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: 'Zephyr',
                    }
                }
            },
            contextWindowCompression: {
                triggerTokens: '25600',
                slidingWindow: { targetTokens: '12800' },
            },
            tools,
        };
        session = yield ai.live.connect({
            model,
            callbacks: {
                onopen: function () {
                    console.debug('Opened');
                },
                onmessage: function (message) {
                    responseQueue.push(message);
                },
                onerror: function (e) {
                    console.debug('Error:', e.message);
                },
                onclose: function (e) {
                    console.debug('Close:', e.reason);
                },
            },
            config
        });
        session.sendClientContent({
            turns: [
                `INSERT_INPUT_HERE`
            ]
        });
        yield handleTurn();
        session.close();
    });
}
main();
