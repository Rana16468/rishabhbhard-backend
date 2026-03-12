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
const catchAsync_1 = __importDefault(require("../../utility/catchAsync"));
const gameone_services_1 = __importDefault(require("./gameone.services"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const recordedGameOneData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gameone_services_1.default.recordedGameOneDataIntoDB(req.user.id, req);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Successfully Recorded",
        data: result
    });
}));
const myGameLevel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gameone_services_1.default.myGameLevelIntoDb(req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Get My Game Level and Stage",
        data: result
    });
}));
const deleteGameOneData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gameone_services_1.default.deleteGameOneDataIntoDb(req.params.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Delete",
        data: result
    });
}));
const trackingSummary = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gameone_services_1.default.trackingSummaryIntoDb(req.query, req.user.id);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Tracking Summary",
        data: result
    });
}));
const findByResearcherUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gameone_services_1.default.findByResearcherUserIntoDb(req.query);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Find By Researcher Data",
        data: result
    });
}));
const GameOneController = {
    recordedGameOneData,
    myGameLevel,
    deleteGameOneData,
    trackingSummary,
    findByResearcherUser
};
exports.default = GameOneController;
