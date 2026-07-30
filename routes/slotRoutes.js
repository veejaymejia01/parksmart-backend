import express from 'express';
import { getSlotsByLot, updateSlot, sensorUpdate } from '../controllers/slotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/lot/:id', getSlotsByLot);
router.put('/:id', protect, requireAdmin, updateSlot);
router.post('/sensor-update', sensorUpdate);

export default router;

