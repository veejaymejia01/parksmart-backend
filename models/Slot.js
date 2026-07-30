import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot is required']
  },
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['regular', 'PWD', 'motorcycle', 'ev'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'disabled'],
    default: 'available'
  },
  sensorId: {
    type: String,
    trim: true,
    default: null
  },
  lastPingAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

slotSchema.index({ lotId: 1, slotNumber: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);
export default Slot;

