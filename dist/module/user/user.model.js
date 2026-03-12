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
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../app/config"));
const user_constant_1 = require("./user.constant");
const TUserSchema = new mongoose_1.Schema({
    name: { type: String, required: false },
    nickname: { type: String, required: true },
    password: { type: String, required: true, select: 0 },
    dataCenter: { type: String, required: false },
    email: {
        type: String,
        required: false,
        trim: true,
        index: true
    },
    phoneNumber: { type: String, required: [false, 'phone number is not required'] },
    verificationCode: { type: Number, required: [false, 'verificationCode is not required'], index: true, default: null },
    isVerify: { type: Boolean, required: [false, 'isVerify is not required'], index: true, default: false },
    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
        required: true,
    },
    hobbies: {
        type: [String],
        required: [false, 'hobbies is not required'],
        default: [],
    },
    role: {
        type: String,
        index: true,
        required: [false, 'role is not required'],
        enum: [user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.user, user_constant_1.USER_ROLE.superAdmin],
        default: user_constant_1.USER_ROLE.user,
    },
    status: {
        type: String,
        enum: [user_constant_1.USER_ACCESSIBILITY.isProgress, user_constant_1.USER_ACCESSIBILITY.blocked],
        default: user_constant_1.USER_ACCESSIBILITY.isProgress,
    },
    photo: { type: String, default: null },
    language: {
        type: [String],
        default: [],
    },
    age: { type: String, index: true, required: [true, 'age is required'] },
    fcm: { type: String, required: [false, 'fcm is not required'] },
    isTramsAndConditions: { type: Boolean, required: [false, 'isTramsAndConditions is nto required'], default: false },
    isDelete: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
TUserSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    },
});
TUserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        if (!this.password) {
            return next(new Error("Password is required"));
        }
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
TUserSchema.pre('find', function (next) {
    this.find({ isDelete: { $ne: true } });
    next();
});
TUserSchema.pre('findOne', function (next) {
    this.findOne({ isDelete: { $ne: true } });
    next();
});
TUserSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
    next();
});
// Static methods
TUserSchema.statics.isUserExistByCustomId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOne({ userUniqueId: id });
    });
};
TUserSchema.statics.isPasswordMatched = function (plainTextPassword, hashPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(plainTextPassword, hashPassword);
    });
};
TUserSchema.statics.isJWTIssuesBeforePasswordChange = function (passwordChangeTimestamp, jwtIssuesTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
        return passwordChangeTime > jwtIssuesTime;
    });
};
const users = (0, mongoose_1.model)('users', TUserSchema);
exports.default = users;
