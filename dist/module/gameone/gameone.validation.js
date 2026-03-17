"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
/* -------- Sub Schema for Tile Clicks -------- */
const tileClickSchema = zod_1.z.object({
    spriteName: zod_1.z.string({ required_error: "spriteName is required" }),
    wasCorrect: zod_1.z.boolean({ required_error: "wasCorrect is required" }),
    clickTime: zod_1.z.number({ required_error: "clickTime is required" }),
});
/* -------- Main Game Data Schema -------- */
const createGameOneZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameMode: zod_1.z.enum(["OC", "UOT"]),
        language: zod_1.z.string(),
        difficulty: zod_1.z.number(),
        stage: zod_1.z.number(),
        instructionText: zod_1.z.string(),
        completionTime: zod_1.z.number(),
        hintsUsed: zod_1.z.number(),
        repeatButtonClicks: zod_1.z.array(zod_1.z.number()).optional(),
        tileClicks: zod_1.z.array(tileClickSchema).optional(),
    })
});
/* -------- Update GameOne Zod Schema -------- */
const updateGameOneZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameMode: zod_1.z.enum(["OC", "UOT", "VF"]).optional(),
        timestamp: zod_1.z.string().datetime().optional(),
        language: zod_1.z.string().optional(),
        difficulty: zod_1.z.number().optional(),
        stage: zod_1.z.number().optional(),
        instructionText: zod_1.z.string().optional(),
        // Tile Game Fields
        completionTime: zod_1.z.number().optional(),
        hintsUsed: zod_1.z.number().optional(),
        tileClicks: zod_1.z.array(tileClickSchema).optional(),
        // Voice Game Fields
        audioClipId: zod_1.z.string().optional(),
        audioClipUrl: zod_1.z.string().nullable().optional(),
        recordingId: zod_1.z.string().optional(),
        playerResponse: zod_1.z.string().optional(),
        repeatButtonClicks: zod_1.z.array(zod_1.z.number()).optional(),
        isDelete: zod_1.z.boolean().optional(),
    }),
}).refine((data) => {
    if (data.body.gameMode === "OC" || data.body.gameMode === "UOT") {
        return (data.body.completionTime !== undefined &&
            data.body.tileClicks !== undefined);
    }
    return true;
}, {
    message: "For OC/UOT, completionTime and tileClicks are required",
    path: ["body", "completionTime"],
}).refine((data) => {
    if (data.body.gameMode === "VF") {
        return (typeof data.body.audioClipId === "string" &&
            typeof data.body.recordingId === "string" &&
            typeof data.body.playerResponse === "string");
    }
    return true;
}, {
    message: "For VF, audioClipId, recordingId and playerResponse are required",
    path: ["body", "audioClipId"],
});
const vfGameDataSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameMode: zod_1.z.literal("VF", { errorMap: () => ({ message: "gameMode must be VF" }) }),
        language: zod_1.z.string({ required_error: "language is required" }),
        difficulty: zod_1.z.number({ required_error: "difficulty is required" }),
        stage: zod_1.z.number({ required_error: "stage is required" }),
        instructionText: zod_1.z.string({ required_error: "instructionText is required" }),
        audioClipId: zod_1.z.string({ required_error: "audioClipId is required" }),
        audioClipUrl: zod_1.z.string().optional(),
        recordingId: zod_1.z.string({ required_error: "recordingId is required" }),
        playerResponse: zod_1.z.string({ required_error: "playerResponse is required" }),
        repeatButtonClicks: zod_1.z.array(zod_1.z.number()).optional(),
        valid_words: zod_1.z.array(zod_1.z.string()).optional(),
        invalid_words: zod_1.z.array(zod_1.z.string()).optional()
    })
});
const GameOneValidationSchema = {
    createGameOneZodSchema,
    updateGameOneZodSchema,
    vfGameDataSchema
};
exports.default = GameOneValidationSchema;
