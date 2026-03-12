"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractValidation = void 0;
const zod_1 = require("zod");
const ContractValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is Required" }).min(1, 'name is Required'),
        email: zod_1.z.string({ required_error: "Email is Optional" }).email().optional(),
        phoneNumber: zod_1.z.string({ required_error: "phone Number is Required" }).min(1, 'phone Number is Required'),
        address: zod_1.z.string({ required_error: "Address is Required" }).min(1, 'address is Required'),
        photo: zod_1.z.string({ required_error: "profile picture is required" }).min(1, 'profile picture is required'),
        isfavorite: zod_1.z.boolean().default(false),
        isDelete: zod_1.z.boolean().default(false),
    })
});
const UpdateContractValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is Required" }).min(1, 'name is Required').optional(),
        email: zod_1.z.string({ required_error: "Email is Optional" }).optional(),
        phoneNumber: zod_1.z.string({ required_error: "phone Number is Required" }).min(1, 'phone Number is Required').optional(),
        address: zod_1.z.string({ required_error: "Address is Required" }).min(1, 'address is Required').optional(),
        photo: zod_1.z.string({ required_error: "profile picture is required" }).min(1, 'profile picture is required').optional(),
        isfavorite: zod_1.z.boolean().default(false),
        isDelete: zod_1.z.boolean().default(false),
    })
});
exports.ContractValidation = {
    ContractValidationSchema,
    UpdateContractValidationSchema
};
