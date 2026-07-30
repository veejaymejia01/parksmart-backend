import mongoose from 'mongoose';

const sensorLogSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: [true, 'Sensor ID is required'],
    trim: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot is required']
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot is required']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'error'],
    required: [true, 'Status is required']
  },
  distanceCm: {
    type: Number,
    required: [true, 'Distance is required']
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required']
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  errorCode: {
    type: String,
    default: null
  },
  errorType: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

sensorLogSchema.index({ sensorId: 1, timestamp: -1 });
sensorLogSchema.index({ lotId: 1, timestamp: -1 });

const SensorLog = mongoose.model('SensorLog', sensorLogSchema);
export default SensorLog;

