import { Model, Types } from "mongoose";

export interface TGameOne {

    game_type: string;
    level:number;
    total_stages_in_level:number;
    userId: Types.ObjectId;
     score: number;
     correct_count: number;
     wrong_count: number;
     total_correct_possible:number;
     time_spent_seconds:number;
     level_completed: boolean;
     stage_scores:number[]
     isDelete: boolean;


};

export interface UserModel extends Model<TGameOne> {
  gameOneByCustomId(id: string): Promise<TGameOne | null>;

 
}