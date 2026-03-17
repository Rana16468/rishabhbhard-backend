"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TileClickSchema = new mongoose_1.Schema({
    spriteName: { type: String, required: true },
    wasCorrect: { type: Boolean, required: true },
    clickTime: { type: Number, required: true }, // seconds
}, { _id: false });
const TGameOneSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "users" },
    gameMode: {
        type: String,
        enum: ["OC", "UOT", "VF"],
        index: true,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true
    },
    stage: {
        type: Number,
        required: true
    },
    instructionText: {
        type: String,
        required: true
    },
    completionTime: {
        type: Number,
        required: function () { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },
    hintsUsed: {
        type: Number,
        default: 0,
        required: function () { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },
    tileClicks: {
        type: [TileClickSchema],
        default: [],
        required: function () { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },
    audioClipId: {
        type: String,
        required: function () { return this.gameMode === "VF"; }
    },
    audioClipUrl: {
        type: String,
        required: [false, 'audioClipUrl is not required'],
        default: null
    },
    recordingId: {
        type: String,
        required: function () { return this.gameMode === "VF"; }
    },
    playerResponse: {
        type: String,
        required: function () { return this.gameMode === "VF"; }
    },
    repeatButtonClicks: {
        type: [Number],
        default: []
    },
    valid_words: {
        type: [String],
        required: false,
        default: []
    },
    invalid_words: {
        type: [String],
        required: false,
        default: []
    },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });
TGameOneSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
TGameOneSchema.pre("findOne", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
TGameOneSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
/* -------- Static Method -------- */
TGameOneSchema.statics.gameOneByCustomId = function (id) {
    return this.findById(id);
};
/* -------- Model -------- */
const gameone = (0, mongoose_1.model)("gameone", TGameOneSchema);
exports.default = gameone;
