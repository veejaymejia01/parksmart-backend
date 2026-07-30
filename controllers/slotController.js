import Slot from '../models/Slot.js';
import SensorLog from '../models/SensorLog.js';
import { getIO } from '../config/socket.js';

export const getSlotsByLot = async (req, res, next) => {
  try {
    const slots = await Slot.find({ lotId: req.params.id }).sort('slotNumber');
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const updateSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const io = getIO();
    io.emit('slot:update', {
      slotId: slot._id,
      status: slot.status,
      lotId: slot.lotId,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Slot updated', slot });
  } catch (error) {
    next(error);
  }
};

export const sensorUpdate = async (req, res, next) => {
  try {
    const { sensorId, slotId, lotId, status, distance_cm, timestamp } = req.body;

    if (!sensorId || !slotId || !lotId || !status) {
      return res.status(400).json({ message: 'Missing required sensor fields' });
    }

    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, lotId },
      {
        status: status === 'occupied' ? 'occupied' : 'available',
        sensorId,
        lastPingAt: new Date(timestamp || Date.now())
      },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const isAnomaly = distance_cm < 0 || distance_cm > 400;

    await SensorLog.create({
      sensorId,
      slotId,
      lotId,
      status,
      distanceCm: distance_cm,
      timestamp: new Date(timestamp || Date.now()),
      isAnomaly
    });

    const io = getIO();
    io.emit('slot:update', {
      slotId: slot._id,
      status: slot.status,
      lotId: slot.lotId,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Sensor update received', slot });
  } catch (error) {
    next(error);
  }
};

