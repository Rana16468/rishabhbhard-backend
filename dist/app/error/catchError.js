"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("./ApiError"));
/**
 * Handles errors in a type-safe way and always throws an ApiError.
 * @param error - The caught error
 * @param errorMessage - Fallback error message if unknown error is thrown
 */
const catchError = (error, errorMessage = "Service temporarily unavailable") => {
    if (error instanceof ApiError_1.default) {
        throw error;
    }
    if (error instanceof Error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, error.message, "");
    }
    throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, errorMessage, "");
};
exports.default = catchError;
