import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import notificationController from './notification.controller';

const route=express.Router();


route.get("/find_by_all_notification", auth(USER_ROLE.admin, USER_ROLE.superAdmin), notificationController.findByAllUsersNotification);
route.get("/find_by_all_dashboard_list",auth(USER_ROLE.admin, USER_ROLE.superAdmin),notificationController.findByAllDashboardList)


const notificationRoute=route;

export default notificationRoute;