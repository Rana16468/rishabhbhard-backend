"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constant_1 = require("../user/user.constant");
const notification_controller_1 = __importDefault(require("./notification.controller"));
const route = express_1.default.Router();
route.get("/find_by_all_notification", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), notification_controller_1.default.findByAllUsersNotification);
route.get("/find_by_all_dashboard_list", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), notification_controller_1.default.findByAllDashboardList);
const notificationRoute = route;
exports.default = notificationRoute;
