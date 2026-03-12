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
const http_status_1 = __importDefault(require("http-status"));
const settings_services_1 = __importDefault(require("./settings.services"));
const catchAsync_1 = __importDefault(require("../../utility/catchAsync"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const updateAboutUs = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.updateAboutUsIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Updated ",
        data: result,
    });
}));
const findByAboutUs = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.findByAboutUsIntoDb();
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Find AboutUs",
        data: result,
    });
}));
const privacyPolicys = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.privacyPolicysIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Recorded",
        data: result,
    });
}));
const findByPrivacyPolicyss = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.findByPrivacyPolicyssIntoDb();
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Find By Privacy Policy ",
        data: result,
    });
}));
const termsConditions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.termsConditionsIntoDb(req.body);
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully  Recorded",
        data: result,
    });
}));
const findByTermsConditions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield settings_services_1.default.findBytermsConditionsIntoDb();
    (0, sendRespone_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully Find By Terms Conditions ",
        data: result,
    });
}));
const SettingController = {
    updateAboutUs,
    findByAboutUs,
    privacyPolicys,
    findByPrivacyPolicyss,
    termsConditions,
    findByTermsConditions,
};
exports.default = SettingController;
