import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validationRequest from '../../middleware/validationRequest';
import GameOneValidationSchema from './gameone.validation';
import GameOneController from './gameone.controller';

const route=express.Router();


route.post("/recorded_game_one_data", auth(USER_ROLE.user), validationRequest(GameOneValidationSchema.createGameOneZodSchema),  GameOneController.recordedGameOneData);
route.get("/my_game_level", auth(USER_ROLE.user), GameOneController.myGameLevel);

const gameOneRoute=route;

export default gameOneRoute;