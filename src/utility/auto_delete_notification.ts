
import notifications from "../module/notification/notification.model";
import catchError from "../app/error/catchError";

const auto_delete_notification = async () => {
  try {
    const timeThreshold = new Date();
    timeThreshold.setMonth(timeThreshold.getMonth() - 1);

    const deleteResult = await notifications.deleteMany({
      createdAt: { $lt: timeThreshold },
    });

   

    

    return {
      deletedCount: deleteResult.deletedCount,
      message: "Old notifications deleted successfully",
    };
  } catch (error: unknown) {
    catchError(error, 'Failed to delete notifications');
   
  }
};

export default auto_delete_notification;