"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logError = (err, req) => {
    const logerror = {
        timestamps: new Date().toISOString(),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
        },
    };
    console.log({
        timestamps: new Date().toISOString(),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
        },
    });
    return logerror;
};
exports.default = logError;
