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
const notification_services_1 = __importDefault(require("./notification.services"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const http_status_1 = __importDefault(require("http-status"));
const findByAllUsersNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_services_1.default.findByAllUsersNotificationIntoDb(req.query);
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully  find all  notification ",
        data: result,
    });
}));
const findByAllDashboardList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_services_1.default.findByAllDashboardListIntoDB();
    (0, sendRespone_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "successfully   find All ",
        data: result,
    });
}));
const notificationController = {
    findByAllUsersNotification,
    findByAllDashboardList
};
exports.default = notificationController;
