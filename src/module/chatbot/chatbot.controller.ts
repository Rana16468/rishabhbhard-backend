import { RequestHandler } from "express";
import catchAsync from "../../utility/catchAsync";
import chatBotServices from "./chatbot.services";
import sendRespone from "../../utility/sendRespone";
import httpStatus from "http-status";



const textToTextChat:RequestHandler=catchAsync(async(req , res)=>{


      const result=await chatBotServices.textToTextChatIntoDb(req.user.id, req.body);
        sendRespone(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "Successfully  send the text",
          data: result
        });

});


const textToTextController={
    textToTextChat
};

export default textToTextController;