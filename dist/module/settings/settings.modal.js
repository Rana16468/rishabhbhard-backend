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
exports.termsConditions = exports.privacypolicys = exports.aboutus = void 0;
const mongoose_1 = require("mongoose");
const AboutUsSchema = new mongoose_1.Schema({
    aboutUs: {
        type: String,
        required: [true, "About Us content is required"],
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const PrivacyPolicySchema = new mongoose_1.Schema({
    PrivacyPolicy: {
        type: String,
        required: [true, "PrivacyPolicy content is required"],
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const TermsConditionSchema = new mongoose_1.Schema({
    TermsConditions: {
        type: String,
        required: [true, "TermsConditionsy content is required"],
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
AboutUsSchema.statics.isAboutCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
PrivacyPolicySchema.statics.isPrivacyPolicyCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
TermsConditionSchema.statics.isTermsConditionsCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findById(id);
    });
};
AboutUsSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
AboutUsSchema.pre("findOne", function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
AboutUsSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
PrivacyPolicySchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
PrivacyPolicySchema.pre("findOne", function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
PrivacyPolicySchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
TermsConditionSchema.pre("find", function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
TermsConditionSchema.pre("findOne", function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
TermsConditionSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
exports.aboutus = (0, mongoose_1.model)("aboutus", AboutUsSchema);
exports.privacypolicys = (0, mongoose_1.model)("privacypolicys", PrivacyPolicySchema);
exports.termsConditions = (0, mongoose_1.model)(" termsConditions", TermsConditionSchema);
