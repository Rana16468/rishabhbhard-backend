import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validationRequest from '../../middleware/validationRequest';
import chatbotValidation from './chatbot.validation';
import textToTextController from './chatbot.controller';
const route=express.Router();

route.post("/text_to_text", auth(USER_ROLE.user), validationRequest( chatbotValidation.chatbotValidationSchema),textToTextController.textToTextChat );

const ChatBotRouter=route;

export default ChatBotRouter;