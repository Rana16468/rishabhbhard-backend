"use strict";
// chatBotServicesModified.ts
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
exports.textToTextChatIntoDb = textToTextChatIntoDb;
exports.audioChatIntoDb = audioChatIntoDb;
exports.startAudioSession = startAudioSession;
exports.endAudioSession = endAudioSession;
exports.getChatHistory = getChatHistory;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../app/builder/QueryBuilder"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const AI_Integation_1 = require("../../utility/Ai_Integation/AI_Integation");
const chatbot_model_1 = __importDefault(require("./chatbot.model"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const chatbot_model_2 = __importDefault(require("./chatbot.model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadToS3_1 = require("../../utility/uploadToS3");
const config_1 = __importDefault(require("../../app/config"));
const deleteFromS3_1 = require("../../utility/deleteFromS3");
/* ======================== SESSION HELPERS ======================== */
function sendTextMessageToSession(text) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!AI_Integation_1.session)
            throw new Error("No active session");
        const s = AI_Integation_1.session;
        if (typeof s.sendClientContent !== "function")
            throw new Error("sendClientContent not found on session");
        yield s.sendClientContent({
            turns: [{ role: "user", parts: [{ text }] }],
            turnComplete: true,
        });
    });
}
function sendAudioMessageToSession(audioData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!AI_Integation_1.session)
            throw new Error("No active session");
        const s = AI_Integation_1.session;
        if (typeof s.sendRealtimeInput !== "function")
            throw new Error("sendRealtimeInput not found on session");
        yield s.sendRealtimeInput({
            mediaChunks: [{ mimeType: "audio/pcm", data: audioData }],
        });
    });
}
/* ======================== WAIT FOR AI ======================== */
function waitForAiResponse(timeout = 2000) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
/* ======================== TEXT CHAT ======================== */
function textToTextChatIntoDb(userId, text, history) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!text || !text.trim())
            throw new Error("Text cannot be empty");
        try {
            const sessionId = Date.now().toString();
            if (!AI_Integation_1.session)
                yield (0, AI_Integation_1.connectGemini)();
            (0, AI_Integation_1.resetTranscript)();
            yield sendTextMessageToSession(text);
            yield waitForAiResponse();
            const transcript = (0, AI_Integation_1.getCurrentTranscript)();
            const expression = (0, AI_Integation_1.getCurrentExpression)();
            yield (0, AI_Integation_1.saveConversationToDb)(userId, text);
            return {
                success: true,
                message: transcript,
                expression,
                sessionId,
                timestamp: new Date().toISOString(),
                historyCount: (history === null || history === void 0 ? void 0 : history.length) || 0,
            };
        }
        catch (error) {
            console.error("textToTextChatIntoDb error:", error);
            throw error;
        }
    });
}
/* ======================== AUDIO CHAT ======================== */
function audioChatIntoDb(userId, audioData, history) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!audioData || !audioData.trim())
            throw new Error("Audio data is required");
        try {
            const sessionId = Date.now().toString();
            if (!AI_Integation_1.session)
                yield (0, AI_Integation_1.connectGemini)();
            (0, AI_Integation_1.resetTranscript)();
            yield sendAudioMessageToSession(audioData);
            yield waitForAiResponse();
            const transcript = (0, AI_Integation_1.getCurrentTranscript)();
            const expression = (0, AI_Integation_1.getCurrentExpression)();
            yield (0, AI_Integation_1.saveConversationToDb)(userId, "User audio message");
            return {
                success: true,
                message: transcript,
                expression,
                sessionId,
                timestamp: new Date().toISOString(),
                historyCount: (history === null || history === void 0 ? void 0 : history.length) || 0,
            };
        }
        catch (error) {
            console.error("audioChatIntoDb error:", error);
            throw error;
        }
    });
}
/* ======================== SESSION MANAGEMENT ======================== */
function startAudioSession(userId, userProfile) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, AI_Integation_1.connectGemini)(userProfile);
        }
        catch (error) {
            console.error("Failed to start session:", error);
            throw error;
        }
    });
}
function endAudioSession() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, AI_Integation_1.disconnectSession)();
        }
        catch (error) {
            console.error("Error ending session:", error);
        }
    });
}
/* ======================== CHAT HISTORY ======================== */
function getChatHistory(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const qb = new QueryBuilder_1.default(chatbot_model_1.default.find({ userId }), {})
                .search([])
                .filter()
                .sort()
                .paginate()
                .fields();
            const history = yield qb.modelQuery;
            const meta = yield qb.countTotal();
            return { meta, history };
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, `Error retrieving chat history for user ${userId}`, error);
        }
    });
}
const deleteChatBotInfoInfoDb = (userId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield chatbot_model_1.default.deleteOne({
            _id: chatId,
            userId,
        });
        if (result.deletedCount === 0) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Chat not found", "");
        }
        return {
            status: true,
            message: "Chat deleted successfully",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
        throw error;
    }
});
const chatDataStoreIntoDb = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    try {
        const result = yield chatbot_model_1.default.create(Object.assign(Object.assign({}, payload), { userId }));
        return result;
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const conversationMemoryRecordedIntoDb = (req, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Audio file is required", "");
        }
        const bodyData = req.body;
        let audio_file = file.path.replace(/\\/g, "/");
        if (audio_file) {
            audio_file = yield (0, uploadToS3_1.uploadToS3)(file, config_1.default.file_path);
        }
        const result = yield chatbot_model_2.default.create(Object.assign(Object.assign({ userId }, bodyData), { audio_file }));
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to save conversation memory", "");
        }
        return {
            status: true,
            message: "Conversation memory recorded successfully",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findMyAllConversationIntoDb = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allConversationMemoryQuery = new QueryBuilder_1.default(chatbot_model_2.default
            .find({ userId }).populate([{ path: "userId", select: "name photo nickname" }]), query)
            .search(["reply", "question_category", "conversation_topic", "summary"])
            .filter()
            .sort()
            .paginate()
            .fields();
        const my_conversation_memories = yield allConversationMemoryQuery.modelQuery;
        const meta = yield allConversationMemoryQuery.countTotal();
        return { meta, my_conversation_memories };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findAllConversationIntoDb = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allConversationMemoryQuery = new QueryBuilder_1.default(chatbot_model_2.default
            .find({ userId }).populate([{ path: "userId", select: "name photo nickname" }]).sort({ createdAt: -1 }), query)
            .search(["reply", "question_category", "conversation_topic", "summary", "userId.name", "userId.nickname"])
            .filter()
            .paginate()
            .fields();
        const all_conversation_memories = yield allConversationMemoryQuery.modelQuery;
        const meta = yield allConversationMemoryQuery.countTotal();
        return { meta, all_conversation_memories };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const deleteConversationMemoryFromDb = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield chatbot_model_2.default.findOne({ _id: conversationId }).select("_id audio_file").lean();
        if (!isExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Conversation memory not found", "");
        }
        if (isExist.audio_file) {
            yield (0, deleteFromS3_1.deleteFromS3)(isExist.audio_file);
            const audioFilePath = path_1.default.join(__dirname, "../../../", isExist.audio_file);
            fs_1.default.unlink(audioFilePath, (err) => { if (err) {
                console.error("Error deleting audio file:", err);
            }
            else {
                console.log("Audio file deleted successfully");
            } });
            const result = yield chatbot_model_2.default.deleteOne({
                _id: conversationId
            });
            if (result.deletedCount === 0) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Conversation memory not found", "");
            }
            ;
            return {
                status: true,
                message: "Conversation memory deleted successfully",
            };
        }
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
// ─── Constants ───────────────────────────────────────────────────────────────
const MONTH_NAMES = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const TOTAL_MONTHS = 12;
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Safely compute a percentage string. */
const toPercent = (num, total) => total === 0 ? "0.00%" : `${((num / total) * 100).toFixed(2)}%`;
/** Build inclusive UTC date range for a given year. */
const yearDateRange = (year) => ({
    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
    $lte: new Date(`${year}-12-31T23:59:59.999Z`),
});
/** Conditionally sum a boolean field in a MongoDB $group stage. */
const boolSum = (field, value) => ({
    $sum: { $cond: [{ $eq: [`$${field}`, value] }, 1, 0] },
});
// ─── MongoDB pipeline ────────────────────────────────────────────────────────
const buildAggregationPipeline = (year) => [
    {
        $match: {
            createdAt: yearDateRange(year),
            isDeleted: { $ne: true },
        },
    },
    {
        $group: {
            _id: { month: { $month: "$createdAt" }, user: "$userId" },
            totalConversations: { $sum: 1 },
            icopeTrue: boolSum("icope_health_trigger", true),
            icopeFalse: boolSum("icope_health_trigger", false),
            distressTrue: boolSum("mental_distress", true),
            distressFalse: boolSum("mental_distress", false),
        },
    },
    {
        $project: {
            _id: 0,
            month: "$_id.month",
            userId: { $toString: "$_id.user" },
            totalConversations: 1,
            icopeTrue: 1, icopeFalse: 1,
            distressTrue: 1, distressFalse: 1,
        },
    },
    { $sort: { month: 1, userId: 1 } },
];
// ─── Builders ────────────────────────────────────────────────────────────────
/** Construct the per-user monthly stat row. */
const buildUserStat = (row) => ({
    month: row.month,
    monthName: MONTH_NAMES[row.month],
    userId: row.userId,
    totalConversations: row.totalConversations,
    icopeTrue: row.icopeTrue,
    icopeFalse: row.icopeFalse,
    distressTrue: row.distressTrue,
    distressFalse: row.distressFalse,
    icopeRate: toPercent(row.icopeTrue, row.totalConversations),
    distressRate: toPercent(row.distressTrue, row.totalConversations),
});
/** Initialise an empty monthly aggregate bucket. */
const initMonthlyAggregate = (month) => ({
    month,
    monthName: MONTH_NAMES[month],
    totalConversations: 0,
    uniqueUsers: 0,
    icopeTrue: 0, icopeFalse: 0,
    distressTrue: 0, distressFalse: 0,
    icopeRate: "0.00%",
    distressRate: "0.00%",
    users: [],
});
/** Accumulate one raw row into an existing monthly aggregate (mutates). */
const accumulateIntoAggregate = (agg, row) => {
    agg.totalConversations += row.totalConversations;
    agg.uniqueUsers += 1;
    agg.icopeTrue += row.icopeTrue;
    agg.icopeFalse += row.icopeFalse;
    agg.distressTrue += row.distressTrue;
    agg.distressFalse += row.distressFalse;
};
/**
 * Single-pass transform: builds both the monthMap and userMap simultaneously
 * so the raw stats array is iterated only once.
 */
