import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

const UserSchema = mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: 'user',
  },
  user: {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  online: {
    type: Boolean,
    default: false,
    required: true,
  },
}, { strict: false });

export default UserSchema;
