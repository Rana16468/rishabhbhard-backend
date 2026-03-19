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
const auth_constant_1 = require("./auth.constant");
const user_model_1 = __importDefault(require("../user/user.model"));
const user_constant_1 = require("../user/user.constant");
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const jwtHelpers_1 = require("../../app/helper/jwtHelpers");
const config_1 = __importDefault(require("../../app/config"));
const QueryBuilder_1 = __importDefault(require("../../app/builder/QueryBuilder"));
const catchError_1 = __importDefault(require("../../app/error/catchError"));
const gameone_model_1 = __importDefault(require("../gameone/gameone.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const chatbot_model_1 = __importDefault(require("../chatbot/chatbot.model"));
const deleteFromS3_1 = require("../../utility/deleteFromS3");
const uploadToS3_1 = require("../../utility/uploadToS3");
const notification_model_1 = __importDefault(require("../notification/notification.model"));
const loginUserIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch user by email only
    const user = yield user_model_1.default.findOne({
        phoneNumber: payload.phoneNumber,
        status: user_constant_1.USER_ACCESSIBILITY.isProgress,
    }, {
        password: 1,
        email: 1,
        role: 1,
        uid: 1,
        vanityUrl: 1,
        isVerify: 1
    });
    if (user && !user.isVerify) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "User is not verified please contact us admin for verification", "");
    }
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `User with email "${payload.phoneNumber}" not found`, "");
    }
    // Check UID mismatch for new device
    if (payload.uid && user.uid !== payload.uid) {
        return {
            status: false,
            message: "It seems you are using a new device. Please provide your recovery key.",
            recoveryKey: true,
        };
    }
    // Update FCM token if provided
    if (payload.fcm) {
        yield user_model_1.default.updateOne({ _id: user._id }, { $set: { fcm: payload.fcm } });
    }
    // Validate password
    const isMatched = yield user_model_1.default.isPasswordMatched(payload.password, user.password);
    if (!isMatched) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Password does not match", "");
    }
    // Generate JWT tokens
    const jwtPayload = { id: user._id, role: user.role, email: user.email, uid: user.uid };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.refresh_expires_in);
    return { accessToken, refreshToken };
});
const refreshTokenIntoDb = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt_refresh_secret);
        const { id } = decoded;
        const isUserExist = yield user_model_1.default.findOne({
            $and: [
                { _id: id },
                { isVerify: true },
                { status: user_constant_1.USER_ACCESSIBILITY.isProgress },
                { isDelete: false },
            ],
        }, { _id: 1, isVerify: 1, email: 1 });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found", "");
        }
        let accessToken = null;
        if (isUserExist.isVerify) {
            const jwtPayload = {
                id: isUserExist.id,
                role: isUserExist.role,
                email: isUserExist.email,
            };
            accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.expires_in);
        }
        return {
            accessToken,
        };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "refresh Token generator error", error);
    }
});
const myprofileIntoDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default
            .findById(id)
            .select("name nickname email location photo language age hobbies updatedA ");
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "issues by the get my profile section server  error", error);
    }
});
/**
 * @param req
 * @param id
 * @returns
 */
