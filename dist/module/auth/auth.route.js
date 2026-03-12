"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const http_status_1 = __importDefault(require("http-status"));
const auth_validation_1 = __importDefault(require("./auth.validation"));
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const user_constant_1 = require("../user/user.constant");
const auth_1 = __importDefault(require("../../middleware/auth"));
const uplodeFile_1 = __importDefault(require("../../utility/uplodeFile"));
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const router = express_1.default.Router();
router.post("/login_user", (0, validationRequest_1.default)(auth_validation_1.default.LoginSchema), auth_controller_1.default.loginUser);
router.post("/refresh-token", (0, validationRequest_1.default)(auth_validation_1.default.requestTokenValidationSchema), auth_controller_1.default.refreshToken);
router.get("/myprofile", (0, auth_1.default)(user_constant_1.USER_ROLE.user, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), auth_controller_1.default.myprofile);
// Routes file
router.patch("/update_my_profile", (0, auth_1.default)(user_constant_1.USER_ROLE.user, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.admin), uplodeFile_1.default.single("file"), (req, res, next) => {
    try {
        if (req.body.data && typeof req.body.data === "string") {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JSON data", ""));
    }
}, (0, validationRequest_1.default)(auth_validation_1.default.changeMyProfileSchema), auth_controller_1.default.chnageMyProfile);
router.get("/find_by_admin_all_users", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), auth_controller_1.default.findByAllUsersAdmin);
router.delete("/delete_account/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin, user_constant_1.USER_ROLE.user), auth_controller_1.default.deleteAccount);
router.get("/user_graph", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), auth_controller_1.default.getUserGrowth);
router.patch("/change_status/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), (0, validationRequest_1.default)(auth_validation_1.default.changeUserAccountStatus), auth_controller_1.default.isBlockAccount);
router.post("/login_admin_account", (0, validationRequest_1.default)(auth_validation_1.default.LoginSchema), auth_controller_1.default.loginAdminAccount);
router.patch("/user_verification/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.admin, user_constant_1.USER_ROLE.superAdmin), (0, validationRequest_1.default)(auth_validation_1.default.userVerificationSchema), auth_controller_1.default.verifiedUser);
const AuthRouter = router;
exports.default = AuthRouter;
