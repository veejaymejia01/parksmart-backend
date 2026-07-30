import express from 'express';
import { getLots, getLotById, createLot, updateLot, deleteLot, uploadLotImage, addLotImage, removeLotImage } from '../controllers/lotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getLots);
router.get('/:id', getLotById);
router.post('/', protect, requireAdmin, createLot);
router.put('/:id', protect, requireAdmin, updateLot);
router.delete('/:id', protect, requireAdmin, deleteLot);
router.post('/:id/image', protect, requireAdmin, uploadLotImage);
router.post('/:id/images', protect, requireAdmin, addLotImage);
router.delete('/:id/images', protect, requireAdmin, removeLotImage);

export default router;

