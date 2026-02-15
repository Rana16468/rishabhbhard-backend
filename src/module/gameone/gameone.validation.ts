import { z } from "zod";

/* -------- Create GameOne -------- */
export const createGameOneZodSchema = z.object({
  body: z.object({
    game_type: z.string({ required_error: "Game type is required" }),

    level: z.number({ required_error: "Level is required" }),

    total_stages_in_level: z.number({
      required_error: "Total stages in level is required",
    }),

    score: z.number({ required_error: "Score is required" }),

    correct_count: z.number({ required_error: "Correct count is required" }),

    wrong_count: z.number({ required_error: "Wrong count is required" }),

    total_correct_possible: z.number({
      required_error: "Total correct possible is required",
    }),

    time_spent_seconds: z.number({
      required_error: "Time spent seconds is required",
    }),

    level_completed: z.boolean({
      required_error: "Level completed status is required",
    }),

    stage_scores: z
      .array(z.number())
      .nonempty("Stage scores must have at least one value"),

    isDelete: z.boolean().optional().default(false),
  }),
});

/* -------- Update GameOne -------- */
export const updateGameOneZodSchema = z.object({
  body: z.object({
    game_type: z.string().optional(),
    level: z.number().optional(),
    total_stages_in_level: z.number().optional(),
    score: z.number().optional(),
    correct_count: z.number().optional(),
    wrong_count: z.number().optional(),
    total_correct_possible: z.number().optional(),
    time_spent_seconds: z.number().optional(),
    level_completed: z.boolean().optional(),
    stage_scores: z.array(z.number()).optional(),
    isDelete: z.boolean().optional(),
  }),
});

const GameOneValidationSchema = {
  createGameOneZodSchema,
  updateGameOneZodSchema,
};

export default GameOneValidationSchema;
