import { Model, Types } from "mongoose";

export interface TGameOne {

    game: string;
    level:number;
    stage:number;
    userId: Types.ObjectId;
     wrongs: number;
     rights: number;
     time: number;
     isDelete: boolean;


};

export interface UserModel extends Model<TGameOne> {
  gameOneByCustomId(id: string): Promise<TGameOne | null>;

 
}