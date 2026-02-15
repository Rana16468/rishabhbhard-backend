import { model, Schema } from "mongoose";
import { TGameOne, UserModel } from "./gameone.interface";


const TGameOneSchema = new Schema<TGameOne, UserModel>(
  {
    game_type: { type: String, required: [true, 'game type is required'] },

    level: { type: Number, required: [true, 'level is required'] },

    total_stages_in_level: { type: Number, required: true },

    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },

    score: { type: Number, required: true },

    correct_count: { type: Number, required: true },

    wrong_count: { type: Number, required: true },

    total_correct_possible: { type: Number, required: true },

    time_spent_seconds: { type: Number, required: true },

    level_completed: { type: Boolean, required: true },

    stage_scores: {
      type: [Number],
      required: true,
      default: [],
    },

    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

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
