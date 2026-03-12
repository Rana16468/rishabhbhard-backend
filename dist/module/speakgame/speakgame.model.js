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
const speakGameSchema = new mongoose_1.Schema({
    game_type: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: Number,
        required: true,
    },
    stage: {
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
    },
    category: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    correct_count: {
        type: Number,
        default: 0,
    },
    wrong_count: {
        type: Number,
        default: 0,
    },
    time_spent_seconds: {
        type: Number,
        required: true,
    },
    detected_words: {
        type: [String],
        default: [],
    },
    valid_words: {
        type: [String],
        default: [],
    },
    invalid_words: {
        type: [String],
        default: [],
    },
    level_completed: {
        type: Boolean,
        default: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
speakGameSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
speakGameSchema.pre("findOne", function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
speakGameSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
/* static method */
speakGameSchema.statics.speakGameCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
const speakgames = (0, mongoose_1.model)("speakgames", speakGameSchema);
exports.default = speakgames;
