import { Model, Types } from "mongoose";

export interface TMatchGame {

    game_type: string;
    level:number;
    total_stages_in_level:number;
    userId: Types.ObjectId;
     score: number;
     correct_count: number;
     wrong_count: number;
     score_percentage:number;
     time_spent_seconds:number;
     level_completed: boolean;
     isDelete: boolean;


};

export interface MatchGameModel extends Model<TMatchGame> {
  matchGameCustomId(id: string): Promise<TMatchGame | null>;

 
}