"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constant_1 = require("../user/user.constant");
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const gameone_validation_1 = __importDefault(require("./gameone.validation"));
const gameone_controller_1 = __importDefault(require("./gameone.controller"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const uplodeFile_1 = __importDefault(require("../../utility/uplodeFile"));
const route = express_1.default.Router();
route.post("/recorded_find_game_data", (0, auth_1.default)(user_constant_1.USER_ROLE.user), uplodeFile_1.default.single("file"), (req, res, next) => {
    try {
        if (req.body.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JSON data", ""));
    }
}, (0, validationRequest_1.default)(gameone_validation_1.default.createGameOneZodSchema), // ✅ pass the schema directly
gameone_controller_1.default.recordedGameOneData);
route.post("/recorded_match_game_data", (0, auth_1.default)(user_constant_1.USER_ROLE.user), uplodeFile_1.default.single("file"), (req, res, next) => {
    try {
        if (req.body.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JSON data", ""));
    }
}, (0, validationRequest_1.default)(gameone_validation_1.default.createGameOneZodSchema), gameone_controller_1.default.recordedGameOneData);
route.post("/recorded_speak_game_data", (0, auth_1.default)(user_constant_1.USER_ROLE.user), uplodeFile_1.default.single("file"), (req, res, next) => {
    try {
        if (req.body.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JSON data", ""));
    }
}, (0, validationRequest_1.default)(gameone_validation_1.default.vfGameDataSchema), gameone_controller_1.default.recordedGameOneData);
route.get("/my_game_level", (0, auth_1.default)(user_constant_1.USER_ROLE.user), gameone_controller_1.default.myGameLevel);
route.delete("/delete_game_one/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), gameone_controller_1.default.deleteGameOneData);
route.get("/my_tracking_summary", (0, auth_1.default)(user_constant_1.USER_ROLE.user, user_constant_1.USER_ROLE.admin), gameone_controller_1.default.trackingSummary);
route.get("/find_by_researcher_user", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), gameone_controller_1.default.findByResearcherUser);
const gameOneRoute = route;
exports.default = gameOneRoute;
