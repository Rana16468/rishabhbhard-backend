"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const logError_1 = __importDefault(require("./logError"));
const handelZodError_1 = __importDefault(require("../app/error/handelZodError"));
const handelValidationError_1 = __importDefault(require("../app/error/handelValidationError"));
const handelCastError_1 = __importDefault(require("../app/error/handelCastError"));
const handelDuplicateError_1 = __importDefault(require("../app/error/handelDuplicateError"));
const ApiError_1 = __importDefault(require("../app/error/ApiError"));
const config_1 = __importDefault(require("../app/config"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalErrorHandelar = (err, req, res, next) => {
    (0, logError_1.default)(err, req);
    let statusCode = 500;
    let message = err === null || err === void 0 ? void 0 : err.message;
    let errorSources = [{ path: "", message: "" }];
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handelZodError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "ValidationError") {
        const simplifiedError = (0, handelValidationError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "CastError") {
        const simplifiedError = (0, handelCastError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        const simplifiedError = (0, handelDuplicateError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
    }
    else if (err instanceof ApiError_1.default) {
        statusCode = err === null || err === void 0 ? void 0 : err.statusCode;
        message = err === null || err === void 0 ? void 0 : err.message;
        errorSources = [{ path: "", message: err === null || err === void 0 ? void 0 : err.message }];
    }
    else if (err instanceof Error) {
        message = err === null || err === void 0 ? void 0 : err.message;
        errorSources = [{ path: "", message: err === null || err === void 0 ? void 0 : err.message }];
    }
    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: config_1.default.NODE_ENV === "development" ? err === null || err === void 0 ? void 0 : err.stack : null,
    });
};
exports.default = globalErrorHandelar;
