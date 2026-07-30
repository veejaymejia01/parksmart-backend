import SensorLog from '../models/SensorLog.js';
import ParkingLot from '../models/ParkingLot.js';

export const getDaily = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, lotId } = req.query;
    const match = {};

    if (dateFrom || dateTo) {
      match.timestamp = {};
      if (dateFrom) match.timestamp.$gte = new Date(dateFrom);
      if (dateTo) match.timestamp.$lte = new Date(dateTo);
    }
    if (lotId) match.lotId = lotId;

    const daily = await SensorLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          revenue: { $sum: 0 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(daily);
  } catch (error) {
    next(error);
  }
};

export const getHourlyHeatmap = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, lotId } = req.query;
    const match = {};

    if (dateFrom || dateTo) {
      match.timestamp = {};
      if (dateFrom) match.timestamp.$gte = new Date(dateFrom);
      if (dateTo) match.timestamp.$lte = new Date(dateTo);
    }
    if (lotId) match.lotId = lotId;

    const hourly = await SensorLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const heatmap = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourly.find((h) => h._id === i)?.count || 0
    }));

    res.json(heatmap);
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
};

export const getSensorLogs = async (req, res, next) => {
  try {
    const { lotId, limit = 100, isAnomaly } = req.query;

    // Check if SensorLog has entries; if empty, seed rich example logs (including error examples with error codes)
    const count = await SensorLog.countDocuments();
    if (count === 0) {
      const ParkingLot = (await import('../models/ParkingLot.js')).default;
      const Slot = (await import('../models/Slot.js')).default;
      const lot = await ParkingLot.findOne();
      const slots = await Slot.find();

      if (lot && slots.length > 0) {
        const sampleLogs = [
          {
            sensorId: 'SENSOR_001',
            slotId: slots[0]._id,
            lotId: lot._id,
            status: 'available',
            distanceCm: 145.2,
            isAnomaly: false,
            timestamp: new Date(Date.now() - 1 * 60 * 1000)
          },
          {
            sensorId: 'SENSOR_002',
            slotId: slots[1 % slots.length]._id,
            lotId: lot._id,
            status: 'error',
            distanceCm: -1.0,
            isAnomaly: true,
            errorCode: 'ERR-001',
            errorType: 'NO_ECHO',
            timestamp: new Date(Date.now() - 4 * 60 * 1000)
          },
          {
            sensorId: 'SENSOR_005',
            slotId: slots[2 % slots.length]._id,
            lotId: lot._id,
            status: 'occupied',
            distanceCm: 18.4,
            isAnomaly: false,
            timestamp: new Date(Date.now() - 10 * 60 * 1000)
          },
          {
            sensorId: 'SENSOR_008',
            slotId: slots[3 % slots.length]._id,
            lotId: lot._id,
            status: 'error',
            distanceCm: 999.0,
            isAnomaly: true,
            errorCode: 'ERR-002',
            errorType: 'OUT_OF_BOUNDS',
            timestamp: new Date(Date.now() - 18 * 60 * 1000)
          },
          {
            sensorId: 'SENSOR_012',
            slotId: slots[4 % slots.length]._id,
            lotId: lot._id,
            status: 'error',
            distanceCm: -1.0,
            isAnomaly: true,
            errorCode: 'ERR-003',
            errorType: 'TIMEOUT',
            timestamp: new Date(Date.now() - 35 * 60 * 1000)
          },
          {
            sensorId: 'SENSOR_015',
            slotId: slots[5 % slots.length]._id,
            lotId: lot._id,
            status: 'occupied',
            distanceCm: 22.0,
            isAnomaly: false,
            timestamp: new Date(Date.now() - 50 * 60 * 1000)
          }
        ];
        await SensorLog.insertMany(sampleLogs);
      }
    }

    const filter = {};
    if (lotId) filter.lotId = lotId;
    if (isAnomaly === 'true') filter.isAnomaly = true;

    const logs = await SensorLog.find(filter)
      .populate('slotId', 'slotNumber')
      .populate('lotId', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const simulateSensorError = async (req, res, next) => {
  try {
    const { sensorId = 'SENSOR_001', errorType = 'NO_ECHO' } = req.body;
    
    const Slot = (await import('../models/Slot.js')).default;
    const slot = await Slot.findOne();
    
    if (!slot) {
      return res.status(404).json({ message: 'No slot found to associate error' });
    }

    const errorSpecs = {
      NO_ECHO: { code: 'ERR-001', dist: -1 },
      OUT_OF_BOUNDS: { code: 'ERR-002', dist: 999 },
      TIMEOUT: { code: 'ERR-003', dist: -1 },
      SIGNAL_FLAPPING: { code: 'ERR-004', dist: 0.2 }
    };

    const spec = errorSpecs[errorType] || errorSpecs.NO_ECHO;

    const newLog = await SensorLog.create({
      sensorId,
      slotId: slot._id,
      lotId: slot.lotId,
      status: 'error',
      distanceCm: spec.dist,
      timestamp: new Date(),
      isAnomaly: true,
      errorCode: spec.code,
      errorType
    });

    res.json({ message: 'Sample sensor error logged', log: newLog });
  } catch (error) {
    next(error);
  }
};



