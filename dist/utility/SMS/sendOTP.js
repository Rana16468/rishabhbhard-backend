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
exports.client = void 0;
const twilio_1 = __importDefault(require("twilio"));
const config_1 = __importDefault(require("../../app/config"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
exports.client = (0, twilio_1.default)(config_1.default.send_otp.twilio_account_sid, config_1.default.send_otp.twilio_auth_token);
const sendOTP = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    if (!phone || !phone.startsWith("+")) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Phone must be in international format (+880...)", "");
    }
    try {
        const response = yield exports.client.verify.v2
            .services(config_1.default.send_otp.twilio_verify_sid)
            .verifications.create({
            to: phone,
            channel: "sms",
        });
        return response;
    }
    catch (error) {
        (0, catchError_1.default)(error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, (error === null || error === void 0 ? void 0 : error.message) || "Failed to send OTP", "");
    }
});
const verifyOTP = (phone, code) => __awaiter(void 0, void 0, void 0, function* () {
    if (!phone || !code) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Phone and OTP code are required", "");
    }
    try {
        const response = yield exports.client.verify.v2
            .services(config_1.default.send_otp.twilio_verify_sid)
            .verificationChecks.create({
            to: phone,
            code,
        });
        return response.status === "approved";
    }
    catch (error) {
        (0, catchError_1.default)(error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, (error === null || error === void 0 ? void 0 : error.message) || "OTP verification failed", "");
    }
});
const twilio_sms_services = {
    sendOTP,
    verifyOTP,
};
exports.default = twilio_sms_services;
