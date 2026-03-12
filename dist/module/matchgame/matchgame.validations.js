"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const createMatchGameZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        game_type: zod_1.z.string().min(1, "game_type is required"),
        level: zod_1.z.number().int().min(1),
        total_stages_in_level: zod_1.z.number().int().min(1),
        score: zod_1.z.number().min(0),
        correct_count: zod_1.z.number().min(0),
        wrong_count: zod_1.z.number().min(0),
        score_percentage: zod_1.z.number().min(0).max(100),
        time_spent_seconds: zod_1.z.number().min(0),
        level_completed: zod_1.z.boolean()
    }),
});
/* ================= Update Match Game ================= */
const updateMatchGameZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        game_type: zod_1.z.string().optional(),
        level: zod_1.z.number().int().min(1).optional(),
        total_stages_in_level: zod_1.z.number().int().min(1).optional(),
        score: zod_1.z.number().min(0).optional(),
        correct_count: zod_1.z.number().min(0).optional(),
        wrong_count: zod_1.z.number().min(0).optional(),
        score_percentage: zod_1.z.number().min(0).max(100).optional(),
        time_spent_seconds: zod_1.z.number().min(0).optional(),
        level_completed: zod_1.z.boolean().optional(),
        stage_scores: zod_1.z.array(zod_1.z.number()).optional(),
        isDelete: zod_1.z.boolean().optional(),
    }),
});
const matchGameZodValidation = {
    createMatchGameZodSchema,
    updateMatchGameZodSchema
};
exports.default = matchGameZodValidation;
