"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const user_constant_1 = require("../user/user.constant");
const LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "email is optional" }).optional(),
        phoneNumber: zod_1.z.string({ required_error: "Phone Number is required" }).optional(),
        password: zod_1.z.string({ required_error: "password is required" }),
    }),
    fcm: zod_1.z.string({ required_error: "fcm is not required" }).optional(),
});
const requestTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({ required_error: "Refresh Token is Required" }),
    }),
});
const forgetPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "email is required" }).email(),
    }),
});
const resetVerification = zod_1.z.object({
    body: zod_1.z.object({
        verificationCode: zod_1.z
            .number({ required_error: "varification code is required" })
            .min(6, { message: "min 6 character accepted" })
            .optional(),
        newpassword: zod_1.z
            .string({ required_error: "new password is required" })
            .min(6, { message: "min 6 charcter accepted" })
            .optional(),
    }),
});
const changeMyProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ required_error: "user name is required" })
            .min(3, { message: "min 3 character accepted" })
            .max(50, { message: "max 15 character accepted" })
            .optional(),
        photo: zod_1.z.string({ required_error: "optional photot" }).url().optional(),
        language: zod_1.z.array(zod_1.z.string({ required_error: "language is not required" })).optional(),
        hobbies: zod_1.z.array(zod_1.z.string({ required_error: "hobbies is not required" })).optional(),
        age: zod_1.z.string({ message: " age is not required" }).optional(),
        nickname: zod_1.z.string({ required_error: " nickname is not Required" }).optional(),
    }),
});
const changeUserAccountStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([user_constant_1.USER_ACCESSIBILITY.isProgress, user_constant_1.USER_ACCESSIBILITY.blocked]),
    }),
});
const userVerificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        isVerify: zod_1.z.boolean({ required_error: " isVerified  is required" })
    })
});
const LoginValidationSchema = {
    LoginSchema,
    requestTokenValidationSchema,
    forgetPasswordValidation,
    resetVerification,
    changeMyProfileSchema,
    changeUserAccountStatus,
    userVerificationSchema
};
exports.default = LoginValidationSchema;
