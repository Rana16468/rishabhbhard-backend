// chatBotServicesModified.ts

import httpStatus from "http-status";
import QueryBuilder from "../../app/builder/QueryBuilder";
import ApiError from "../../app/error/ApiError";
import {
  session,
  connectGemini,
  disconnectSession,
  saveConversationToDb,
  getCurrentTranscript,
  getCurrentExpression,
  resetTranscript,
} from "../../utility/Ai_Integation/AI_Integation";
import ChatHistoryModel from "./chatbot.model";
import catchError from "../../app/error/catchError";
import { Part } from "@google/genai";
import { partialUtil } from "zod/lib/helpers/partialUtil";
import { IChatHistory } from "./chatbot.interface";
import { Request } from "express";
import conversationmemorys from "./chatbot.model";

import fs from "fs";
import path from "path";

/* ======================== INTERFACES ======================== */
export interface UserProfile {
  nickname?: string;
  gender?: "male" | "female";
  age?: number;
  hobbies?: string[];
}

/* ======================== SESSION HELPERS ======================== */
async function sendTextMessageToSession(text: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const s: any = session;

  if (typeof s.sendClientContent !== "function")
    throw new Error("sendClientContent not found on session");

  await s.sendClientContent({
    turns: [{ role: "user", parts: [{ text }] }],
    turnComplete: true,
  });
}

async function sendAudioMessageToSession(audioData: string): Promise<void> {
  if (!session) throw new Error("No active session");

  const s: any = session;

  if (typeof s.sendRealtimeInput !== "function")
    throw new Error("sendRealtimeInput not found on session");

  await s.sendRealtimeInput({
    mediaChunks: [{ mimeType: "audio/pcm", data: audioData }],
  });
}

/* ======================== WAIT FOR AI ======================== */
function waitForAiResponse(timeout = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/* ======================== TEXT CHAT ======================== */
export async function textToTextChatIntoDb(
  userId: string,
  text: string,
  history?: any[]
) {
  if (!text || !text.trim()) throw new Error("Text cannot be empty");

  try {
    const sessionId = Date.now().toString();

    if (!session) await connectGemini();

    resetTranscript();

    await sendTextMessageToSession(text);
    await waitForAiResponse();

    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    await saveConversationToDb(userId, text);

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0,
    };
  } catch (error) {
    console.error("textToTextChatIntoDb error:", error);
    throw error;
  }
}

/* ======================== AUDIO CHAT ======================== */
export async function audioChatIntoDb(
  userId: string,
  audioData: string,
  history?: any[]
): Promise<{
  success: true;
  message: string;
  expression: string;
  sessionId: string;
  timestamp: string;
  historyCount: number;
}> {
  if (!audioData || !audioData.trim())
    throw new Error("Audio data is required");

  try {
    const sessionId = Date.now().toString();

    if (!session) await connectGemini();

    resetTranscript();

    await sendAudioMessageToSession(audioData);
    await waitForAiResponse();

    const transcript = getCurrentTranscript();
    const expression = getCurrentExpression();

    await saveConversationToDb(userId, "User audio message");

    return {
      success: true,
      message: transcript,
      expression,
      sessionId,
      timestamp: new Date().toISOString(),
      historyCount: history?.length || 0,
    };
  } catch (error) {
    console.error("audioChatIntoDb error:", error);
    throw error;
  }
}

/* ======================== SESSION MANAGEMENT ======================== */
export async function startAudioSession(
  userId: string,
  userProfile?: UserProfile
) {
  try {
    return await connectGemini(userProfile);
  } catch (error) {
    console.error("Failed to start session:", error);
    throw error;
  }
}

export async function endAudioSession(): Promise<void> {
  try {
    await disconnectSession();
  } catch (error) {
    console.error("Error ending session:", error);
  }
}

