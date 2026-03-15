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
const notification_model_1 = __importDefault(require("../module/notification/notification.model"));
const catchError_1 = __importDefault(require("../app/error/catchError"));
const auto_delete_notification = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeThreshold = new Date();
        timeThreshold.setMonth(timeThreshold.getMonth() - 1);
        const deleteResult = yield notification_model_1.default.deleteMany({
            createdAt: { $lt: timeThreshold },
        });
        return {
            deletedCount: deleteResult.deletedCount,
            message: "Old notifications deleted successfully",
        };
    }
    catch (error) {
        (0, catchError_1.default)(error, 'Failed to delete notifications');
    }
});
exports.default = auto_delete_notification;
