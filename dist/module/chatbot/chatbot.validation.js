"use strict";
// chatbot.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
/**
 * Validation schema for text-to-text chat messages
 */
const chatbotValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        text: zod_1.z
            .string({
            required_error: "Text message is required",
            invalid_type_error: "Text must be a string",
        })
            .trim()
            .min(1, "Text cannot be empty")
            .max(2000, "Text cannot exceed 2000 characters"),
        history: zod_1.z
            .array(zod_1.z.object({
            userMessage: zod_1.z.string().optional(),
            aiResponse: zod_1.z.string().optional(),
            timestamp: zod_1.z.date().optional(),
        }))
            .optional()
            .default([]),
    }),
});
/**
 * Validation schema for audio message
 */
const audioMessageValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        audioData: zod_1.z
            .string({
            required_error: "Audio data is required",
            invalid_type_error: "Audio data must be a string (base64 encoded)",
        })
            .min(1, "Audio data cannot be empty"),
        sessionId: zod_1.z
            .string({
            required_error: "Session ID is required",
        })
            .min(1, "Session ID cannot be empty"),
    }),
});
/**
 * Validation schema for starting audio session
 */
const startAudioSessionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userProfile: zod_1.z
            .object({
            nickname: zod_1.z.string().optional(),
            gender: zod_1.z.enum(["male", "female"]).optional(),
            age: zod_1.z.number().int().min(0).max(150).optional(),
            hobbies: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .optional(),
    }),
});
/**
 * Validation schema for getting chat history
 */
const getChatHistoryValidationSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z
            .string()
            .transform(Number)
            .refine((n) => n > 0 && n <= 100, {
            message: "Limit must be between 1 and 100",
        })
            .optional()
            .default("50"),
        page: zod_1.z
            .string()
            .transform(Number)
            .refine((n) => n > 0, {
            message: "Page must be greater than 0",
        })
            .optional()
            .default("1"),
    }),
});
//  userMessage,
//     aiResponse: currentJsonData.aiResponse,
//     expression: currentJsonData.expression,
//     questionCategory: currentJsonData.questionCategory,
//     conversationTopic: currentJsonData.conversationTopic,
const ChatHistoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        userMessage: zod_1.z
            .string()
            .trim()
            .min(1, { message: "User message is required" }),
        aiResponse: zod_1.z
            .string()
            .trim()
            .min(1, { message: "AI response is required" }),
        expression: zod_1.z.enum([
            "HAPPY",
            "SAD",
            "SURPRISED",
            "NEUTRAL",
            "THINKING",
            "EXCITED",
            "CONFUSED",
            "ANGRY",
            "WORRIED",
        ]).default("NEUTRAL"),
        questionCategory: zod_1.z.enum([
            "general",
            "food",
            "health",
            "fitness",
            "family",
            "autobiographical memory",
            "semantic memory",
            "working memory",
            "executive functions",
            "metacognition",
            "none",
        ]).default("general"),
        conversationTopic: zod_1.z.enum([
            "daily_life",
            "medical",
            "activity",
            "general",
        ]).default("general"),
    })
});
const ConversationMemoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        userText: zod_1.z.string({ required_error: "user text is required" }),
        reply: zod_1.z.string().min(1, "Reply is required"),
        question_category: zod_1.z.string().min(1, "Question category is required"),
        conversation_topic: zod_1.z.string().min(1, "Conversation topic is required"),
        icope_health_trigger: zod_1.z.boolean(),
        mental_distress: zod_1.z.boolean(),
        summary: zod_1.z.string().min(1, "Summary is required"),
        audio_file: zod_1.z.string().optional(),
        isDeleted: zod_1.z.boolean().default(false)
    })
});
const chatbotValidation = {
    chatbotValidationSchema,
    audioMessageValidationSchema,
    startAudioSessionValidationSchema,
    getChatHistoryValidationSchema,
    ChatHistoryZodSchema,
    ConversationMemoryZodSchema
};
exports.default = chatbotValidation;
