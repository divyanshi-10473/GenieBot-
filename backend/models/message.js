// models/Message.js
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
   sender: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: function () {
    return !this.system; 
  },
},
system: {
  type: Boolean,
  default: false,
},
    content: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema)
export default Message
