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
const auth_services_1 = __importDefault(require("./auth.services"));
const catchAsync_1 = __importDefault(require("../../utility/catchAsync"));
const config_1 = __importDefault(require("../../app/config"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.loginUserIntoDb(req.body);
    res.cookie("refreshToken", result.refreshToken, {
        secure: config_1.default.NODE_ENV === "production",
        httpOnly: true,
    });
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Login",
        data: result
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    const result = yield auth_services_1.default.refreshTokenIntoDb(refreshToken);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Access token is Retrived Successfully",
        data: result,
    });
}));
const myprofile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.myprofileIntoDb(req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully find my profile",
        data: result,
    });
}));
const chnageMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.changeMyProfileIntoDb(req, req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Change My Profile",
        data: result,
    });
}));
const findByAllUsersAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.findByAllUsersAdminIntoDb(req.query);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Find All Users",
        data: result,
    });
}));
const deleteAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.deleteAccountIntoDb(req.params.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Delete your account ",
        data: result,
    });
}));
const isBlockAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.isBlockAccountIntoDb(req.params.id, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Change Status ",
        data: result,
    });
}));
const getUserGrowth = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.getUserGrowthIntoDb(req.query);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Find User Growth",
        data: result,
    });
}));
const loginAdminAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.loginAdminAccountIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Login",
        data: result,
    });
}));
const verifiedUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.verifiedUserIntoDb(req.params.id, req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Verified",
        data: result,
    });
}));
const AuthController = {
    loginUser,
    refreshToken,
    myprofile,
    chnageMyProfile,
    findByAllUsersAdmin,
    deleteAccount,
    isBlockAccount,
    getUserGrowth,
    loginAdminAccount,
    verifiedUser
};
exports.default = AuthController;