/* ======================== CHAT HISTORY ======================== */
export async function getChatHistory(userId: string) {
  try {
    const qb = new QueryBuilder(ChatHistoryModel.find({ userId }), {})
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const history = await qb.modelQuery;
    const meta = await qb.countTotal();

    return { meta, history };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Error retrieving chat history for user ${userId}`,
      error
    );
  }
}

const deleteChatBotInfoInfoDb = async (userId: string, chatId: string) => {
  try {
    const result = await ChatHistoryModel.deleteOne({
      _id: chatId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Chat not found", "");
    }

    return {
      status: true,
      message: "Chat deleted successfully",
    };
  } catch (error) {
    catchError(error);
    throw error;
  }
};


const chatDataStoreIntoDb=async(payload:Partial<IChatHistory>, userId:string)=>{

      try{
        const result=await ChatHistoryModel.create({...payload, userId});

         return result;

      }
      catch(error){
        catchError(error);
      }


    
};


const  conversationMemoryRecordedIntoDb=async(req:Request, userId:string)=>{

    try{
     const file = req.file;
      if (!file) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Audio file is required", "");
      }
    const bodyData = req.body;
    const audio_file=file.path.replace(/\\/g, "/");


    const result=await conversationmemorys.create({
      userId,
      ...bodyData,
      audio_file
    });

    if(!result){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to save conversation memory", "");
    }

     return {
       status : true , 
       message : "Conversation memory recorded successfully",
     }

    }
    catch(error){
      catchError(error);

    }
};


const findMyAllConversationIntoDb = async (userId:string ,query: Record<string, unknown>) => {
  try {
    const allConversationMemoryQuery = new QueryBuilder(
      conversationmemorys
        .find({ userId }).populate([{ path: "userId", select: "name photo nickname" }]),
      query,
    )
      .search(["reply", "question_category", "conversation_topic", "summary"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const my_conversation_memories = await  allConversationMemoryQuery.modelQuery;
    const meta = await  allConversationMemoryQuery.countTotal();

    return { meta, my_conversation_memories };
  } catch (error) {
    catchError(error);
  }
};

const findAllConversationIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allConversationMemoryQuery = new QueryBuilder(
      conversationmemorys
        .find({  }).populate([{ path: "userId", select: "name photo nickname" }]).sort({ createdAt: -1 }),
      query,
    )
      .search(["reply", "question_category", "conversation_topic", "summary", "userId.name", "userId.nickname"])
      .filter()
      .paginate()
      .fields();



    const all_conversation_memories = await  allConversationMemoryQuery.modelQuery;
    const meta = await  allConversationMemoryQuery.countTotal();

    return { meta,  all_conversation_memories };
  } catch (error) {
    catchError(error);
  }
};


const deleteConversationMemoryFromDb = async ( conversationId: string) => {
  try {


      const isExist = await conversationmemorys.findOne({ _id: conversationId }).select("_id audio_file").lean();



      if(!isExist){
        throw new ApiError(httpStatus.NOT_FOUND, "Conversation memory not found", "");
      }

      if(isExist.audio_file){
        const audioFilePath = path.join(__dirname, "../../../", isExist.audio_file);

        fs.unlink(audioFilePath, (err) => {       if (err) {        console.error("Error deleting audio file:", err);      } else {        console.log("Audio file deleted successfully");      }    });


    const result = await conversationmemorys.deleteOne({
      _id: conversationId
    });
    
    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Conversation memory not found", "");
    };

    return {
      status: true,
      message: "Conversation memory deleted successfully",
    }
  }
}
  catch(error){
    catchError(error);
  } 
};


// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthlyUserStat {
  month: number;
  monthName: string;
  userId: string;
  totalConversations: number;
  icopeTrue: number;
  icopeFalse: number;
  distressTrue: number;
  distressFalse: number;
  icopeRate: string;
  distressRate: string;
}

export interface MonthlyAggregate {
  month: number;
  monthName: string;
  totalConversations: number;
  uniqueUsers: number;
  icopeTrue: number;
  icopeFalse: number;
  distressTrue: number;
  distressFalse: number;
  icopeRate: string;
  distressRate: string;
  users: MonthlyUserStat[];
}

export interface UserOverallStat {
  userId: string;
  totalConversations: number;
  activeMonths: number;
  avgConversationsPerMonth: string;
  icopeTrue: number;
  distressTrue: number;
  icopeRate: string;
  distressRate: string;
  peakMonth: number;
  peakMonthName: string;
}

export interface AnalysisReport {
  year: number;
  generatedAt: string;
  chartData: {
    labels: string[];
    totalConversations: number[];
    uniqueUsers: number[];
    icopeTriggers: number[];
    distressCases: number[];
  };
  monthlyBreakdown: MonthlyAggregate[];
  userSummaries: UserOverallStat[];
  summary: {
    totalConversations: number;
    totalUniqueUsers: number;
    totalIcopeTriggers: number;
    totalDistressCases: number;
    overallIcopeRate: string;
    overallDistressRate: string;
    mostActiveMonth: string;
    mostActiveUser: string;
  };
}

// ─── Internal aggregation shape returned by MongoDB ─────────────────────────

interface RawStat {
  month: number;
  userId: string;
  totalConversations: number;
  icopeTrue: number;
  icopeFalse: number;
  distressTrue: number;
  distressFalse: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const TOTAL_MONTHS = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely compute a percentage string. */
const toPercent = (num: number, total: number): string =>
  total === 0 ? "0.00%" : `${((num / total) * 100).toFixed(2)}%`;

/** Build inclusive UTC date range for a given year. */
const yearDateRange = (year: number) => ({
  $gte: new Date(`${year}-01-01T00:00:00.000Z`),
  $lte: new Date(`${year}-12-31T23:59:59.999Z`),
});

/** Conditionally sum a boolean field in a MongoDB $group stage. */
const boolSum = (field: string, value: boolean) => ({
  $sum: { $cond: [{ $eq: [`$${field}`, value] }, 1, 0] },
});

// ─── MongoDB pipeline ────────────────────────────────────────────────────────

const buildAggregationPipeline = (year: number) => [
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
      icopeTrue:    boolSum("icope_health_trigger", true),
      icopeFalse:   boolSum("icope_health_trigger", false),
      distressTrue:  boolSum("mental_distress", true),
      distressFalse: boolSum("mental_distress", false),
    },
  },
  {
    $project: {
      _id: 0,
      month:  "$_id.month",
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
const buildUserStat = (row: RawStat): MonthlyUserStat => ({
  month:      row.month,
  monthName:  MONTH_NAMES[row.month],
  userId:     row.userId,
  totalConversations: row.totalConversations,
  icopeTrue:    row.icopeTrue,
  icopeFalse:   row.icopeFalse,
  distressTrue:  row.distressTrue,
  distressFalse: row.distressFalse,
  icopeRate:    toPercent(row.icopeTrue,    row.totalConversations),
  distressRate: toPercent(row.distressTrue, row.totalConversations),
});

/** Initialise an empty monthly aggregate bucket. */
const initMonthlyAggregate = (month: number): MonthlyAggregate => ({
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
const accumulateIntoAggregate = (agg: MonthlyAggregate, row: RawStat): void => {
  agg.totalConversations += row.totalConversations;
  agg.uniqueUsers        += 1;
  agg.icopeTrue          += row.icopeTrue;
  agg.icopeFalse         += row.icopeFalse;
  agg.distressTrue       += row.distressTrue;
  agg.distressFalse      += row.distressFalse;
};

// ─── Core data transformation ────────────────────────────────────────────────

interface UserAccumulator {
  totalConversations: number;
  activeMonths: Set<number>;
  icopeTrue: number;
  distressTrue: number;
  peakMonth: number;
  peakMonthCount: number;
}

/**
 * Single-pass transform: builds both the monthMap and userMap simultaneously
 * so the raw stats array is iterated only once.
 */
const transformRawStats = (rawStats: RawStat[]) => {
  const monthMap = new Map<number, MonthlyAggregate>();
  const userMap  = new Map<string, UserAccumulator>();

  for (const row of rawStats) {
    // ── Monthly bucket ──────────────────────────────────────────────────────
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, initMonthlyAggregate(row.month));
    }
    const agg = monthMap.get(row.month)!;
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
    const u = userMap.get(row.userId)!;
    u.totalConversations += row.totalConversations;
    u.activeMonths.add(row.month);
    u.icopeTrue    += row.icopeTrue;
    u.distressTrue += row.distressTrue;

    if (row.totalConversations > u.peakMonthCount) {
      u.peakMonthCount = row.totalConversations;
      u.peakMonth      = row.month;
    }
  }

  // Finalise aggregate rates
  for (const agg of monthMap.values()) {
    agg.icopeRate    = toPercent(agg.icopeTrue,    agg.totalConversations);
    agg.distressRate = toPercent(agg.distressTrue, agg.totalConversations);
  }

  return { monthMap, userMap };
};

// ─── Derived outputs ─────────────────────────────────────────────────────────

const buildMonthlyBreakdown = (monthMap: Map<number, MonthlyAggregate>): MonthlyAggregate[] =>
  [...monthMap.values()].sort((a, b) => a.month - b.month);

const buildUserSummaries = (userMap: Map<string, UserAccumulator>): UserOverallStat[] =>
  [...userMap.entries()]
    .map(([userId, u]): UserOverallStat => ({
      userId,
      totalConversations: u.totalConversations,
      activeMonths: u.activeMonths.size,
      avgConversationsPerMonth: (u.totalConversations / u.activeMonths.size).toFixed(2),
      icopeTrue:    u.icopeTrue,
      distressTrue: u.distressTrue,
      icopeRate:    toPercent(u.icopeTrue,    u.totalConversations),
      distressRate: toPercent(u.distressTrue, u.totalConversations),
      peakMonth:     u.peakMonth,
      peakMonthName: MONTH_NAMES[u.peakMonth],
    }))
    .sort((a, b) => b.totalConversations - a.totalConversations);

const buildChartData = (monthMap: Map<number, MonthlyAggregate>) => {
  const labels:          string[]  = [];
  const totalConversations: number[] = [];
  const uniqueUsers:     number[]  = [];
  const icopeTriggers:   number[]  = [];
  const distressCases:   number[]  = [];

  for (let m = 1; m <= TOTAL_MONTHS; m++) {
    const agg = monthMap.get(m);
    labels.push(MONTH_NAMES[m]);
    totalConversations.push(agg?.totalConversations ?? 0);
    uniqueUsers.push(agg?.uniqueUsers               ?? 0);
    icopeTriggers.push(agg?.icopeTrue               ?? 0);
    distressCases.push(agg?.distressTrue            ?? 0);
  }

  return { labels, totalConversations, uniqueUsers, icopeTriggers, distressCases };
};

const buildSummary = (
  chartData: ReturnType<typeof buildChartData>,
  userSummaries: UserOverallStat[],
  userMap: Map<string, UserAccumulator>,
) => {
  const totalConversations = chartData.totalConversations.reduce((a, b) => a + b, 0);
  const totalIcopeTriggers = chartData.icopeTriggers.reduce((a, b) => a + b, 0);
  const totalDistressCases = chartData.distressCases.reduce((a, b) => a + b, 0);
  const peakMonthIdx       = chartData.totalConversations.indexOf(
    Math.max(...chartData.totalConversations),
  );

  return {
    totalConversations,
    totalUniqueUsers:    userMap.size,
    totalIcopeTriggers,
    totalDistressCases,
    overallIcopeRate:    toPercent(totalIcopeTriggers, totalConversations),
    overallDistressRate: toPercent(totalDistressCases, totalConversations),
    mostActiveMonth:     MONTH_NAMES[peakMonthIdx + 1] ?? "N/A",
    mostActiveUser:      userSummaries[0]?.userId ?? "N/A",
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
 const getConversationGrowthIntoDb = async (
  query: { year?: string },
): Promise<AnalysisReport | undefined> => {
  try {
    const year = query.year ? parseInt(query.year, 10) : new Date().getFullYear();

    const rawStats: RawStat[] = await conversationmemorys.aggregate(
      buildAggregationPipeline(year) as any,
    );

    const { monthMap, userMap } = transformRawStats(rawStats);

    const monthlyBreakdown = buildMonthlyBreakdown(monthMap);
    const userSummaries    = buildUserSummaries(userMap);
    const chartData        = buildChartData(monthMap);
    const summary          = buildSummary(chartData, userSummaries, userMap);

    return {
      year,
      generatedAt: new Date().toISOString(),
      chartData,
      monthlyBreakdown,
      userSummaries,
      summary,
    };
  } catch (error) {
    catchError(error);
  }
};




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
 findMyAllConversationIntoDb ,
 findAllConversationIntoDb,
  deleteConversationMemoryFromDb,
   getConversationGrowthIntoDb
};

export default chatBotServices;
