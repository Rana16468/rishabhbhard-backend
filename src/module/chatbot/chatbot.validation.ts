// chatbot.validation.ts

import { z } from "zod";

/**
 * Validation schema for text-to-text chat messages
 */
const chatbotValidationSchema = z.object({
  body: z.object({
    text: z
      .string({
        required_error: "Text message is required",
        invalid_type_error: "Text must be a string",
      })
      .trim()
      .min(1, "Text cannot be empty")
      .max(2000, "Text cannot exceed 2000 characters"),
    

    history: z
      .array(
        z.object({
          userMessage: z.string().optional(),
          aiResponse: z.string().optional(),
          timestamp: z.date().optional(),
        })
      )
      .optional()
      .default([]),
  }),
});

/**
 * Validation schema for audio message
 */
const audioMessageValidationSchema = z.object({
  body: z.object({
    audioData: z
      .string({
        required_error: "Audio data is required",
        invalid_type_error: "Audio data must be a string (base64 encoded)",
      })
      .min(1, "Audio data cannot be empty"),

    sessionId: z
      .string({
        required_error: "Session ID is required",
      })
      .min(1, "Session ID cannot be empty"),
  }),
});

/**
 * Validation schema for starting audio session
 */
const startAudioSessionValidationSchema = z.object({
  body: z.object({
    userProfile: z
      .object({
        nickname: z.string().optional(),
        gender: z.enum(["male", "female"]).optional(),
        age: z.number().int().min(0).max(150).optional(),
        hobbies: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

/**
 * Validation schema for getting chat history
 */
const getChatHistoryValidationSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, {
        message: "Limit must be between 1 and 100",
      })
      .optional()
      .default("50"),

    page: z
      .string()
      .transform(Number)
      .refine((n) => n > 0, {
        message: "Page must be greater than 0",
      })
      .optional()
      .default("1"),
  }),
});

const chatbotValidation = {
  chatbotValidationSchema,
  audioMessageValidationSchema,
  startAudioSessionValidationSchema,
  getChatHistoryValidationSchema,
};

export default chatbotValidation;