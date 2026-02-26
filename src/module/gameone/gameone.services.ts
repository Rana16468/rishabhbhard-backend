import httpStatus from "http-status";
import catchError from "../../app/error/catchError";
import gameone from "./gameone.model";
import ApiError from "../../app/error/ApiError";
import { Types } from "mongoose";
import { Request } from "express";



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
}


interface IPaginationQuery {
  page?: number;
  limit?: number;
}

const findByResearcherUserIntoDb = async (
  userId: string,
  query: IPaginationQuery
) => {
  try {
    const objectUserId = new Types.ObjectId(userId);

    // ✅ safe pagination values
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await gameone.aggregate([
      {
        $match: {
          userId: objectUserId,
          isDelete: false,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          totalClicks: { $size: { $ifNull: ["$tileClicks", []] } },
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

      {
        $addFields: {
          accuracyPercentage: {
            $cond: [
              { $gt: ["$totalClicks", 0] },
              {
                $multiply: [
                  { $divide: ["$correctClicks", "$totalClicks"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      // ⭐ Pagination + Count
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                sessionId: { $concat: ["sess_", { $toString: "$_id" }] },
                userId: { $toString: "$userId" },

                userDemographics: {
                  age: "$userInfo.age",
                  gender: "$userInfo.gender",
                  hobbies: "$userInfo.hobbies",
                  primaryLanguage: "$userInfo.primaryLanguage",
                  secondaryLanguage: "$userInfo.secondaryLanguage",
                },

                gameData: {
                  gameMode: "$gameMode",
                  timestamp: "$timestamp",
                  difficulty: "$difficulty",
                  stage: "$stage",
                  completionTime: "$completionTime",

                  metrics: {
                    totalHintsUsed: "$hintsUsed",
                    totalRepeatInstructions: {
                      $size: { $ifNull: ["$repeatButtonClicks", []] },
                    },
                    accuracyPercentage: {
                      $round: ["$accuracyPercentage", 2],
                    },
                  },

                  rawTileClicks: "$tileClicks",
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const data = result[0]?.data || [];
    const totalRecords = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      researchRequestID: `req_${Date.now()}`,
      exportDate: new Date().toISOString(),
      currentPage: page,
      pageSize: limit,
      totalPages,
      totalRecords,
      data,
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