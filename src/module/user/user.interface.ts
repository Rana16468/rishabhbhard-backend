import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface UserResponse {
  status: boolean;
  message: string;
}

export type TUser = {
  name: string;
  nickname:string;
  role: 'user' | 'admin' | 'superAdmin';
  userUniqueId: string;
  password: string;
  email: string;
  phoneNumber?: string;
  verificationCode?: number;
  gender: 'male' | 'female' | 'others';
  language: string[];
  isVerify: boolean;
  status: 'isProgress' | 'blocked';
  age?: string;
  hobbies: string[];
  photo?: string;
  fcm?: string;
  isTramsAndConditions:boolean;

  isDelete: boolean;
};

export interface UserModel extends Model<TUser> {
  isUserExistByCustomId(id: string): Promise<TUser | null>;

  isPasswordMatched(
    userSendingPassword: string,
    existingPassword: string,
  ): Promise<boolean>;

  isJWTIssuesBeforePasswordChange(
    passwordChangeTimestamp: Date,
    jwtIssuesTime: number,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
