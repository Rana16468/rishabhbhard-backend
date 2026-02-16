import { Types } from "mongoose";
import { TSpeakGame } from "./speakgame.interface";
import speakgames from "./speakgame.model";
import ApiError from "../../app/error/ApiError";
import httpStatus from "http-status";
import catchError from "../../app/error/catchError";
import QueryBuilder from "../../app/builder/QueryBuilder";

const recordedSpeakGameDataIntoDB = async (
  userId: string,
  payload: Omit<TSpeakGame, "userId">
) => {
  try{
    if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid userId","");
  }

  const result = await speakgames.create({
    ...payload,
    userId: new Types.ObjectId(userId),
  });
  if(!result){
    throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the same game recorded server issues','');
  }

  return {
    status: true,
    message: "Successfully recorded"
  };

  }
  catch(error){
    catchError(error);
  }
};

const myGameLevelIntoDb = async (userId: string) => {
  try {
    const result = await speakgames
      .findOne({ userId })          
      .sort({ createdAt: -1 }).select("game_type level stage total_stages_in_level")     
      .lean();                   

    return result;
  } catch (error) {
    catchError(error);
  }
};


const deleteSpeakGameIntoDb = async (userId: string, id: string) => {
  try {
    const isExistGame = await speakgames.exists({ userId, _id: id });

    if (!isExistGame) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        "This game data does not exist",
        ""
      );
    }

    // Delete the document
    const result = await speakgames.deleteOne({ userId, _id: id });

    if (result.deletedCount !== 1) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        "Failed to delete the game data",
        ""
      );
    }

    return {
      status: true,
      message: "Successfully deleted",
    };
  } catch (error) {
    catchError(error);
  }
};


const trackingSpeakSummaryIntoDb = async (
  userId: string,
  query: Record<string, unknown>
) => {
  try {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const skip = (page - 1) * limit;
    const period = query.period as string;

    // ================= DATE FILTER USING SWITCH CASE =================
    let dateFilter: any = {};

    switch (period) {
      case "week": {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        dateFilter = { createdAt: { $gte: start } };
        break;
      }

      case "month": {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        dateFilter = { createdAt: { $gte: start } };
        break;
      }

      case "year": {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        dateFilter = { createdAt: { $gte: start } };
        break;
      }

      default:
        dateFilter = {}; // all time
    }

    const summary = await speakgames.aggregate([
      // ================= MATCH =================
      {
        $match: {
          userId: new Types.ObjectId(userId),
          ...dateFilter,
        },
      },

      // ================= FACET =================
      {
        $facet: {
          // ---------- STATS ----------
          stats: [
            {
              $group: {
                _id: null,
                total_games_played: { $sum: 1 },
                total_time_spent_seconds: { $sum: "$time_spent_seconds" },
                average_score: { $avg: "$score" },
                best_score: { $max: "$score" },
                total_valid_words: {
                  $sum: { $size: { $ifNull: ["$valid_words", []] } },
                },
                total_invalid_words: {
                  $sum: { $size: { $ifNull: ["$invalid_words", []] } },
                },
              },
            },
            {
              $project: {
                _id: 0,
                total_games_played: 1,
                total_time_spent_minutes: {
                  $round: [{ $divide: ["$total_time_spent_seconds", 60] }, 0],
                },
                average_score: { $round: ["$average_score", 0] },
                best_score: 1,
                total_valid_words: 1,
                total_invalid_words: 1,
              },
            },
          ],

          // ---------- CHART DATA ----------
          chart_data: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt",
                    },
                  },
                },
                score: { $avg: "$score" },
                games_count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id.date",
                score: { $round: ["$score", 0] },
                games_count: 1,
              },
            },
            { $sort: { date: 1 } },
          ],

          // ---------- RECENT SESSIONS (PAGINATED) ----------
          recent_sessions: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: "$_id",
                level: 1,
                stage: 1,
                category: 1,
                score: 1,
                correct_count: 1,
                wrong_count: 1,
                valid_words: 1,
                invalid_words: 1,
                time_spent_seconds: 1,
                level_completed: 1,
                played_at: "$createdAt",
              },
            },
          ],

          // ---------- TOTAL COUNT ----------
          recent_sessions_meta: [{ $count: "total" }],
        },
      },

      // ================= FINAL SHAPE =================
      {
        $project: {
          total_games_played: {
            $arrayElemAt: ["$stats.total_games_played", 0],
          },
          total_time_spent_minutes: {
            $arrayElemAt: ["$stats.total_time_spent_minutes", 0],
          },
          average_score: {
            $arrayElemAt: ["$stats.average_score", 0],
          },
          best_score: {
            $arrayElemAt: ["$stats.best_score", 0],
          },
          total_valid_words: {
            $arrayElemAt: ["$stats.total_valid_words", 0],
          },
          total_invalid_words: {
            $arrayElemAt: ["$stats.total_invalid_words", 0],
          },
          chart_data: 1,
          recent_sessions: 1,
          recent_sessions_meta: {
            page: page,
            limit: limit,
            total: {
              $arrayElemAt: ["$recent_sessions_meta.total", 0],
            },
          },
        },
      },
    ]);

    return summary[0];
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Speak summary fetch failed",
      error
    );
  }
};





const speakGameServices = {
  recordedSpeakGameDataIntoDB,
   myGameLevelIntoDb,
   deleteSpeakGameIntoDb,
   trackingSpeakSummaryIntoDb
};

export default speakGameServices;