const transformRawStats = (rawStats) => {
    const monthMap = new Map();
    const userMap = new Map();
    for (const row of rawStats) {
        // ── Monthly bucket ──────────────────────────────────────────────────────
        if (!monthMap.has(row.month)) {
            monthMap.set(row.month, initMonthlyAggregate(row.month));
        }
        const agg = monthMap.get(row.month);
        accumulateIntoAggregate(agg, row);
        agg.users.push(buildUserStat(row));
        // ── User accumulator ────────────────────────────────────────────────────
        if (!userMap.has(row.userId)) {
            userMap.set(row.userId, {
                totalConversations: 0,
                activeMonths: new Set(),
                icopeTrue: 0,
                distressTrue: 0,
                peakMonth: row.month,
                peakMonthCount: 0,
            });
        }
        const u = userMap.get(row.userId);
        u.totalConversations += row.totalConversations;
        u.activeMonths.add(row.month);
        u.icopeTrue += row.icopeTrue;
        u.distressTrue += row.distressTrue;
        if (row.totalConversations > u.peakMonthCount) {
            u.peakMonthCount = row.totalConversations;
            u.peakMonth = row.month;
        }
    }
    // Finalise aggregate rates
    for (const agg of monthMap.values()) {
        agg.icopeRate = toPercent(agg.icopeTrue, agg.totalConversations);
        agg.distressRate = toPercent(agg.distressTrue, agg.totalConversations);
    }
    return { monthMap, userMap };
};
// ─── Derived outputs ─────────────────────────────────────────────────────────
const buildMonthlyBreakdown = (monthMap) => [...monthMap.values()].sort((a, b) => a.month - b.month);
const buildUserSummaries = (userMap) => [...userMap.entries()]
    .map(([userId, u]) => ({
    userId,
    totalConversations: u.totalConversations,
    activeMonths: u.activeMonths.size,
    avgConversationsPerMonth: (u.totalConversations / u.activeMonths.size).toFixed(2),
    icopeTrue: u.icopeTrue,
    distressTrue: u.distressTrue,
    icopeRate: toPercent(u.icopeTrue, u.totalConversations),
    distressRate: toPercent(u.distressTrue, u.totalConversations),
    peakMonth: u.peakMonth,
    peakMonthName: MONTH_NAMES[u.peakMonth],
}))
    .sort((a, b) => b.totalConversations - a.totalConversations);
