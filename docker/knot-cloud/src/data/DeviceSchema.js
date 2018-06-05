import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

const DeviceSchema = mongoose.Schema({
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
  online: {
    type: Boolean,
    default: false,
    required: true,
  },
}, { strict: false, id: false });

export default DeviceSchema;
