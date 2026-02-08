import { model, Schema } from "mongoose";
import { TGameOne, UserModel } from "./gameone.interface";

/* -------- Schema -------- */
const TGameOneSchema = new Schema<TGameOne, UserModel>(
  {
    game: { type: String, required: true },
    level: { type: Number, required: true },
    stage: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    wrongs: { type: Number, default: 0 },
    rights: { type: Number, default: 0 },
    time: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------- Middleware for soft delete -------- */
TGameOneSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

TGameOneSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

TGameOneSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});

/* -------- Static Method -------- */
TGameOneSchema.statics.gameOneByCustomId = function (id: string) {
  return this.findById(id);
};

/* -------- Model -------- */
const gameone = model<TGameOne, UserModel>("gameone", TGameOneSchema);
export default gameone;
