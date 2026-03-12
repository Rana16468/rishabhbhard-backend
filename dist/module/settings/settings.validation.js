"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const AboutValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        aboutUs: zod_1.z.string({ message: "about us is required" }),
    }),
});
const PrivacyPolicysValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        PrivacyPolicy: zod_1.z.string({ message: "  PrivacyPolicy us is required" }),
    }),
});
//   TermsConditions:
const TermsConditionsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        TermsConditions: zod_1.z.string({ message: "  TermsConditions us is required" }),
    }),
});
const settingValidationSchema = {
    AboutValidationSchema,
    PrivacyPolicysValidationSchema,
    TermsConditionsValidationSchema,
};
exports.default = settingValidationSchema;
