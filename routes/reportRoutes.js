import express from 'express';
import { getDaily, getHourlyHeatmap, getRevenue, getSensorLogs, simulateSensorError } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/daily', protect, requireAdmin, getDaily);
router.get('/hourly-heatmap', protect, requireAdmin, getHourlyHeatmap);
router.get('/revenue', protect, requireAdmin, getRevenue);
router.get('/sensor-logs', protect, requireAdmin, getSensorLogs);
router.post('/simulate-sensor-error', protect, requireAdmin, simulateSensorError);

export default router;


