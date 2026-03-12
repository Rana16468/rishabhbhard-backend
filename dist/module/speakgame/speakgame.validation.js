"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const createSpeakGameZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        game_type: zod_1.z.string().min(1, "game_type is required"),
        level: zod_1.z.number().int().min(1, "level must be at least 1"),
        stage: zod_1.z.number().int().min(1, "stage must be at least 1"),
        total_stages_in_level: zod_1.z
            .number()
            .int()
            .min(1, "total_stages_in_level must be at least 1"),
        category: zod_1.z.string().min(1, "category is required"),
        language: zod_1.z.string().min(1, "language is required"),
        score: zod_1.z.number().min(0).optional().default(0),
        correct_count: zod_1.z.number().min(0).optional().default(0),
        wrong_count: zod_1.z.number().min(0).optional().default(0),
        time_spent_seconds: zod_1.z.number().min(0, "time_spent_seconds is required"),
        detected_words: zod_1.z.array(zod_1.z.string()).optional().default([]),
        valid_words: zod_1.z.array(zod_1.z.string()).optional().default([]),
        invalid_words: zod_1.z.array(zod_1.z.string()).optional().default([]),
        level_completed: zod_1.z.boolean().optional().default(false)
    }),
});
const speakGameValidation = {
    createSpeakGameZodSchema
};
exports.default = speakGameValidation;
