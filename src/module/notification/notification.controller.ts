import { RequestHandler } from "express";
import catchAsync from "../../utility/catchAsync";
import notificationServices from "./notification.services";
import sendRespone from "../../utility/sendRespone";
import httpStatus from "http-status";



const findByAllUsersNotification:RequestHandler=catchAsync(async(req , res)=>{

      const result=await notificationServices.findByAllUsersNotificationIntoDb(req.query);
       sendRespone(res, {
              statusCode: httpStatus.OK,
              success: true,
              message: "successfully  find all  notification ",
              data: result,
            });
});


const  findByAllDashboardList: RequestHandler=catchAsync(async(req , res)=>{

      const  result=await notificationServices.findByAllDashboardListIntoDB();
      sendRespone(res, {
              statusCode: httpStatus.OK,
              success: true,
              message: "successfully   find All ",
              data: result,
            });
})



const notificationController={
    findByAllUsersNotification,
    findByAllDashboardList
};

export default  notificationController