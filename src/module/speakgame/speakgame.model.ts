import { model, Schema } from "mongoose";
import { MatchGameModel, TSpeakGame } from "./speakgame.interface";

const speakGameSchema = new Schema<TSpeakGame, MatchGameModel>(
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
    stage: {
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
    },
    category: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    correct_count: {
      type: Number,
      default: 0,
    },
    wrong_count: {
      type: Number,
      default: 0,
    },
    time_spent_seconds: {
      type: Number,
      required: true,
    },
    detected_words: {
      type: [String],
      default: [],
    },
    valid_words: {
      type: [String],
      default: [],
    },
    invalid_words: {
      type: [String],
      default: [],
    },
    level_completed: {
      type: Boolean,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

speakGameSchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

speakGameSchema.pre("findOne", function (next) {
  this.findOne({ isDelete: { $ne: true } });
  next();
});

speakGameSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});


/* static method */
speakGameSchema.statics.speakGameCustomId = async function (id: string) {
  return this.findById(id);
};

 const speakgames = model<TSpeakGame, MatchGameModel>(
  "speakgames",
  speakGameSchema
);

export default speakgames;