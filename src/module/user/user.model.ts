import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../app/config';
import { USER_ACCESSIBILITY, USER_ROLE } from './user.constant';
import { TUser, UserModel } from './user.interface';
import { number, string } from 'zod';

const TUserSchema = new Schema<TUser, UserModel>(
  {
    name: { type: String, required: [true, 'user name is Required'] },
    password: { type: String, required: [false, 'Password is Required'] },
    userUniqueId:{ type: String, unique:true , index:true, required:[true, 'user Unique Id is required']},
    email: {
      type: String,
      required: [true, 'Email is Required'],
      trim: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [false, 'phone number is required']
    },
    verificationCode: {
      type: Number,
      required: [false, 'verification Code is Required'],
      index:true
    },
    isVerify: {
      type: Boolean,
      required: [false, 'isVartify is not required'],
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: [USER_ROLE.admin, USER_ROLE.user],
        message: '{VALUE} is Not Required',
      },
      required: [true, 'Role is Required'],
      default: USER_ROLE.user,
    },
    status: {
      type: String,
      enum: {
        values: [USER_ACCESSIBILITY.isProgress, USER_ACCESSIBILITY.blocked],
        message: '{VALUE} is not required',
      },
      required: [true, 'Status is Required'],
      default: USER_ACCESSIBILITY.isProgress as any,
    },
    photo: {
      type: String,
      required: [false, 'photo is not required'],
      default: null,
    },

    language: {
      type: String,
      required: [false, 'language is not required'],
      default: null
    },
    age: {
      type: String,
      required:[false , 'age is not required'],
      default: null

    },
 
    fcm: {
      type: String,
      required: [false, 'fcm is not  required'],
      default: null,
    },
    isDelete: {
      type: Boolean,
      required: [true, 'isDeleted is Required'],
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TUserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// mongoose middleware
TUserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

TUserSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

TUserSchema.pre('find', function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TUserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

TUserSchema.pre('findOne', function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TUserSchema.statics.isUserExistByCustomId = async function (id: string) {
  return await users.findOne({ id });
};

TUserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  const password = await bcrypt.compare(plainTextPassword, hashPassword);
  return password;
};

TUserSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number,
) {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const users = model<TUser, UserModel>('users', TUserSchema);

export default users;
