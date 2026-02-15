import { model, Schema } from "mongoose";
import { MatchGameModel, TMatchGame } from "./matchgame.interface";

/* ================= Schema ================= */
const matchGameSchema = new Schema<TMatchGame, MatchGameModel>(
  {
    game_type: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: Number,
      required: true,
    },

    total_stages_in_level: {
      type: Number,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    correct_count: {
      type: Number,
      required: true,
      min: 0,
    },

    wrong_count: {
      type: Number,
      required: true,
      min: 0,
    },

    score_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    time_spent_seconds: {
      type: Number,
      required: true,
      min: 0,
    },

    level_completed: {
      type: Boolean,
      required: true,
      default: false,
    },

    isDelete: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

matchGameSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

matchGameSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

matchGameSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});


/* ================= Static Method ================= */
matchGameSchema.statics.matchGameCustomId = async function (
  id: string
): Promise<TMatchGame | null> {
  return this.findById(id);
};

/* ================= Model ================= */
const matchgames = model<TMatchGame, MatchGameModel>(
  "matchgames",
  matchGameSchema
);

export default matchgames;
