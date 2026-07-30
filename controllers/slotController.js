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

    const newStatus = status === 'occupied' ? 'occupied' : 'available';

    // 1. Try finding by exact _id and lotId
    let slot = await Slot.findOneAndUpdate(
      { _id: slotId },
      {
        status: newStatus,
        sensorId,
        lastPingAt: new Date(timestamp || Date.now())
      },
      { new: true }
    );

    // 2. Fallback: try finding by sensorId
    if (!slot && sensorId) {
      slot = await Slot.findOneAndUpdate(
        { sensorId },
        {
          status: newStatus,
          lastPingAt: new Date(timestamp || Date.now())
        },
        { new: true }
      );
    }

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found for sensor' });
    }

    const isAnomaly = distance_cm < 0 || distance_cm > 400;

    await SensorLog.create({
      sensorId,
      slotId: slot._id,
      lotId: slot.lotId,
      status: newStatus,
      distanceCm: distance_cm,
      timestamp: new Date(timestamp || Date.now()),
      isAnomaly
    });

    const io = getIO();
    if (io) {
      io.emit('slot:update', {
        slotId: slot._id.toString(),
        status: slot.status,
        lotId: slot.lotId.toString(),
        sensorId: slot.sensorId,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Sensor update received', slot });
  } catch (error) {
    next(error);
  }
};

