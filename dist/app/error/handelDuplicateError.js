"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handelDuplicateError = (err) => {
    const match = err.message.match(/"([^"]*)"/);
    // Extracted value or null if not found
    const extractedMessage = match ? match[1] : null;
    const errorSources = [
        { path: '', message: extractedMessage }
    ];
    const statusCode = Number(http_status_1.default.NOT_FOUND);
    return {
        statusCode,
        message: ' InValidate id',
        errorSources
    };
};
exports.default = handelDuplicateError;
