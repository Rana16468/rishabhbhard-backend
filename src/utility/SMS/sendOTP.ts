import twilio from "twilio";
import config from "../../app/config";
import ApiError from "../../app/error/ApiError";
import httpStatus from "http-status";
import catchError from "../../app/error/catchError";

export const client = twilio(
  config.send_otp.twilio_account_sid,
  config.send_otp.twilio_auth_token
);

const sendOTP = async (phone: string) => {
  if (!phone || !phone.startsWith("+")) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Phone must be in international format (+880...)",
      ""
    );
  }

  try {
    const response = await client.verify.v2
      .services(config.send_otp.twilio_verify_sid as string)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return response;
  } catch (error: any) {
    catchError(error);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || "Failed to send OTP",
      ""
    );
  }
};

const verifyOTP = async (phone: string, code: string) => {
  if (!phone || !code) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Phone and OTP code are required",
      ""
    );
  }

  try {
    const response = await client.verify.v2
      .services(config.send_otp.twilio_verify_sid as string)
      .verificationChecks.create({
        to: phone,
        code,
      });

    return response.status === "approved";
  } catch (error: any) {
    catchError(error);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || "OTP verification failed",
      ""
    );
  }
};

const twilio_sms_services = {
  sendOTP,
  verifyOTP,
};



export default twilio_sms_services;