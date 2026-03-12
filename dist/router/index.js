"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contract_routes_1 = require("../module/contract/contract.routes");
const user_routes_1 = __importDefault(require("../module/user/user.routes"));
const auth_route_1 = __importDefault(require("../module/auth/auth.route"));
const chatbot_route_1 = __importDefault(require("../module/chatbot/chatbot.route"));
const gameone_route_1 = __importDefault(require("../module/gameone/gameone.route"));
const matchgame_route_1 = __importDefault(require("../module/matchgame/matchgame.route"));
const speakgame_route_1 = __importDefault(require("../module/speakgame/speakgame.route"));
const settings_routres_1 = __importDefault(require("../module/settings/settings.routres"));
const notification_route_1 = __importDefault(require("../module/notification/notification.route"));
const router = express_1.default.Router();
const moduleRouth = [
    { path: '/contract', route: contract_routes_1.ContructRouter },
    { path: '/user', route: user_routes_1.default },
    { path: "/auth", route: auth_route_1.default },
    { path: "/chatbot", route: chatbot_route_1.default },
    { path: "/game_one", route: gameone_route_1.default },
    { path: "/match_game", route: matchgame_route_1.default },
    { path: "/speak_game", route: speakgame_route_1.default },
    { path: "/setting", route: settings_routres_1.default },
    { path: "/notification", route: notification_route_1.default }
];
moduleRouth.forEach((v) => router.use(v.path, v.route));
exports.default = router;
