import { model, Schema } from "mongoose";
import { TGameOne ,TTileClick } from "./gameone.interface";
import { UserModel } from "../user/user.interface";


const TileClickSchema = new Schema<TTileClick>(
  {
    spriteName: { type: String, required: true },
    wasCorrect: { type: Boolean, required: true },
    clickTime: { type: Number, required: true }, // seconds
  },
  { _id: false }
);


const TGameOneSchema = new Schema<TGameOne, UserModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },

    gameMode: { 
      type: String, 
      enum: ["OC", "UOT", "VF"], 
      required: true 
    },


    language: { 
      type: String, 
      required: true 
    },

    difficulty: { 
      type: Number, 
      required: true 
    },

    stage: { 
      type: Number, 
      required: true 
    },

    instructionText: { 
      type: String, 
      required: true 
    },

    completionTime: { 
      type: Number,
      required: function(this: any) { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },

    hintsUsed: { 
      type: Number, 
      default: 0,
      required: function(this: any) { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },

    tileClicks: { 
      type: [TileClickSchema], 
      default: [],
      required: function(this: any) { return this.gameMode === "OC" || this.gameMode === "UOT"; }
    },

    audioClipId: {
      type: String,
      required: function(this: any) { return this.gameMode === "VF"; }
    },
      audioClipUrl:{
        type:String,
        required:[false ,'audioClipUrl is not required'],
        default: null

      },
    recordingId: {
      type: String,
      required: function(this: any) { return this.gameMode === "VF"; }
    },
    playerResponse: {
      type: String,
      required: function(this: any) { return this.gameMode === "VF"; }
    },

    repeatButtonClicks: { 
      type: [Number], 
      default: [] 
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
  this.find({ isDelete: { $ne: true } });
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