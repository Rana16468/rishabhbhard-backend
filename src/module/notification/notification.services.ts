import QueryBuilder from "../../app/builder/QueryBuilder";
import catchError from "../../app/error/catchError";
import gameone from "../gameone/gameone.model";
import users from "../user/user.model";
import notifications from "./notification.model";






const findByAllUsersNotificationIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allNotificationQuery = new QueryBuilder(
      notifications
        .find({  })
        .select(
          "-password",
        ).populate([
          {
            path:"userId",
            select:"nickname  photo"
          }
        ]),
      query,
    )
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const all_notification = await allNotificationQuery.modelQuery;
    const meta = await allNotificationQuery.countTotal();

    return { meta, all_notification };
  } catch (error) {
      catchError(error);
  }
};



const findByAllDashboardListIntoDB= async()=>{


    try{
        const totalUser=await users.countDocuments();
    const totalOcGame=await gameone.find({
gameMode:"OC"}).countDocuments();
const totalUOT=await gameone.find({gameMode:"UOT"}).countDocuments();
const totalVF=await gameone.find({gameMode:"VF"}).countDocuments();



return{
  totalOcGame, totalUOT, totalVF, totalUser
}

    }
    catch(error){
      catchError(error);
    }
}


const notificationServices={
    findByAllUsersNotificationIntoDb,
    findByAllDashboardListIntoDB
};

export default notificationServices;