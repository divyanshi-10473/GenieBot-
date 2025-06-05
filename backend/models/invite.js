import mongoose from 'mongoose'

const projectInviteSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'added', 'rejected'],
    default: 'requested'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const projectInvite = mongoose.model('invite', projectInviteSchema)
export default projectInvite;
