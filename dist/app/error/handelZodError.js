"use strict";
// handeller
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handelZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            path: issue.path[issue.path.length - 1],
            message: issue.message
        };
    });
    const statusCode = Number(http_status_1.default.NOT_FOUND);
    return {
        statusCode,
        message: 'Zod Validation error',
        errorSources
    };
};
exports.default = handelZodError;
