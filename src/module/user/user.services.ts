import httpStatus from 'http-status';
import ApiError from '../../app/error/ApiError';
import emailcontext from '../../utility/emailcontext/sendvarificationData';
import sendEmail from '../../utility/sendEmail';
import users from './user.model';
import { USER_ACCESSIBILITY } from './user.constant';
import { TUser } from './user.interface';
import mongoose from 'mongoose';

const generateUniqueOTP = async (): Promise<number> => {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const otp = Math.floor(10000 + Math.random() * 90000);

    const existingUser = await users.findOne({ verificationCode: otp });

    if (!existingUser) {
      return otp;
    }
  }

  throw new ApiError(
    httpStatus.NOT_EXTENDED,
    'Failed to generate a unique OTP after multiple attempts',
    '',
  );
};

const createUserIntoDb = async (payload: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const otp = await generateUniqueOTP();

    const isExistUser = await users.findOne(
      {
        $and: [
          {
            email: payload.email,
            isDelete: false,
            isVerify: true,
            status: USER_ACCESSIBILITY.isProgress,
          },
        ],
      },
      { _id: 1, email: 1, phoneNumber: 1, role: 1 },
    );

    payload.verificationCode = otp;
    payload.phoneNumber = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (isExistUser) {
      // await session.abortTransaction();
      // session.endSession();
      throw new ApiError(
        httpStatus.FOUND,
        'this email alredy exist in our database',
        '',
      );
    }

    const authBuilder = new users(payload);

    const result = await authBuilder.save({ session });
    await sendEmail(
      payload.email,
      emailcontext.sendvarificationData(
        payload.email,
        otp,
        'User Verification Email',
      ),
      'Verification OTP Code',
    );

    await session.commitTransaction();
    session.endSession();

    return result && { status: true, message: 'checked your email box' };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      'server unavailable',
      error,
    );
  }
};

const UserServices = {
  createUserIntoDb,
};
export default UserServices;
