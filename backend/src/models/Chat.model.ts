import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

chatSchema.index({ user: 1, isDeleted: 1 });

export const Chat = mongoose.model('Chat', chatSchema);
