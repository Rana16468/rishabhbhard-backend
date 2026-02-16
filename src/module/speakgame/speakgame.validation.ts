import { z } from "zod";

 const createSpeakGameZodSchema = z.object({
  body: z.object({
    game_type: z.string().min(1, "game_type is required"),

    level: z.number().int().min(1, "level must be at least 1"),

    stage: z.number().int().min(1, "stage must be at least 1"),

    total_stages_in_level: z
      .number()
      .int()
      .min(1, "total_stages_in_level must be at least 1"),

    category: z.string().min(1, "category is required"),

    language: z.string().min(1, "language is required"),

    score: z.number().min(0).optional().default(0),

    correct_count: z.number().min(0).optional().default(0),

    wrong_count: z.number().min(0).optional().default(0),

    time_spent_seconds: z.number().min(0, "time_spent_seconds is required"),

    detected_words: z.array(z.string()).optional().default([]),

    valid_words: z.array(z.string()).optional().default([]),

    invalid_words: z.array(z.string()).optional().default([]),

    level_completed: z.boolean().optional().default(false)
  }),
});



const speakGameValidation={
    createSpeakGameZodSchema
};

export default speakGameValidation;
