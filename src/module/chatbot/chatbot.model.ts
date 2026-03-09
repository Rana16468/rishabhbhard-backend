
import { Schema , Types, model} from "mongoose";
import { TConversationMemory, ConversationMemoryModel } from "./chatbot.interface";




const ConversationMemorySchema = new Schema<TConversationMemory & Document, ConversationMemoryModel>({
  reply: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
  question_category: { type: String, required: true },
  conversation_topic: { type: String, required: true },
  icope_health_trigger: { type: Boolean, required: true },
  mental_distress: { type: Boolean, required: true },
  summary: { type: String, required: true },
  audio_file: { type: String },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true, // createdAt, updatedAt
});


ConversationMemorySchema.pre("find", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

ConversationMemorySchema.pre("findOne", function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

ConversationMemorySchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});


ConversationMemorySchema.statics.conversationMemoryCustomId = async function(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return this.findById(id).exec();
};

// 5. Create model
 const conversationmemorys = model<TConversationMemory & Document, ConversationMemoryModel>(
  "conversationmemorys",
  ConversationMemorySchema
);

export default conversationmemorys;