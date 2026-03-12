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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
notificationSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
notificationSchema.pre("findOne", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
notificationSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
// static method
notificationSchema.statics.notificationCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
const notifications = (0, mongoose_1.model)("notifications", notificationSchema);
exports.default = notifications;
