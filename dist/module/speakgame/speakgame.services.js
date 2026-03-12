"use strict";
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
const mongoose_1 = require("mongoose");
const speakgame_model_1 = __importDefault(require("./speakgame.model"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const gameone_model_1 = __importDefault(require("../gameone/gameone.model"));
const recordedSpeakGameDataIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid userId", "");
        }
        const result = yield speakgame_model_1.default.create(Object.assign(Object.assign({}, payload), { userId: new mongoose_1.Types.ObjectId(userId) }));
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, 'issues by the same game recorded server issues', '');
        }
        return {
            status: true,
            message: "Successfully recorded"
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const myGameLevelIntoDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield speakgame_model_1.default
            .findOne({ userId })
            .sort({ createdAt: -1 }).select("game_type level stage total_stages_in_level")
            .lean();
        return result;
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const deleteSpeakGameIntoDb = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExistGame = yield speakgame_model_1.default.exists({ userId, _id: id });
        if (!isExistGame) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, "This game data does not exist", "");
        }
        // Delete the document
        const result = yield speakgame_model_1.default.deleteOne({ userId, _id: id });
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
const trackingSpeakSummaryIntoDb = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 5;
        const skip = (page - 1) * limit;
        const period = query.period;
        // ================= DATE FILTER USING SWITCH CASE =================
        let dateFilter = {};
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
        const summary = yield speakgame_model_1.default.aggregate([
            // ================= MATCH =================
            {
                $match: Object.assign({ userId: new mongoose_1.Types.ObjectId(userId) }, dateFilter),
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
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Speak summary fetch failed", error);
    }
});
const gameGraphIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const year = query.year ? parseInt(query.year) : new Date().getFullYear();
        const previousYear = year - 1;
        const gameModeFilter = query.gameMode ? { gameMode: query.gameMode } : {};
        // ─── Current year: group by month ───
        const currentYearStats = yield gameone_model_1.default.aggregate([
            {
                $match: Object.assign(Object.assign({ isDelete: false }, gameModeFilter), { createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
                    } }),
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalSessions: { $sum: 1 },
                    totalHintsUsed: { $sum: "$hintsUsed" },
                    avgCompletionTime: { $avg: { $ifNull: ["$completionTime", 0] } },
                    totalCorrectClicks: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ["$tileClicks", []] },
                                    as: "click",
                                    cond: { $eq: ["$$click.wasCorrect", true] },
                                },
                            },
                        },
                    },
                    totalWrongClicks: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ["$tileClicks", []] },
                                    as: "click",
                                    cond: { $eq: ["$$click.wasCorrect", false] },
                                },
                            },
                        },
                    },
                    totalRepeatButtonClicks: {
                        $sum: { $size: { $ifNull: ["$repeatButtonClicks", []] } },
                    },
                    // ✅ NEW: collect unique userIds who played this month
                    uniqueUserIds: { $addToSet: "$userId" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    totalSessions: 1,
                    totalHintsUsed: 1,
                    avgCompletionTime: { $round: ["$avgCompletionTime", 2] },
                    totalCorrectClicks: 1,
                    totalWrongClicks: 1,
                    totalRepeatButtonClicks: 1,
                    // ✅ NEW: count the unique users
                    totalUniqueUsers: { $size: "$uniqueUserIds" },
                },
            },
        ]);
        // ─── Previous year: total sessions only ───
        const previousYearStats = yield gameone_model_1.default.aggregate([
            {
                $match: Object.assign(Object.assign({ isDelete: false }, gameModeFilter), { createdAt: {
                        $gte: new Date(`${previousYear}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${previousYear}-12-31T23:59:59.999Z`),
                    } }),
            },
            { $count: "totalSessions" },
        ]);
        // ─── Build full 12-month array in JavaScript ───
        const monthlyStats = Array.from({ length: 12 }, (_, i) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const monthNum = i + 1;
            const found = currentYearStats.find((d) => d.month === monthNum);
            const totalCorrect = (_a = found === null || found === void 0 ? void 0 : found.totalCorrectClicks) !== null && _a !== void 0 ? _a : 0;
            const totalWrong = (_b = found === null || found === void 0 ? void 0 : found.totalWrongClicks) !== null && _b !== void 0 ? _b : 0;
            const totalClicks = totalCorrect + totalWrong;
            const accuracy = totalClicks > 0
                ? parseFloat(((totalCorrect / totalClicks) * 100).toFixed(2))
                : 0;
            return {
                year,
                month: monthNum,
                totalSessions: (_c = found === null || found === void 0 ? void 0 : found.totalSessions) !== null && _c !== void 0 ? _c : 0,
                totalHintsUsed: (_d = found === null || found === void 0 ? void 0 : found.totalHintsUsed) !== null && _d !== void 0 ? _d : 0,
                avgCompletionTime: (_e = found === null || found === void 0 ? void 0 : found.avgCompletionTime) !== null && _e !== void 0 ? _e : 0,
                totalCorrectClicks: totalCorrect,
                totalWrongClicks: totalWrong,
                totalRepeatButtonClicks: (_f = found === null || found === void 0 ? void 0 : found.totalRepeatButtonClicks) !== null && _f !== void 0 ? _f : 0,
                accuracyRate: accuracy,
                // ✅ NEW: how many unique users completed sessions this month
                totalUniqueUsers: (_g = found === null || found === void 0 ? void 0 : found.totalUniqueUsers) !== null && _g !== void 0 ? _g : 0,
            };
        });
        // ─── Overall totals across the year ───
        const totalSessions = monthlyStats.reduce((s, m) => s + m.totalSessions, 0);
        const totalCorrect = monthlyStats.reduce((s, m) => s + m.totalCorrectClicks, 0);
        const totalWrong = monthlyStats.reduce((s, m) => s + m.totalWrongClicks, 0);
        const totalClicks = totalCorrect + totalWrong;
        const overallAccuracy = totalClicks > 0
            ? parseFloat(((totalCorrect / totalClicks) * 100).toFixed(2))
            : 0;
        // ─── Year-over-year session growth % ───
        const currentYearTotal = totalSessions;
        const previousYearTotal = (_b = (_a = previousYearStats[0]) === null || _a === void 0 ? void 0 : _a.totalSessions) !== null && _b !== void 0 ? _b : 0;
        let yearlyGrowth = 0;
        if (previousYearTotal > 0) {
            yearlyGrowth = parseFloat((((currentYearTotal - previousYearTotal) / previousYearTotal) * 100).toFixed(2));
        }
        else if (currentYearTotal > 0) {
            yearlyGrowth = 100;
        }
        return {
            year,
            totalSessions,
            totalCorrectClicks: totalCorrect,
            totalWrongClicks: totalWrong,
            overallAccuracy,
            yearlyGrowth,
            monthlyStats,
        };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to fetch game graph stats", error);
    }
});
const speakGameServices = {
    recordedSpeakGameDataIntoDB,
    myGameLevelIntoDb,
    deleteSpeakGameIntoDb,
    trackingSpeakSummaryIntoDb,
    gameGraphIntoDb
};
exports.default = speakGameServices;
