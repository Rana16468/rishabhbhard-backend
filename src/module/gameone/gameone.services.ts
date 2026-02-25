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
      .sort({ createdAt: -1 }).select("difficulty stage hintsUsed instructionText")     
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
    const period = query.period as string;

    let dateFilter: any = { isDelete: false };

    if (period === "week") {
      dateFilter.createdAt = { $gte: new Date(Date.now() - 7 * 86400000) };
    } else if (period === "month") {
      dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 86400000) };
    } else if (period === "year") {
      dateFilter.createdAt = { $gte: new Date(Date.now() - 365 * 86400000) };
    }

    const pipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          ...dateFilter,
        },
      },

      /* ---------- JOIN USER COLLECTION ---------- */
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      /* ---------- Compute accuracy ---------- */
      {
        $addFields: {
          totalClicks: { $size: "$tileClicks" },
          correctClicks: {
            $size: {
              $filter: {
                input: "$tileClicks",
                as: "t",
                cond: { $eq: ["$$t.wasCorrect", true] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $eq: ["$totalClicks", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correctClicks", "$totalClicks"] },
                  100,
                ],
              },
            ],
          },
        },
      },

      /* ---------- Group by gameMode ---------- */
      {
        $group: {
          _id: "$gameMode",

          userId: { $first: "$user._id" },
          // userName: { $first: "$user.name" },
          nickName: { $first: "$user.nickname" },

          highestDifficultyUnlocked: { $max: "$difficulty" },
          totalRuns: { $sum: 1 },
          averageCompletionTime: { $avg: "$completionTime" },

          lastRun: { $last: "$$ROOT" },
          avgAccuracy: { $avg: "$accuracy" },
        },
      },

      /* ---------- Rating formula ---------- */
      {
        $project: {
          _id: 0,
          gameMode: "$_id",

          userId: 1,
          userName: 1,
          nickName: 1,

          highestDifficultyUnlocked: 1,
          totalRuns: 1,
          averageCompletionTime: { $round: ["$averageCompletionTime", 1] },

          latestRating: {
            stars: {
              $round: [
                {
                  $divide: [
                    {
                      $add: [
                        { $multiply: ["$avgAccuracy", 0.4] },
                        {
                          $multiply: [
                            { $subtract: [100, "$averageCompletionTime"] },
                            0.4,
                          ],
                        },
                        { $multiply: [100, 0.2] },
                      ],
                    },
                    20,
                  ],
                },
                0,
              ],
            },
            speedScore: { $round: ["$averageCompletionTime", 1] },
            accuracyScore: { $round: ["$avgAccuracy", 1] },
            efficiencyScore: 20,
          },

          latestAudioTranscription: "$lastRun.instructionText",
        },
      },

      /* ---------- Reshape ---------- */
      {
        $group: {
          _id: null,
          userId: { $first: "$userId" },
          userName: { $first: "$userName" },
          nickName: { $first: "$nickName" },
          data: {
            $push: {
              k: "$gameMode",
              v: {
                highestDifficultyUnlocked: "$highestDifficultyUnlocked",
                totalRuns: "$totalRuns",
                averageCompletionTime: "$averageCompletionTime",
                latestRating: "$latestRating",
                latestAudioTranscription: "$latestAudioTranscription",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          userName: 1,
          nickName: 1,
          gameProgress: { $arrayToObject: "$data" },
        },
      },
    ];

    const result = await gameone.aggregate(pipeline as any);

    return result[0] || {
      userId,
      userName: null,
      nickName: null,
      gameProgress: {},
    };
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