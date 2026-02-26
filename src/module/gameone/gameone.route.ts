import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validationRequest from '../../middleware/validationRequest';
import GameOneValidationSchema from './gameone.validation';
import GameOneController from './gameone.controller';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import upload from '../../utility/uplodeFile';

const route=express.Router();


route.post(
  "/recorded_find_game_data",
  auth(USER_ROLE.user),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest(GameOneValidationSchema.createGameOneZodSchema), // ✅ pass the schema directly
  GameOneController.recordedGameOneData
);
route.post(
  "/recorded_match_game_data",
  auth(USER_ROLE.user),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest(GameOneValidationSchema.createGameOneZodSchema),
  GameOneController.recordedGameOneData
);


route.post(
  "/recorded_speak_game_data",
  auth(USER_ROLE.user),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest(GameOneValidationSchema.vfGameDataSchema),
  GameOneController.recordedGameOneData
);
route.get("/my_game_level", auth(USER_ROLE.user), GameOneController.myGameLevel);
route.delete("/delete_game_one/:id", auth(USER_ROLE.admin, USER_ROLE.superAdmin), GameOneController.deleteGameOneData);
route.get("/my_tracking_summary", auth(USER_ROLE.user, USER_ROLE.admin), GameOneController.trackingSummary);
route.get("/find_by_researcher_user/:userId", auth(USER_ROLE.user), GameOneController.findByResearcherUser)


const gameOneRoute=route;

export default gameOneRoute;