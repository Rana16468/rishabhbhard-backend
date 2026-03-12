"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handelCastError = (err) => {
    const errorSources = [
        { path: err === null || err === void 0 ? void 0 : err.path, message: err === null || err === void 0 ? void 0 : err.message },
    ];
    const statusCode = Number(http_status_1.default.NOT_FOUND);
    return {
        statusCode,
        message: ' InValidate id',
        errorSources,
    };
};
exports.default = handelCastError;
