import httpStatus from "http-status";
import catchError from "../../app/error/catchError";
import { TGameOne } from "./gameone.interface";
import gameone from "./gameone.model";
import ApiError from "../../app/error/ApiError";
import QueryBuilder from "../../app/builder/QueryBuilder";
import { Types } from "mongoose";



const recordedGameOneDataIntoDB=async(userId:string, payload:TGameOne)=>{

    try{

 
         

       
        const result=await gameone.create({ ...payload, userId});


        if(!result){
            throw new ApiError(httpStatus.NOT_EXTENDED,'issues by the game one  recorded data ','')
        };

        return {
            status: true , 
             message:"successfully recorded"
        }

    }
    catch(error){
        catchError(error);
    }

      ;
};

const myGameLevelIntoDb = async (userId: string) => {
  try {
    const result = await gameone
      .findOne({ userId })          
      .sort({ createdAt: -1 }).select("game level total_stages_in_level")     
      .lean();                   

    return result;
  } catch (error) {
    catchError(error);
  }
};





const deleteGameOneDataIntoDb = async (userId: string, id: string) => {
  try {
    // Check if document exists for this user
    const isExistGame = await gameone.exists({ userId, _id: id });

    if (!isExistGame) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        "This game data does not exist",
        ""
      );
    }

    // Delete the document
    const result = await gameone.deleteOne({ userId, _id: id });

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


const trackingSummaryIntoDb = async (
  query: Record<string, unknown>,
  userId: string
) => {
  try {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const skip = (page - 1) * limit;
    const period = query.period as string; // 'week', 'month', 'year', etc.

    let dateFilter: any = { isDelete: false };
    
    if (period === 'week') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: weekAgo };
    } else if (period === 'month') {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: monthAgo };
    } else if (period === 'year') {
      const now = new Date();
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: yearAgo };
    }
    // If no period specified, show all data (no date filter)

    const pipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          ...dateFilter,
        },
      },

      {
        $addFields: {
          playedDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },

      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total_games_played: { $sum: 1 },
                total_time_spent_minutes: {
                  $sum: { $divide: ["$time_spent_seconds", 60] },
                },
                average_score: { $avg: "$score" },
                best_score: { $max: "$score" },
              },
            },
            {
              $project: {
                _id: 0,
                total_games_played: 1,
                total_time_spent_minutes: {
                  $round: ["$total_time_spent_minutes", 0],
                },
                average_score: { $round: ["$average_score", 0] },
                best_score: 1,
                cognitive_improvement_percentage: {
                  $round: ["$average_score", 0],
                },
                game_performance_percentage: {
                  $round: ["$average_score", 0],
                },
              },
            },
          ],

          chart_data: [
            {
              $group: {
                _id: "$playedDate",
                score: { $avg: "$score" },
                games_count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id",
                score: { $round: ["$score", 0] },
                games_count: 1,
              },
            },
            { $sort: { date: 1 } },
          ],

          recent_sessions: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                id: "$_id",
                level: 1,
                score: 1,
                correct_count: 1,
                wrong_count: 1,
                time_spent_seconds: 1,
                level_completed: 1,
                played_at: "$createdAt",
              },
            },
          ],

          recent_sessions_meta: [
            { $count: "total" }
          ]
        },
      },

      {
        $project: {
          data: {
            $mergeObjects: [
              { $arrayElemAt: ["$summary", 0] },
              {
                chart_data: "$chart_data",
                recent_sessions: "$recent_sessions",
                recent_sessions_meta: {
                  page,
                  limit,
                  total: { $ifNull: [{ $arrayElemAt: ["$recent_sessions_meta.total", 0] }, 0] },
                },
              },
            ],
          },
        },
      },
    ];

    const result = await gameone.aggregate(pipeline as any);

    return result[0];
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Tracking summary fetch failed",
      error
    );
  }
};




const GameOneServices={
    recordedGameOneDataIntoDB,
    myGameLevelIntoDb,
     trackingSummaryIntoDb,
    deleteGameOneDataIntoDb
};

export default GameOneServices;