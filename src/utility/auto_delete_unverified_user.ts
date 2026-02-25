// auto_delete_unverified_user.ts
import httpStatus from "http-status";
import users from "../module/user/user.model";
import ApiError from "../app/error/ApiError";
import catchError from "../app/error/catchError";

const AUTO_DELETE_DAYS = 2; // ✅ 2 days

const auto_delete_unverified_user = async (): Promise<{
  deletedCount: number;
  message: string;
}> => {
  try {
    const thresholdTime = new Date(
      Date.now() - AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000 // 2 days in ms
    );

    const deleteResult = await users.deleteMany({
      isVerify: false,
      createdAt: { $lt: thresholdTime },
    });

    if (!deleteResult) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Delete operation failed",
        ""
      );
    }

    return {
      deletedCount: deleteResult.deletedCount || 0,
      message:
        deleteResult.deletedCount && deleteResult.deletedCount > 0
          ? "Unverified users deleted successfully (older than 2 days)"
          : "No unverified users found to delete",
    };
  } catch (error: unknown) {
    catchError(error, "Cron job failed: auto_delete_unverified_user");
    return {
      deletedCount: 0,
      message: "Error occurred while deleting unverified users",
    };
  }
};

export default auto_delete_unverified_user;