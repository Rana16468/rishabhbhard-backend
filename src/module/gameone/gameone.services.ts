import httpStatus from "http-status";
import catchError from "../../app/error/catchError";
import { TGameOne } from "./gameone.interface";
import gameone from "./gameone.model";
import ApiError from "../../app/error/ApiError";



const recordedGameOneDataIntoDB=async(userId:string, payload:TGameOne)=>{

    try{

 
         

       
        const result=await gameone.create({ ...payload, userId});


        if(!result){
            throw new ApiError(httpStatus.NOT_EXTENDED,'issues by the game one  recorded data ','')
        };

        return {
            status: true , 
             message:"successfully recorded"
        }

    }
    catch(error){
        catchError(error);
    }

      ;
};

const myGameLevelIntoDb = async (userId: string) => {
  try {
    const result = await gameone
      .findOne({ userId })          
      .sort({ createdAt: -1 }).select("game level stage")     
      .lean();                   

    return result;
  } catch (error) {
    catchError(error);
  }
};


const GameOneServices={
    recordedGameOneDataIntoDB,
    myGameLevelIntoDb
};

export default GameOneServices;