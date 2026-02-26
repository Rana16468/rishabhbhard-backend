import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validationRequest from '../../middleware/validationRequest';
import GameOneValidationSchema from './gameone.validation';
import GameOneController from './gameone.controller';

const route=express.Router();


route.post("/recorded_find_game_data", auth(USER_ROLE.user), validationRequest(GameOneValidationSchema.createGameOneZodSchema),  GameOneController.recordedGameOneData);
route.get("/my_game_level", auth(USER_ROLE.user), GameOneController.myGameLevel);
route.delete("/delete_game_one/:id", auth(USER_ROLE.admin, USER_ROLE.superAdmin), GameOneController.deleteGameOneData);
route.get("/my_tracking_summary", auth(USER_ROLE.user, USER_ROLE.admin), GameOneController.trackingSummary);
route.get("/find_by_researcher_user", auth(USER_ROLE.user), GameOneController.findByResearcherUser)


const gameOneRoute=route;

export default gameOneRoute;