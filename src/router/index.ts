import express from 'express';
import { ContructRouter } from '../module/contract/contract.routes';
import UserRouters from '../module/user/user.routes';
import AuthRouter from '../module/auth/auth.route';
import ChatBotRouter from '../module/chatbot/chatbot.route';
import gameOneRoute from '../module/gameone/gameone.route';


const router = express.Router();
const moduleRouth = [
  { path: '/contract', route: ContructRouter },
  { path: '/user', route: UserRouters },
  {path:"/auth", route: AuthRouter},
  {path:"/chatbot", route: ChatBotRouter},
  {path:"/game_one", route: gameOneRoute}
];

moduleRouth.forEach((v) => router.use(v.path, v.route));

export default router;
