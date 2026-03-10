import catchError from "../app/error/catchError";
import conversationmemorys from "../module/chatbot/chatbot.model";

const autoDeleteChatBotInfo = async () => {
  try {
    // Current time
    const currentTime = new Date();

    // 2 months threshold
    const timeThreshold = new Date(currentTime);
    timeThreshold.setMonth(timeThreshold.getMonth() - 2);

    // Delete chats older than 2 months
    const deleteResult = await conversationmemorys.deleteMany({
      createdAt: { $lt: timeThreshold },
    });

    console.log(
      `[CRON] Chatbot cleanup completed. Deleted: ${deleteResult.deletedCount}`
    );

    return {
      deletedCount: deleteResult.deletedCount,
      message: "Chats older than 2 months deleted successfully",
    };
  } catch (error) {
    catchError(error, "[Cron] Error in chatbot auto delete job:");
  }
};

export default autoDeleteChatBotInfo;