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
/* ================= Schema ================= */
const matchGameSchema = new mongoose_1.Schema({
    game_type: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: Number,
        required: true,
    },
    total_stages_in_level: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    correct_count: {
        type: Number,
        required: true,
        min: 0,
    },
    wrong_count: {
        type: Number,
        required: true,
        min: 0,
    },
    score_percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    time_spent_seconds: {
        type: Number,
        required: true,
        min: 0,
    },
    level_completed: {
        type: Boolean,
        required: true,
        default: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
});
matchGameSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
matchGameSchema.pre("findOne", function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
matchGameSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
/* ================= Static Method ================= */
matchGameSchema.statics.matchGameCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
/* ================= Model ================= */
const matchgames = (0, mongoose_1.model)("matchgames", matchGameSchema);
exports.default = matchgames;
