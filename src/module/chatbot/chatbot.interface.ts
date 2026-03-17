// chatbot.interface.ts

import { Document, Model, Types } from "mongoose";

/**
 * Chat History Document Interface
 * Represents a single conversation turn in the chatbot
 */
export interface IChatHistory extends Document {
  userId: Types.ObjectId | string;
  userMessage: string;
  aiResponse: string;
  expression: "HAPPY" | "SAD" | "SURPRISED" | "NEUTRAL" | "THINKING" | "EXCITED" | "CONFUSED";
  questionCategory?: 
    | "autobiographical memory"
    | "semantic memory"
    | "working memory"
    | "executive functions"
    | "metacognition"
    | "none";
  conversationTopic?: string;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Instance methods
  getSummary?(): {
    id: Types.ObjectId;
    userMessage: string;
    aiResponse: string;
    topic: string;
    createdAt: Date;
  };
}

/**
 * Chat History Query Response
 */
export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data: IChatHistory[];
  timestamp: Date;
}

/**
 * User Profile for Ami personalization
 */
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/**
 * Chat Message Request Body
 */
export interface ChatMessageRequest {
  text: string;
  history?: IChatHistory[];
}

/**
 * Chat Response
 */
export interface ChatResponse {
  success: boolean;
  message: string;
  sessionId: string;
  timestamp: Date;
  transcript?: string;
}

/**
 * Metadata for conversation
 */
export interface ConversationMetadata {
  questionCategory?: string;
  conversationTopic?: string;
  expression?: string;
}


export interface TConversationMemory {
_id: Types.ObjectId;
  userText:string;
  reply: string;
  question_category: string;
  conversation_topic: string;
  icope_health_trigger: boolean;
  mental_distress: boolean;
  summary: string;
  userId: Types.ObjectId
  audio_file?: string; 
  isDeleted?: boolean;
}


export interface ConversationMemoryModel extends Model< TConversationMemory> {
  conversationMemoryCustomId(id: string): Promise<TConversationMemory | null>;
}