import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validationRequest from '../../middleware/validationRequest';
import speakGameValidation from './speakgame.validation';
import speakGameController from './speakgame.controller';

const route=express.Router();

route.post("/recorded_speak_game_data", auth(USER_ROLE.admin, USER_ROLE.superAdmin,USER_ROLE.user), validationRequest(speakGameValidation.createSpeakGameZodSchema), speakGameController.recordedSpeakGameData);
route.get("/my_speak_game_level", auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user), speakGameController.myGameLevel);
route.delete("/delete_speak_game/:id", auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user), speakGameController.deleteSpeakGame);
route.get("/tracking_my_speak_game_summary",auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user),speakGameController.trackingMySpeakSummary);




const speakGameRoute=route;

export default speakGameRoute;