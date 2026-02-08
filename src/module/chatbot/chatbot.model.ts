// chatbot.model.ts - FIXED

import mongoose, { Schema } from "mongoose";
import { IChatHistory } from "./chatbot.interface";

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
      ref: "User",
    },
    userMessage: {
      type: String,
      required: [true, "User message is required"],
      trim: true,
    },
    aiResponse: {
      type: String,
      required: [true, "AI response is required"],
      trim: true,
    },
    expression: {
      type: String,
      enum: {
        values: [
          "HAPPY",
          "SAD",
          "SURPRISED",
          "NEUTRAL",
          "THINKING",
          "EXCITED",
          "CONFUSED",
          "ANGRY",
          "WORRIED"
        ],
        message: "Invalid expression value",
      },
      default: "NEUTRAL",
    },
    questionCategory: {
      type: String,
      enum: {
        values: [
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
        ],
        message: "Invalid question category",
      },
      default: "general", // Changed from "none" to match AI output
    },
    conversationTopic: {
      type: String,
      enum: {
        values: [
          "daily_life",
          "medical",
          "activity",
          "general"
        ],
        message: "Invalid conversation topic",
      },
      default: "general",
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient querying
ChatHistorySchema.index({ userId: 1, createdAt: -1 });
ChatHistorySchema.index({ userId: 1, conversationTopic: 1 });
ChatHistorySchema.index({ questionCategory: 1, createdAt: -1 });

// Add TTL index to auto-delete old records after 90 days (optional)
ChatHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000, sparse: true }
);

// Pre-save validation
ChatHistorySchema.pre("save", function (next) {
  if (!this.userMessage || this.userMessage.trim().length === 0) {
    return next(new Error("User message cannot be empty"));
  }
  if (!this.aiResponse || this.aiResponse.trim().length === 0) {
    return next(new Error("AI response cannot be empty"));
  }
  next();
});

// Add method to get conversation summary
ChatHistorySchema.methods.getSummary = function () {
  return {
    id: this._id,
    userMessage: this.userMessage,
    aiResponse: this.aiResponse,
    topic: this.conversationTopic,
    category: this.questionCategory,
    expression: this.expression,
    createdAt: this.createdAt,
  };
};

// Add static method to get user conversations
ChatHistorySchema.statics.getUserConversations = async function (
  userId: string,
  limit: number = 50,
  skip: number = 0
) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Add static method to filter by category
ChatHistorySchema.statics.getConversationsByCategory = async function (
  userId: string,
  category: string
) {
  return await this.find({ userId, questionCategory: category })
    .sort({ createdAt: -1 })
    .lean();
};

const ChatHistoryModel = mongoose.model<IChatHistory>(
  "chathistorys",
  ChatHistorySchema
);

export default ChatHistoryModel;