const changeMyProfileIntoDb = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const { name, language, age, nickname, hobbies } = req.body;
        const isExistPhoto = yield user_model_1.default.findById(id).select("photo");
        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        if (Array.isArray(language) && language.length > 0) {
            updateData.language = language;
        }
        if (Array.isArray(hobbies) && hobbies.length > 0) {
            updateData.hobbies = hobbies;
        }
        if (age) {
            updateData.age = age;
        }
        if (nickname) {
            updateData.nickname = nickname;
        }
        if (file) {
            // const username = "rishabhbhard";
            // const randomNumber = Math.floor(10000 + Math.random() * 90000);
            // const imageName = `${username}${randomNumber}`.trim();
            // const path = file.path.replace(/\\/g, "/");
            // const { secure_url } = await sendFileToCloudinary(imageName, path);
            // updateData.photo = secure_url as string;
        }
        if (file) {
            // updateData.photo = file?.path?.replace(/\\/g, "/");
            if (isExistPhoto === null || isExistPhoto === void 0 ? void 0 : isExistPhoto.photo) {
                yield (0, deleteFromS3_1.deleteFromS3)(isExistPhoto === null || isExistPhoto === void 0 ? void 0 : isExistPhoto.photo);
            }
            updateData.photo = yield (0, uploadToS3_1.uploadToS3)(file, config_1.default.file_path);
        }
        if (Object.keys(updateData).length === 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "No data provided for update", "");
        }
        const result = yield user_model_1.default.findByIdAndUpdate(id, { $set: updateData }, {
            new: true,
            upsert: false, // ⚠️ better: don’t create new user accidentally
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found", "");
        }
        return {
            status: true,
            message: "Successfully updated profile",
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Profile update failed", error.message);
    }
});
const findByAllUsersAdminIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsersdQuery = new QueryBuilder_1.default(user_model_1.default
            .find({})
            .select("-password"), query)
            .search(auth_constant_1.user_search_filed)
            .filter()
            .sort()
            .paginate()
            .fields();
        const all_users = yield allUsersdQuery.modelQuery;
        const meta = yield allUsersdQuery.countTotal();
        return { meta, all_users };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "find By All User Admin IntoDb server unavailable", error);
    }
});
const deleteAccountIntoDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const user = yield user_model_1.default
            .findOne({
            _id: id,
            isVerify: true,
            status: user_constant_1.USER_ACCESSIBILITY.isProgress,
        }, { photo: 1, role: 1 })
            .session(session)
            .lean();
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User account not found.", "");
        }
        if (user.role === user_constant_1.USER_ROLE.superAdmin) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Super Admin cannot be deleted.", "");
        }
        if (user.photo) {
            yield (0, deleteFromS3_1.deleteFromS3)(user.photo);
        }
        const games = yield gameone_model_1.default
            .find({ userId: id })
            .select("audioClipUrl")
            .lean();
        const deleteAudioPromises = games
            .filter((g) => Boolean(g.audioClipUrl))
            .map((g) => (0, deleteFromS3_1.deleteFromS3)(g.audioClipUrl));
        yield Promise.all(deleteAudioPromises);
        yield Promise.all([
            chatbot_model_1.default.deleteMany({ userId: id }).session(session),
            gameone_model_1.default.deleteMany({ userId: id }).session(session),
            notification_model_1.default.deleteMany({ userId: id }).session(session),
            user_model_1.default.deleteOne({ _id: id }).session(session),
        ]);
        yield session.commitTransaction();
        return {
            status: true,
            message: "User account and all related data deleted successfully.",
        };
    }
    catch (error) {
        yield session.abortTransaction();
        (0, catchError_1.default)(error);
    }
    finally {
        session.endSession();
    }
});
const getUserGrowthIntoDb = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = query.year ? parseInt(query.year) : new Date().getFullYear();
        const stats = yield user_model_1.default.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    month: "$_id.month",
                    count: 1,
                    _id: 0,
                },
            },
            {
                $group: {
                    _id: null,
                    data: { $push: { month: "$month", count: "$count" } },
                },
            },
            {
                $project: {
                    months: {
                        $map: {
                            input: { $range: [1, 13] },
                            as: "m",
                            in: {
                                year: year,
                                month: "$$m",
                                count: {
                                    $let: {
                                        vars: {
                                            matched: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$data",
                                                            as: "d",
                                                            cond: { $eq: ["$$d.month", "$$m"] },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: { $ifNull: ["$$matched.count", 0] },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            { $unwind: "$months" },
            { $replaceRoot: { newRoot: "$months" } },
        ]);
        return { monthlyStats: stats };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to fetch user creation stats", error);
    }
});
const isBlockAccountIntoDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.default.findByIdAndUpdate(id, { status: payload.status }, { new: true });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found", "");
        }
        return {
            success: true,
            message: `User successfully ${payload.status}`,
        };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Block account operation failed", error);
    }
});
const loginAdminAccountIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user
    const user = yield user_model_1.default.findOne({
        email: payload.email,
        isVerify: true,
        status: user_constant_1.USER_ACCESSIBILITY.isProgress,
    }, {
        password: 1,
        email: 1,
        role: 1,
        uid: 1,
        nickname: 1,
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `User with email "${payload.email}" not found`, "");
    }
    // Check password
    const isMatched = yield user_model_1.default.isPasswordMatched(payload.password, user.password);
    if (!isMatched) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Password does not match", "");
    }
    const jwtPayload = { id: user._id, role: user.role, email: user.email, uid: user.uid };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.refresh_expires_in);
    //const otp = await generateUniqueOTP();
    // await users.updateOne(
    //   { _id: user._id },
    //   {
    //     $set: {
    //       verificationCode: otp,
    //       ...(payload.fcm && { fcm: payload.fcm }),
    //     },
    //   }
    // );
    // await sendEmail(
    //   payload.email as string,
    //   emailcontext.sendVerificationData(
    //     user.nickname || "User",
    //     Number(otp),
    //     "User Verification Email"
    //   ),
    //   "Verification OTP Code"
    // );
    return {
        accessToken,
        refreshToken
    };
});
const verifiedUserIntoDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_model_1.default.findByIdAndUpdate(id, { isVerify: payload.isVerify }, { new: true, upsert: true });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_EXTENDED, 'issues by the user verification section', '');
        }
        ;
        return {
            status: true,
            message: "successfully verified"
        };
    }
    catch (error) {
        (0, catchError_1.default)(error);
    }
});
const AuthServices = {
    loginUserIntoDb,
    refreshTokenIntoDb,
    myprofileIntoDb,
    changeMyProfileIntoDb,
    findByAllUsersAdminIntoDb,
    deleteAccountIntoDb,
    getUserGrowthIntoDb,
    isBlockAccountIntoDb,
    loginAdminAccountIntoDb,
    verifiedUserIntoDb
};
exports.default = AuthServices;
