import { z } from "zod";

/* -------- Create GameOne -------- */
export const createGameOneZodSchema = z.object({
  body: z.object({
    game: z.string({ required_error: "Game is required" }),
    level: z.number({ required_error: "Level is required" }),
    stage: z.number({ required_error: "Stage is required" }),
    time: z.number({ required_error: "Time is required" }),
    wrongs: z.number().optional().default(0),
    rights: z.number().optional().default(0),
    isDelete: z.boolean().optional(),
  }),
});

/* -------- Update GameOne -------- */
export const updateGameOneZodSchema = z.object({
  body: z.object({
    game: z.string().optional(),
    level: z.number().optional(),
    stage: z.number().optional(),
    time: z.number().optional(),
    wrongs: z.number().optional(),
    rights: z.number().optional(),
    isDelete: z.boolean().optional(),
  }),
});

const GameOneValidationSchema = {
  createGameOneZodSchema,
  updateGameOneZodSchema,
};

export default GameOneValidationSchema;
