import { RequestHandler } from "express";
import catchAsync from "../../utility/catchAsync";
import GameOneServices from "./gameone.services";
import sendRespone from "../../utility/sendRespone";
import httpStatus, { REQUESTED_RANGE_NOT_SATISFIABLE } from "http-status";



const  recordedGameOneData:RequestHandler=catchAsync(async(req , res)=>{

       const result=await GameOneServices.recordedGameOneDataIntoDB(req.user.id, req);

        sendRespone(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result
  });
});


const myGameLevel:RequestHandler=catchAsync(async(req , res)=>{

       const result=await GameOneServices.myGameLevelIntoDb(req.user.id);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Get My Game Level and Stage",
    data: result
  });

});



const  deleteGameOneData:RequestHandler=catchAsync(async(req , res)=>{


      const result=await GameOneServices.deleteGameOneDataIntoDb( req.params.id);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete",
    data: result
  });

});


const  trackingSummary:RequestHandler=catchAsync(async(req , res)=>{

       const result=await GameOneServices.trackingSummaryIntoDb(req.query, req.user.id);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Tracking Summary",
    data: result
  });

});

const findByResearcherUser:RequestHandler=catchAsync(async(req , res)=>{

  const result=await GameOneServices.findByResearcherUserIntoDb (req.query);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find By Researcher Data",
    data: result
  });

});


const findBySpecificResearcherUser:RequestHandler=catchAsync(async(req , res)=>{

     const result=await GameOneServices.findBySpecificResearcherUserIntoDb (req.query, req.params.userId);
    sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Specific Find By Researcher Data",
    data: result
  });
});



const findByAllDownloadResearcherUser:RequestHandler=catchAsync(async(req , res)=>{

    const result=await GameOneServices.findByAllDownloadResearcherUserIntoDb(req.query);

       sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find All Download Data",
    data: result
  });
});



const  downloadBySpeckGame:RequestHandler=catchAsync(async(req , res)=>{

    const  result= await GameOneServices.downloadBySpeckGameIntoDb(req.params.userId, req.query, res);

       sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find All Download audio Data",
    data: result
  });

})




const  GameOneController ={
    recordedGameOneData,
    myGameLevel,
     deleteGameOneData,
     trackingSummary,
     findByResearcherUser,
     findBySpecificResearcherUser,
     findByAllDownloadResearcherUser,
     downloadBySpeckGame
};

export default GameOneController;