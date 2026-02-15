import { z } from "zod";

 const createMatchGameZodSchema = z.object({
  body: z.object({
    game_type: z.string().min(1, "game_type is required"),

    level: z.number().int().min(1),

    total_stages_in_level: z.number().int().min(1),

  
    score: z.number().min(0),

    correct_count: z.number().min(0),

    wrong_count: z.number().min(0),

    score_percentage: z.number().min(0).max(100),

    time_spent_seconds: z.number().min(0),

    level_completed: z.boolean()

  }),
});

/* ================= Update Match Game ================= */
const updateMatchGameZodSchema = z.object({
  body: z.object({
    game_type: z.string().optional(),

    level: z.number().int().min(1).optional(),

    total_stages_in_level: z.number().int().min(1).optional(),

    score: z.number().min(0).optional(),

    correct_count: z.number().min(0).optional(),

    wrong_count: z.number().min(0).optional(),

    score_percentage: z.number().min(0).max(100).optional(),

    time_spent_seconds: z.number().min(0).optional(),

    level_completed: z.boolean().optional(),

    stage_scores: z.array(z.number()).optional(),

    isDelete: z.boolean().optional(),
  }),
});



const matchGameZodValidation={
createMatchGameZodSchema,
updateMatchGameZodSchema
};

export default matchGameZodValidation;

