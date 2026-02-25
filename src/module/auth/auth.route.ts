import express, { NextFunction, Request, Response } from "express";

import AuthController from "./auth.controller";

import status from "http-status";

import LoginValidationSchema from "./auth.validation";
import validationRequest from "../../middleware/validationRequest";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middleware/auth";
import upload from "../../utility/uplodeFile";
import ApiError from "../../app/error/ApiError";

const router = express.Router();

router.post(
  "/login_user",
  validationRequest(LoginValidationSchema.LoginSchema),
  AuthController.loginUser,
);

router.post(
  "/refresh-token",
  validationRequest(LoginValidationSchema.requestTokenValidationSchema),
  AuthController.refreshToken,
);

router.get(
  "/myprofile",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.admin),
  AuthController.myprofile,
);

// Routes file
router.patch(
  "/update_my_profile",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new ApiError(status.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest(LoginValidationSchema.changeMyProfileSchema),
  AuthController.chnageMyProfile,
);

router.get(
  "/find_by_admin_all_users",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AuthController.findByAllUsersAdmin,
);

router.delete(
  "/delete_account/:id",
  auth(
    USER_ROLE.admin,

    USER_ROLE.superAdmin,
    USER_ROLE.user,
  ),
  AuthController.deleteAccount,
);

router.get(
  "/user_graph",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AuthController.getUserGrowth,
);

router.patch(
  "/change_status/:id",
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validationRequest(LoginValidationSchema.changeUserAccountStatus),
  AuthController.isBlockAccount,
);


router.post("/login_admin_account", validationRequest(LoginValidationSchema.LoginSchema), AuthController.loginAdminAccount)
router.patch("/user_verification/:id", auth(USER_ROLE.admin, USER_ROLE.superAdmin), validationRequest(LoginValidationSchema.userVerificationSchema), AuthController.verifiedUser);



const AuthRouter = router;
export default AuthRouter;
