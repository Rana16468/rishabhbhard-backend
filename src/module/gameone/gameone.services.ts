import httpStatus from "http-status";
import catchError from "../../app/error/catchError";
import gameone from "./gameone.model";
import ApiError from "../../app/error/ApiError";
import { Types } from "mongoose";
import { Request } from "express";
import { uploadToS3 } from "../../utility/uploadToS3";
import config from "../../app/config";
import { deleteFromS3 } from "../../utility/deleteFromS3";



const recordedGameOneDataIntoDB = async (userId: string, req: Request) => {
  try {
    const file = req.file;
    const bodyData = req.body;

    // Prepare the payload
    const payload = {
      userId,
      ...bodyData,
      ...(file?.path && { audioClipUrl: file.path.replace(/\\/g, "/") }),
    };

        if (file) {
          // updateData.photo = file?.path?.replace(/\\/g, "/");
          payload.audioClipUrl = await uploadToS3(file, config.file_path);
        
        
        }

    const result = await gameone.create(payload);

    if (!result) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        file?.path
          ? "Issues in the speak game recorded section"
          : "Issues in the find and match game recorded section",
        ""
      );
    }

    return { status: true, message: "Successfully recorded" };
  } catch (error) {
    catchError(error);
  }
};
const myGameLevelIntoDb = async (userId: string) => {
  try {
    const objectUserId = new Types.ObjectId(userId);

    const result = await gameone.aggregate([
      {
        $match: {
          userId: objectUserId
          
        },
      },

      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$gameMode",
          difficulty: { $first: "$difficulty" },
          stage: { $first: "$stage" },
          hintsUsed: { $first: "$hintsUsed" },
          instructionText: { $first: "$instructionText" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          gameMode: "$_id",
          difficulty: 1,
          stage: 1,
          hintsUsed: 1,
          instructionText: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { gameMode: 1 },
      },
    ]);

    return result;
  } catch (error) {
    catchError(error);
  }
};

const deleteGameOneDataIntoDb = async ( id: string) => {
  try {
    // Check if document exists for this user
    const isExistGame = await gameone.findOne({  _id: id },{_id:1, audioClipUrl:1}) as any;

    if (!isExistGame) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        "This game data does not exist",
        ""
      );
    }
    
         if( isExistGame?.audioClipUrl)
          {
             await deleteFromS3(isExistGame?. audioClipUrl);
          }
    
        
          
        
      

    // Delete the document
    const result = await gameone.deleteOne({ _id: id });

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
    const objectUserId = new Types.ObjectId(userId);

    const result = await gameone.aggregate([
      // 1️⃣ Match only this user's games
      {
        $match: {
          userId: objectUserId,
        },
      },

      // 2️⃣ Lookup user info — handle both ObjectId and string userId
      {
        $lookup: {
          from: "users",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$uid"] },
                    { $eq: [{ $toString: "$_id" }, { $toString: "$$uid" }] },
                  ],
                },
              },
            },
          ],
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Group by gameMode
      {
        $group: {
          _id: "$gameMode",
          highestDifficultyUnlocked: { $max: "$difficulty" },
          totalRuns: { $sum: 1 },
          avgCompletionTime: { $avg: "$completionTime" },
          latestGame: { $last: "$$ROOT" },
          // ✅ Capture userId and userName at group level directly
          userId: { $first: "$userId" },
          userName: { $first: "$userInfo.nickname" },
        },
      },

      // 4️⃣ Project compact summary per gameMode
      {
        $project: {
          _id: 0,
          gameMode: "$_id",
          userId: 1,       // ✅ from group stage
          userName: 1,     // ✅ from group stage
          highestDifficultyUnlocked: 1,
          totalRuns: 1,
          averageCompletionTime: { $round: ["$avgCompletionTime", 2] },
          latestRating: {
            $cond: [
              { $in: ["$_id", ["OC", "UOT"]] },
              {
                stars: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $cond: [
                            {
                              $gt: [
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                                0,
                              ],
                            },
                            {
                              $divide: [
                                {
                                  $size: {
                                    $filter: {
                                      input: { $ifNull: ["$latestGame.tileClicks", []] },
                                      as: "click",
                                      cond: { $eq: ["$$click.wasCorrect", true] },
                                    },
                                  },
                                },
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                              ],
                            },
                            0,
                          ],
                        },
                        5,
                      ],
                    },
                    0,
                  ],
                },
                speedScore: {
                  $round: [
                    { $subtract: [100, { $ifNull: ["$latestGame.completionTime", 0] }] },
                    2,
                  ],
                },
                accuracyScore: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $cond: [
                            {
                              $gt: [
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                                0,
                              ],
                            },
                            {
                              $divide: [
                                {
                                  $size: {
                                    $filter: {
                                      input: { $ifNull: ["$latestGame.tileClicks", []] },
                                      as: "click",
                                      cond: { $eq: ["$$click.wasCorrect", true] },
                                    },
                                  },
                                },
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                              ],
                            },
                            0,
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                efficiencyScore: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $cond: [
                            {
                              $gt: [
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                                0,
                              ],
                            },
                            {
                              $divide: [
                                {
                                  $size: {
                                    $filter: {
                                      input: { $ifNull: ["$latestGame.tileClicks", []] },
                                      as: "click",
                                      cond: { $eq: ["$$click.wasCorrect", true] },
                                    },
                                  },
                                },
                                { $size: { $ifNull: ["$latestGame.tileClicks", []] } },
                              ],
                            },
                            0,
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
              },
              "$$REMOVE",
            ],
          },
          latestAudioTranscription: {
            $cond: [
              { $eq: ["$_id", "VF"] },
              "$latestGame.playerResponse",
              "$$REMOVE",
            ],
          },
        },
      },

      // 5️⃣ Reformat into user-level object
      {
        $group: {
          _id: null,
          userId: { $first: "$userId" },
          userName: { $first: "$userName" },
          gameProgress: {
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

      // 6️⃣ Final shape
      {
        $project: {
          _id: 0,
          userId: { $concat: ["usr_", { $toString: "$userId" }] },
          userName: 1,
          gameProgress: { $arrayToObject: "$gameProgress" },
        },
      },
    ]);

    return result[0] || { userId: `usr_${userId}`, gameProgress: {} };
  } catch (error) {
    catchError(error);
  }
};

