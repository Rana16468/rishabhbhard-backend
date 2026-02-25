import { z } from "zod";

/* -------- Sub Schema for tileClicks -------- */
const tileClickSchema = z.object({
  spriteName: z.string({ required_error: "Sprite name is required" }),
  wasCorrect: z.boolean({ required_error: "wasCorrect is required" }),
  clickTime: z.number({ required_error: "Click time is required" }),
});

/* -------- Create GameOne -------- */
 const createGameOneZodSchema = z.object({
  body: z.object({
  

    gameMode: z.enum(["OC", "UOT", "VF"], {
      required_error: "Game mode is required",
    }),

    timestamp: z.string().datetime({
      message: "Timestamp must be a valid ISO date",
    }),

    language: z.string({ required_error: "Language is required" }),

    difficulty: z.number({ required_error: "Difficulty is required" }),

    stage: z.number({ required_error: "Stage is required" }),

    instructionText: z.string({
      required_error: "Instruction text is required",
    }),

    completionTime: z.number({
      required_error: "Completion time is required",
    }),

    hintsUsed: z.number().optional().default(0),

    repeatButtonClicks: z.array(z.number()).optional().default([]),

    tileClicks: z
      .array(tileClickSchema)
      .nonempty("Tile clicks must have at least one value").optional(),

    isDelete: z.boolean().optional().default(false),
  }),
});

/* -------- Update GameOne -------- */
 const updateGameOneZodSchema = z.object({
  body: z.object({

    gameMode: z.enum(["OC", "UOT","VF"]).optional(),
    timestamp: z.string().datetime().optional(),
    language: z.string().optional(),
    difficulty: z.number().optional(),
    stage: z.number().optional(),
    instructionText: z.string().optional(),
    completionTime: z.number().optional(),
    hintsUsed: z.number().optional(),
    repeatButtonClicks: z.array(z.number()).optional(),
    tileClicks: z.array(tileClickSchema).optional(),
    isDelete: z.boolean().optional(),
  }),
});

const GameOneValidationSchema = {
  createGameOneZodSchema,
  updateGameOneZodSchema,
};

export default GameOneValidationSchema;