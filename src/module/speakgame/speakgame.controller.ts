import { RequestHandler } from "express";
import catchAsync from "../../utility/catchAsync";
import speakGameServices from "./speakgame.services";
import sendRespone from "../../utility/sendRespone";
import httpStatus from "http-status";


const recordedSpeakGameData:RequestHandler=catchAsync(async(req , res)=>{


      const result=await speakGameServices.recordedSpeakGameDataIntoDB(req.user.id, req.body);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result
  });

});

const myGameLevel: RequestHandler=catchAsync(async(req , res)=>{

      const result=await speakGameServices.myGameLevelIntoDb(req.user.id);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My Level And Stage",
    data: result
  });

});


const deleteSpeakGame: RequestHandler=catchAsync(async(req , res)=>{

      const result=await speakGameServices.deleteSpeakGameIntoDb(req.user.id, req.params.id);
sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete Speak Game",
    data: result
  });

});


const trackingMySpeakSummary:RequestHandler=catchAsync(async(req , res)=>{

      const result=await speakGameServices.trackingSpeakSummaryIntoDb(req.user.id, req.query);
      sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My Summery",
    data: result
  });

})


const speakGameController={
    recordedSpeakGameData,
     myGameLevel,
     deleteSpeakGame,
     trackingMySpeakSummary
};

export default speakGameController;

