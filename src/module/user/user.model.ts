import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../app/config';
import { USER_ACCESSIBILITY, USER_ROLE } from './user.constant';
import { TUser, UserModel } from './user.interface';
import { boolean } from 'zod';

const TUserSchema = new Schema<TUser, UserModel>(
  {
    name: { type: String, required: false },
    nickname :{type:String, required:true},
    password: { type: String, required: true, select: 0 },

    email: {
      type: String,
      required: false,
      trim: true,
      index:true
    },

    phoneNumber: { type: String, required:[false,'phone number is not required'], select:0 },

    verificationCode: { type: Number, required:[false, 'verificationCode is not required'], index: true },

    isVerify: { type: Boolean,required:[false, 'isVerify is not required'], index:true, default: false },

    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
      required: true,
    },

    hobbies: {
      type: [String],
      required:[false, 'hobbies is not required'],
      default: [],
    },

    role: {
      type: String,
      index:true,
      required:[false, 'role is not required'],
      enum: [USER_ROLE.admin, USER_ROLE.user, USER_ROLE.superAdmin],
      default: USER_ROLE.user,
    },

    status: {
      type: String,
      enum: [USER_ACCESSIBILITY.isProgress, USER_ACCESSIBILITY.blocked],
      default: USER_ACCESSIBILITY.isProgress,
    },

    photo: { type: String, default: null },

    language: {
      type: [String],
      default: [],
    },

    age: { type: String, index:true, required:[true ,'age is required'] },

    fcm: { type: String, required:[false , 'fcm is not required'] },
    isTramsAndConditions:{type:Boolean, required:[false ,'isTramsAndConditions is nto required'], default:false},
    isDelete: { type: Boolean, default: false },
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


TUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) {
    return next(new Error("Password is required"));
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});


TUserSchema.pre('find', function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TUserSchema.pre('findOne', function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TUserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

// Static methods
TUserSchema.statics.isUserExistByCustomId = async function (id: string) {
  return this.findOne({ userUniqueId: id });
};

TUserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  return bcrypt.compare(plainTextPassword, hashPassword);
};

TUserSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number,
) {
  const passwordChangeTime =
    new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const users = model<TUser, UserModel>('users', TUserSchema);
export default users;
