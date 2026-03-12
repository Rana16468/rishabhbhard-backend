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
const ConversationMemorySchema = new mongoose_1.Schema({
    userText: { type: String, required: true, index: true },
    reply: { type: String, required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, index: true, required: true, ref: "users" },
    question_category: { type: String, required: true },
    conversation_topic: { type: String, required: true },
    icope_health_trigger: { type: Boolean, required: true },
    mental_distress: { type: Boolean, required: true },
    summary: { type: String, required: true },
    audio_file: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true, // createdAt, updatedAt
});
ConversationMemorySchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
ConversationMemorySchema.pre("findOne", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
ConversationMemorySchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
ConversationMemorySchema.statics.conversationMemoryCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return this.findById(id).exec();
    });
};
// 5. Create model
const conversationmemorys = (0, mongoose_1.model)("conversationmemorys", ConversationMemorySchema);
exports.default = conversationmemorys;
