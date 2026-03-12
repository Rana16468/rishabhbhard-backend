"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constant_1 = require("../user/user.constant");
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const speakgame_validation_1 = __importDefault(require("./speakgame.validation"));
const speakgame_controller_1 = __importDefault(require("./speakgame.controller"));
const route = express_1.default.Router();
route.post("/recorded_speak_game_data", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), (0, validationRequest_1.default)(speakgame_validation_1.default.createSpeakGameZodSchema), speakgame_controller_1.default.recordedSpeakGameData);
route.get("/my_speak_game_level", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), speakgame_controller_1.default.myGameLevel);
route.delete("/delete_speak_game/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), speakgame_controller_1.default.deleteSpeakGame);
route.get("/tracking_my_speak_game_summary", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), speakgame_controller_1.default.trackingMySpeakSummary);
route.get("/game_graph", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), speakgame_controller_1.default.gameGraph);
// route.get("/find_by_researcher_user/:userId", auth(USER_ROLE.admin), speakGameController.)
const speakGameRoute = route;
exports.default = speakGameRoute;
