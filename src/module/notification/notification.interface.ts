import { Model, Types } from "mongoose";

export  interface TNotification {

     title: string;
     message: string;
     userId?: Types.ObjectId;
     isDelete: boolean;
};

export interface NotificationModel extends Model<  TNotification> {
  notificationCustomId(id: string): Promise< TNotification | null>;
};

