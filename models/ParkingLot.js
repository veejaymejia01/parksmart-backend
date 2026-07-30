import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lot name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  lat: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  totalSlots: {
    type: Number,
    required: [true, 'Total slots is required'],
    min: [1, 'Must have at least 1 slot']
  },
  ratePerHour: {
    type: Number,
    required: [true, 'Rate per hour is required'],
    min: [0, 'Rate cannot be negative']
  },
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);
export default ParkingLot;