const buildChartData = (monthMap) => {
    var _a, _b, _c, _d;
    const labels = [];
    const totalConversations = [];
    const uniqueUsers = [];
    const icopeTriggers = [];
    const distressCases = [];
    for (let m = 1; m <= TOTAL_MONTHS; m++) {
        const agg = monthMap.get(m);
        labels.push(MONTH_NAMES[m]);
        totalConversations.push((_a = agg === null || agg === void 0 ? void 0 : agg.totalConversations) !== null && _a !== void 0 ? _a : 0);
        uniqueUsers.push((_b = agg === null || agg === void 0 ? void 0 : agg.uniqueUsers) !== null && _b !== void 0 ? _b : 0);
        icopeTriggers.push((_c = agg === null || agg === void 0 ? void 0 : agg.icopeTrue) !== null && _c !== void 0 ? _c : 0);
        distressCases.push((_d = agg === null || agg === void 0 ? void 0 : agg.distressTrue) !== null && _d !== void 0 ? _d : 0);
    }
    return { labels, totalConversations, uniqueUsers, icopeTriggers, distressCases };
};
const buildSummary = (chartData, userSummaries, userMap) => {
    var _a, _b, _c;
    const totalConversations = chartData.totalConversations.reduce((a, b) => a + b, 0);
    const totalIcopeTriggers = chartData.icopeTriggers.reduce((a, b) => a + b, 0);
    const totalDistressCases = chartData.distressCases.reduce((a, b) => a + b, 0);
    const peakMonthIdx = chartData.totalConversations.indexOf(Math.max(...chartData.totalConversations));
    return {
        totalConversations,
        totalUniqueUsers: userMap.size,
        totalIcopeTriggers,
        totalDistressCases,
        overallIcopeRate: toPercent(totalIcopeTriggers, totalConversations),
        overallDistressRate: toPercent(totalDistressCases, totalConversations),
        mostActiveMonth: (_a = MONTH_NAMES[peakMonthIdx + 1]) !== null && _a !== void 0 ? _a : "N/A",
        mostActiveUser: (_c = (_b = userSummaries[0]) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : "N/A",
    };
};
// ─── Public service function ──────────────────────────────────────────────────
/**
 * Fetches and transforms conversation growth analytics for a given year.
 *
 * Improvements over v1:
 *  - Single-pass O(n) transform (no double iteration over rawStats)
 *  - Pipeline factored out for easy unit-testing / reuse
 *  - Peak-month tracked inline (no extra reduce)
 *  - Boolean $sum helper eliminates copy-paste in the pipeline
 *  - All builders are pure functions — easy to mock and test in isolation
 *  - Strict typing throughout; no implicit `any`
 */
const getConversationGrowthIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
        const rawStats = yield chatbot_model_2.default.aggregate(buildAggregationPipeline(year));
        const { monthMap, userMap } = transformRawStats(rawStats);
        const monthlyBreakdown = buildMonthlyBreakdown(monthMap);
        const userSummaries = buildUserSummaries(userMap);
        const chartData = buildChartData(monthMap);
        const summary = buildSummary(chartData, userSummaries, userMap);
        return {
            year,
            generatedAt: new Date().toISOString(),
            chartData,
            monthlyBreakdown,
            userSummaries,
            summary,
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
/* ======================== EXPORT ======================== */
const chatBotServices = {
    startAudioSession,
    endAudioSession,
    textToTextChatIntoDb,
    audioChatIntoDb,
    getChatHistory,
    deleteChatBotInfoInfoDb,
    chatDataStoreIntoDb,
    conversationMemoryRecordedIntoDb,
    findMyAllConversationIntoDb,
    findAllConversationIntoDb,
    deleteConversationMemoryFromDb,
    getConversationGrowthIntoDb
};
exports.default = chatBotServices;
