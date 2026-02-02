import httpStatus from "http-status";
import ApiError from "../../app/error/ApiError";
import { connectGemini, handleTurn, session } from "../../utility/Ai_Integation/AI_Integation";


const textToTextChatIntoDb = async (
  userId: string,
  payload: { text: string }
) => {
  try {
    await connectGemini();

    session!.sendClientContent({
      turns: [payload.text],
    });

    await handleTurn();
    session?.close();

    return { success: true };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "issues by the text to text chat",
      error
    );
  }
};


const chatBotServices={
textToTextChatIntoDb
}

export default  chatBotServices
