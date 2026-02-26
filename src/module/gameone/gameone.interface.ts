import { Model, Types } from "mongoose";

// ==============================
// Tile click structure (OC/UOT)
// ==============================
export interface TTileClick {
  spriteName: string;   // clicked sprite name
  wasCorrect: boolean;  // correctness of click
  clickTime: number;    // seconds since stage start
}

// ==============================
// Base Game Interface (common fields)
// ==============================
export interface TBaseGame {
  userId: Types.ObjectId;        // user ID
  gameMode: "OC" | "UOT" | "VF"; // game mode
  timestamp: Date;               // session timestamp
  language: string;              // language code
  difficulty: number;            // difficulty level
  stage: number;                 // stage number
  instructionText: string;       // instructions shown to player
  repeatButtonClicks: number[];  // timestamps of repeat clicks
  isDelete: boolean;             // soft-delete flag
}

// ==============================
// Tile-based games (OC/UOT)
// ==============================
export interface TTileGame extends TBaseGame {
  gameMode: "OC" | "UOT";

  completionTime: number;     // total time spent in stage
  hintsUsed: number;          // number of hints used
  tileClicks: TTileClick[];   // tile click details

  // VF-only fields not allowed
  audioClipId?: never;
  recordingId?: never;
  playerResponse?: never;
}

// ==============================
// Voice-based game (VF)
// ==============================
export interface TVoiceGame extends TBaseGame {
  gameMode: "VF";

  audioClipId: string;  
  audioClipUrl:string;     
  recordingId: string;       
  playerResponse: string;    
  // Tile-only fields not allowed
  completionTime?: never;
  hintsUsed?: never;
  tileClicks?: never;
}

// ==============================
// Final Union Type
// ==============================
export type TGameOne = TTileGame | TVoiceGame;

// ==============================
// Mongoose Model Interface
// ==============================
export interface GameOneModel extends Model<TGameOne> {
  gameOneByCustomId(id: string): Promise<TGameOne | null>;
}