interface IPaginationQuery {
  page?: number;
  limit?: number;
  searchTerm?:string
}



const findByResearcherUserIntoDb = async (query: IPaginationQuery) => {
  try {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = query.searchTerm || "";

    const result = await gameone.aggregate([
      // 1️⃣ filter non-deleted games
      {
        $match: {
          isDelete: false,
        },
      },

      // 2️⃣ join user collection
      {
        $lookup: {
          from: "users",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$uid"],
                },
              },
            },
            {
              $project: {
                name: 1,
                nickname: 1,
                age: 1,
                gender: 1,
                hobbies: 1,
                language: 1,
                email: 1,
              },
            },
          ],
          as: "userInfo",
        },
      },

      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 3️⃣ search filter
      {
        $match: {
          $or: [
            { "userInfo.nickname": { $regex: searchTerm, $options: "i" } },
            { gameMode: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },

      // 4️⃣ compute click metrics
      {
        $addFields: {
          totalClicks: {
            $size: { $ifNull: ["$tileClicks", []] },
          },
          correctClicks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tileClicks", []] },
                as: "click",
                cond: { $eq: ["$$click.wasCorrect", true] },
              },
            },
          },
        },
      },

      // 5️⃣ accuracy calculation
      {
        $addFields: {
          accuracyPercentage: {
            $cond: [
              { $gt: ["$totalClicks", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$correctClicks", "$totalClicks"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },

      // 6️⃣ add full game mode meaning
      {
        $addFields: {
          gameModeFullMeaning: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$gameMode", "OC"] },
                  then: "Object Categorisation (Find Game)",
                },
                {
                  case: { $eq: ["$gameMode", "UOT"] },
                  then: "Utility Of Things (Match Game)",
                },
                {
                  case: { $eq: ["$gameMode", "VF"] },
                  then: "Verbal Fluency (Speak Game)",
                },
              ],
              default: "$gameMode",
            },
          },
        },
      },

      // 7️⃣ final projection
    {
  $project: {
    _id: 0,

    gameMode: 1,
    gameModeFullMeaning: 1,

    sessionId: {
      $concat: [{ $toString: "$_id" }],
    },

    user: {
      userId: "$userInfo._id",
      name: "$userInfo.name",
      nickname: "$userInfo.nickname",
      age: "$userInfo.age",
      gender: "$userInfo.gender",
      hobbies: "$userInfo.hobbies",
      language: "$userInfo.language",
      email: "$userInfo.email",
    },

    gameData: {
      difficulty: "$difficulty",
      stage: "$stage",
      timestamp: "$timestamp",
      completionTime: "$completionTime",

      createdAt: "$createdAt",
      updatedAt: "$updatedAt",

      metrics: {
        totalHintsUsed: "$hintsUsed",
        accuracyPercentage: "$accuracyPercentage",
        instructionText: "$instructionText",
      },

      rawTileClicks: "$tileClicks",
    },

    createdAt: 1,
    updatedAt: 1
  },
},

      // 8️⃣ pagination
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    return {
      researchRequestID: `req_${Date.now()}`,
      exportDate: new Date().toISOString(),
      page,
      limit,
      result,
    };
  } catch (error) {
    catchError(error);
  }
};






const GameOneServices={
    recordedGameOneDataIntoDB,
    myGameLevelIntoDb,       
     trackingSummaryIntoDb,
    deleteGameOneDataIntoDb,
     findByResearcherUserIntoDb
};

export default GameOneServices;