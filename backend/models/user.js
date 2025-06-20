import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
  },

  authProvider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local',
  },

  githubId: {
    type: String,
    unique: true,
    sparse: true, 
  },

  avatar: {
    type: String,
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
