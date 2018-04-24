import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

const DeviceDataSchema = mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    required: true,
  },
}, { strict: false });

export default DeviceDataSchema;
