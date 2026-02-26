import { RequestHandler } from "express";
import catchAsync from "../../utility/catchAsync";
import GameOneServices from "./gameone.services";
import sendRespone from "../../utility/sendRespone";
import httpStatus, { REQUESTED_RANGE_NOT_SATISFIABLE } from "http-status";



const  recordedGameOneData:RequestHandler=catchAsync(async(req , res)=>{

       const result=await GameOneServices.recordedGameOneDataIntoDB(req.user.id, req.body);

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


      const result=await GameOneServices.deleteGameOneDataIntoDb(req.user.id, req.params.id);
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

  const result=await GameOneServices.findByResearcherUserIntoDb(req.user.id, req.query);
 sendRespone(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find By Researcher Data",
    data: result
  });

})


const  GameOneController ={
    recordedGameOneData,
    myGameLevel,
     deleteGameOneData,
     trackingSummary,
     findByResearcherUser
};

export default GameOneController;