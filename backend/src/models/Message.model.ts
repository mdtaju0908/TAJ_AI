import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    url: String,
    public_id: String,
    type: String,
  }],
}, { timestamps: true });

messageSchema.index({ chat: 1 });

export const Message = mongoose.model('Message', messageSchema);
