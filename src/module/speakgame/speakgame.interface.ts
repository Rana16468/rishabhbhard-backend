import { Model, Types } from "mongoose";

export interface TSpeakGame {

    game_type: string;
    level:number;
    stage:number;
    total_stages_in_level:number;
    userId: Types.ObjectId;
    category:string;
    language:string;
     score: number;
     correct_count: number;
     wrong_count: number;
     time_spent_seconds:number;
     detected_words:string[];
     valid_words:string[];
     invalid_words:string[];
     level_completed: boolean;
     isDelete: boolean;


};

export interface MatchGameModel extends Model<TSpeakGame> {
  speakGameCustomId(id: string): Promise<TSpeakGame | null>;
}