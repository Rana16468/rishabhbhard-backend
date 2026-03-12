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
const settings_modal_1 = require("./settings.modal");
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const updateAboutUsIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const aboutText = (_b = (_a = payload.aboutUs) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        if (!aboutText) {
            yield settings_modal_1.aboutus.deleteMany();
            return { status: true, message: "AboutUs content cleared successfully" };
        }
        const result = yield settings_modal_1.aboutus.findOneAndUpdate({}, { aboutUs: aboutText, isDelete: (_c = payload.isDelete) !== null && _c !== void 0 ? _c : false }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return result
            ? { status: true, message: "AboutUs successfully saved" }
            : { status: false, message: "Failed to save AboutUs" };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findByAboutUsIntoDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield settings_modal_1.aboutus
            .findOne()
            .select("-isDelete -createdAt -updatedAt");
        return result;
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const privacyPolicysIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const privacyPolicyText = (_b = (_a = payload.PrivacyPolicy) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        if (!privacyPolicyText) {
            yield settings_modal_1.privacypolicys.deleteMany();
            return {
                status: true,
                message: "Privacy policy content cleared successfully",
            };
        }
        const result = yield settings_modal_1.privacypolicys.findOneAndUpdate({}, { PrivacyPolicy: privacyPolicyText, isDelete: (_c = payload.isDelete) !== null && _c !== void 0 ? _c : false }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return result
            ? { status: true, message: "Privacy policy successfully saved" }
            : { status: false, message: "Failed to save privacy policy" };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findByPrivacyPolicyssIntoDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield settings_modal_1.privacypolicys
            .findOne()
            .select("-isDelete -createdAt -updatedAt");
        return result;
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
// termsConditions
const termsConditionsIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const termsConditionsText = (_b = (_a = payload.TermsConditions) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        if (!termsConditionsText) {
            yield settings_modal_1.termsConditions.deleteMany();
            return {
                status: true,
                message: "Terms and Conditions content cleared successfully",
            };
        }
        const result = yield settings_modal_1.termsConditions.findOneAndUpdate({}, {
            TermsConditions: termsConditionsText,
            isDelete: (_c = payload.isDelete) !== null && _c !== void 0 ? _c : false,
        }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return result
            ? { status: true, message: "Terms and Conditions successfully saved" }
            : { status: false, message: "Failed to save Terms and Conditions" };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const findBytermsConditionsIntoDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield settings_modal_1.termsConditions
            .findOne()
            .select("-isDelete -createdAt -updatedAt");
        return result;
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const SettingServices = {
    updateAboutUsIntoDb,
    findByAboutUsIntoDb,
    privacyPolicysIntoDb,
    findByPrivacyPolicyssIntoDb,
    termsConditionsIntoDb,
    findBytermsConditionsIntoDb,
};
exports.default = SettingServices;
