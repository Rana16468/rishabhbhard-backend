import express from 'express';
import validationRequest from '../../middleware/validationRequest';
import UserValidationSchema from './user.validation';
import UserController from './user.controller';

const router = express.Router();

router.post(
  '/create_user',
  validationRequest(UserValidationSchema.createUserZodSchema),
  UserController.createUser,
);

const UserRouters = router;
export default UserRouters;
