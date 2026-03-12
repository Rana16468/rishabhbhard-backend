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
const QueryBuilder_1 = __importDefault(require("../../app/builder/QueryBuilder"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const gameone_model_1 = __importDefault(require("../gameone/gameone.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const notification_model_1 = __importDefault(require("./notification.model"));
const findByAllUsersNotificationIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allNotificationQuery = new QueryBuilder_1.default(notification_model_1.default
            .find({})
            .select("-password").populate([
            {
                path: "userId",
                select: "nickname  photo"
            }
        ]), query)
            .search([])
            .filter()
            .sort()
            .paginate()
            .fields();
        const all_notification = yield allNotificationQuery.modelQuery;
        const meta = yield allNotificationQuery.countTotal();
        return { meta, all_notification };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findByAllDashboardListIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUser = yield user_model_1.default.countDocuments();
        const totalOcGame = yield gameone_model_1.default.find({
            gameMode: "OC"
        }).countDocuments();
        const totalUOT = yield gameone_model_1.default.find({ gameMode: "UOT" }).countDocuments();
        const totalVF = yield gameone_model_1.default.find({ gameMode: "VF" }).countDocuments();
        return {
            totalOcGame, totalUOT, totalVF, totalUser
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const notificationServices = {
    findByAllUsersNotificationIntoDb,
    findByAllDashboardListIntoDB
};
exports.default = notificationServices;
