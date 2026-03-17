"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBySpecificResearcherUserIntoDb = exports.findByResearcherUserIntoDb = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const gameone_model_1 = __importDefault(require("./gameone.model"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const mongoose_1 = __importStar(require("mongoose"));
const uploadToS3_1 = require("../../utility/uploadToS3");
const config_1 = __importDefault(require("../../app/config"));
const deleteFromS3_1 = require("../../utility/deleteFromS3");
const QueryBuilder_1 = __importDefault(require("../../app/builder/QueryBuilder"));
const archiver_1 = __importDefault(require("archiver"));
const axios_1 = __importDefault(require("axios"));
const recordedGameOneDataIntoDB = (userId, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const bodyData = req.body;
        // Prepare the payload
        const payload = Object.assign(Object.assign({ userId }, bodyData), ((file === null || file === void 0 ? void 0 : file.path) && { audioClipUrl: file.path.replace(/\\/g, "/") }));
        if (file) {
            // updateData.photo = file?.path?.replace(/\\/g, "/");
            payload.audioClipUrl = yield (0, uploadToS3_1.uploadToS3)(file, config_1.default.file_path);
        }
        const result = yield gameone_model_1.default.create(payload);
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, (file === null || file === void 0 ? void 0 : file.path)
                ? "Issues in the speak game recorded section"
                : "Issues in the find and match game recorded section", "");
        }
        return { status: true, message: "Successfully recorded" };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const myGameLevelIntoDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectUserId = new mongoose_1.Types.ObjectId(userId);
        const result = yield gameone_model_1.default.aggregate([
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
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const deleteGameOneDataIntoDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if document exists for this user
        const isExistGame = yield gameone_model_1.default.findOne({ _id: id }, { _id: 1, audioClipUrl: 1 });
        if (!isExistGame) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, "This game data does not exist", "");
        }
        if (isExistGame === null || isExistGame === void 0 ? void 0 : isExistGame.audioClipUrl) {
            yield (0, deleteFromS3_1.deleteFromS3)(isExistGame === null || isExistGame === void 0 ? void 0 : isExistGame.audioClipUrl);
        }
        // Delete the document
        const result = yield gameone_model_1.default.deleteOne({ _id: id });
        if (result.deletedCount !== 1) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, "Failed to delete the game data", "");
        }
        return {
            status: true,
            message: "Successfully deleted",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const trackingSummaryIntoDb = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectUserId = new mongoose_1.Types.ObjectId(userId);
        const result = yield gameone_model_1.default.aggregate([
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
                    userId: 1, // ✅ from group stage
                    userName: 1, // ✅ from group stage
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
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findByResearcherUserIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchTerm = query.searchTerm || "";
        const result = yield gameone_model_1.default.aggregate([
            // 1️⃣ filter non-deleted games
            { $match: { isDelete: false } },
            // 2️⃣ join users collection
            {
                $lookup: {
                    from: "users",
                    let: { uid: "$userId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
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
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
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
                                { case: { $eq: ["$gameMode", "OC"] }, then: "Object Categorisation (Find Game)" },
                                { case: { $eq: ["$gameMode", "UOT"] }, then: "Utility Of Things (Match Game)" },
                                { case: { $eq: ["$gameMode", "VF"] }, then: "Verbal Fluency (Speak Game)" },
                            ],
                            default: "$gameMode",
                        },
                    },
                },
            },
            // 7️⃣ final projection including VF specific fields
            {
                $project: {
                    _id: 0,
                    gameMode: 1,
                    gameModeFullMeaning: 1,
                    sessionId: { $toString: "$_id" },
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
                        // VF specific
                        playerResponse: "$playerResponse",
                        audioClipUrl: "$audioClipUrl",
                        valid_words: "$valid_words",
                        invalid_words: "$invalid_words",
                    },
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            // 8️⃣ pagination using $facet
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    meta: [{ $count: "total" }],
                },
            },
        ]);
        const totalRecords = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.meta[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
        return {
            researchRequestID: `req_${Date.now()}`,
            exportDate: new Date().toISOString(),
            page,
            limit,
            totalRecords,
            data: ((_c = result[0]) === null || _c === void 0 ? void 0 : _c.data) || [],
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
exports.findByResearcherUserIntoDb = findByResearcherUserIntoDb;
const findBySpecificResearcherUserIntoDb = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchTerm = query.searchTerm || "";
        const result = yield gameone_model_1.default.aggregate([
            // 1️⃣ filter non-deleted games for specific user
            {
                $match: {
                    isDelete: false,
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                },
            },
            // 2️⃣ join users collection
            {
                $lookup: {
                    from: "users",
                    let: { uid: "$userId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
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
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
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
            // 6️⃣ game mode full meaning
            {
                $addFields: {
                    gameModeFullMeaning: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$gameMode", "OC"] }, then: "Object Categorisation (Find Game)" },
                                { case: { $eq: ["$gameMode", "UOT"] }, then: "Utility Of Things (Match Game)" },
                                { case: { $eq: ["$gameMode", "VF"] }, then: "Verbal Fluency (Speak Game)" },
                            ],
                            default: "$gameMode",
                        },
                    },
                },
            },
            // 7️⃣ projection including VF extra fields
            {
                $project: {
                    _id: 0,
                    gameMode: 1,
                    gameModeFullMeaning: 1,
                    sessionId: { $toString: "$_id" },
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
                        // VF specific fields
                        playerResponse: "$playerResponse",
                        audioClipUrl: "$audioClipUrl",
                        valid_words: "$valid_words",
                        invalid_words: "$invalid_words",
                    },
                    createdAt: 1,
                    updatedAt: 1,
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
        const totalRecords = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.meta[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
        return {
            researchRequestID: `req_${Date.now()}`,
            exportDate: new Date().toISOString(),
            page,
            limit,
            totalRecords,
            data: ((_c = result[0]) === null || _c === void 0 ? void 0 : _c.data) || [],
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
exports.findBySpecificResearcherUserIntoDb = findBySpecificResearcherUserIntoDb;
const findByAllDownloadResearcherUserIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchTerm = query.searchTerm || "";
        const result = yield gameone_model_1.default.aggregate([
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
                        $toString: "$_id",
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
                    updatedAt: 1,
                },
            },
        ]);
        return {
            researchRequestID: `req_${Date.now()}`,
            exportDate: new Date().toISOString(),
            totalRecords: result.length,
            data: result,
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const downloadBySpeckGameIntoDb = (userId, query, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allConversationMemoryQuery = new QueryBuilder_1.default(gameone_model_1.default
            .find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            gameMode: "VF",
            audioClipUrl: { $ne: null, $exists: true }
        })
            .select("audioClipUrl"), query)
            .filter()
            .fields();
        const files = yield allConversationMemoryQuery.modelQuery;
        if (!(files === null || files === void 0 ? void 0 : files.length)) {
            throw new Error("No audio files found");
        }
        const zipName = `vf_audio_${Date.now()}.zip`;
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        archive.on("error", (err) => {
            console.error("Archive error:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: "ZIP creation failed" });
            }
        });
        archive.pipe(res);
        // 🔥 Parallel download streams
        const downloadTasks = files.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const audioUrl = item.audioClipUrl;
                const response = yield (0, axios_1.default)({
                    method: "GET",
                    url: audioUrl,
                    responseType: "stream"
                });
                const fileName = audioUrl.split("/").pop() || `${item._id}.wav`;
                archive.append(response.data, { name: fileName });
            }
            catch (err) {
                console.error("Failed to download:", item.audioClipUrl);
            }
        }));
        yield Promise.all(downloadTasks);
        yield archive.finalize();
    }
    catch (error) {
        console.error(error);
        if (!res.headersSent) {
            throw error;
        }
    }
});
const GameOneServices = {
    recordedGameOneDataIntoDB,
    myGameLevelIntoDb,
    trackingSummaryIntoDb,
    deleteGameOneDataIntoDb,
    findByResearcherUserIntoDb: exports.findByResearcherUserIntoDb,
    findBySpecificResearcherUserIntoDb: exports.findBySpecificResearcherUserIntoDb,
    findByAllDownloadResearcherUserIntoDb,
    downloadBySpeckGameIntoDb
};
exports.default = GameOneServices;
