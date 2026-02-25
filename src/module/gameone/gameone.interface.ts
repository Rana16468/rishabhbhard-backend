import { Model, Types } from "mongoose";

export interface TTileClick {
  spriteName: string;
  wasCorrect: boolean;
  clickTime: number; // seconds
}

export interface TGameOne {
  userId: Types.ObjectId;   // or string if not using ObjectId yet
  gameMode: "OC" | "UOT" | "VF";
  timestamp: Date;
  language: string;
  difficulty: number;
  stage: number;
  instructionText: string;
  completionTime: number; // seconds
  hintsUsed: number;
  repeatButtonClicks: number[]; // array of timestamps
  tileClicks: TTileClick[];
  isDelete: boolean;
}

export interface UserModel extends Model<TGameOne> {
  gameOneByCustomId(id: string): Promise<TGameOne | null>;
}