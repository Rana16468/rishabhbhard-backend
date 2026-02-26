import { z } from "zod";

/* -------- Sub Schema for Tile Clicks -------- */
const tileClickSchema = z.object({
  spriteName: z.string({ required_error: "spriteName is required" }),
  wasCorrect: z.boolean({ required_error: "wasCorrect is required" }),
  clickTime: z.number({ required_error: "clickTime is required" }),
});

/* -------- Main Game Data Schema -------- */
const createGameOneZodSchema = z.object({
  body: z.object({
    gameMode: z.enum(["OC", "UOT"]),
    language: z.string(),
    difficulty: z.number(),
    stage: z.number(),
    instructionText: z.string(),
    completionTime: z.number(),
    hintsUsed: z.number(),
    repeatButtonClicks: z.array(z.number()).optional(),
    tileClicks: z.array(tileClickSchema).optional(),
  })
});



/* -------- Update GameOne Zod Schema -------- */
const updateGameOneZodSchema = z.object({
  body: z.object({
    gameMode: z.enum(["OC", "UOT", "VF"]).optional(),
    timestamp: z.string().datetime().optional(),
    language: z.string().optional(),
    difficulty: z.number().optional(),
    stage: z.number().optional(),
    instructionText: z.string().optional(),

    // Tile Game Fields
    completionTime: z.number().optional(),
    hintsUsed: z.number().optional(),
    tileClicks: z.array(tileClickSchema).optional(),

    // Voice Game Fields
    audioClipId: z.string().optional(),
    audioClipUrl: z.string().nullable().optional(),
    recordingId: z.string().optional(),
    playerResponse: z.string().optional(),

    repeatButtonClicks: z.array(z.number()).optional(),
    isDelete: z.boolean().optional(),
  }),
}).refine(
  (data) => {
    if (data.body.gameMode === "OC" || data.body.gameMode === "UOT") {
      return (
        data.body.completionTime !== undefined &&
        data.body.tileClicks !== undefined
      );
    }
    return true;
  },
  {
    message:
      "For OC/UOT, completionTime and tileClicks are required",
    path: ["body", "completionTime"],
  }
).refine(
  (data) => {
    if (data.body.gameMode === "VF") {
      return (
        typeof data.body.audioClipId === "string" &&
        typeof data.body.recordingId === "string" &&
        typeof data.body.playerResponse === "string"
      );
    }
    return true;
  },
  {
    message:
      "For VF, audioClipId, recordingId and playerResponse are required",
    path: ["body", "audioClipId"],
  }
);


const vfGameDataSchema = z.object({

    body: z.object({
  gameMode: z.literal("VF", { errorMap: () => ({ message: "gameMode must be VF" }) }),
  language: z.string({ required_error: "language is required" }),
  difficulty: z.number({ required_error: "difficulty is required" }),
  stage: z.number({ required_error: "stage is required" }),
  instructionText: z.string({ required_error: "instructionText is required" }),
  audioClipId: z.string({ required_error: "audioClipId is required" }),
  audioClipUrl:z.string().optional(),
  recordingId: z.string({ required_error: "recordingId is required" }),
  playerResponse: z.string({ required_error: "playerResponse is required" }),
  repeatButtonClicks: z.array(z.number()).optional(),
    })
});

const GameOneValidationSchema = {
  createGameOneZodSchema,
  updateGameOneZodSchema,
  vfGameDataSchema 
};

export default GameOneValidationSchema;