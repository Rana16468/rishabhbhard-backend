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
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utility/catchAsync"));
const ApiError_1 = __importDefault(require("../app/error/ApiError"));
const config_1 = __importDefault(require("../app/config"));
const user_model_1 = __importDefault(require("../module/user/user.model"));
const user_constant_1 = require("../module/user/user.constant");
const auth = (...requireRoles) => {
    return (0, catchAsync_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not Authorized', '');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized', '');
        }
        const { role, id } = decoded;
        const isUserExist = user_model_1.default.findOne({
            _id: id,
            isVerify: true,
            isDelete: false,
            status: user_constant_1.USER_ACCESSIBILITY.isProgress,
        }, { _id: 1 });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'This User is Not Founded', '');
        }
        if (requireRoles && !requireRoles.includes(role)) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Yout Role Not Exist', '');
        }
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
