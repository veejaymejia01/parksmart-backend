import express from 'express';
import { fetchFromESP32, getESP32Status, getSensorHistory } from '../controllers/esp32Controller.js';

const router = express.Router();

// GET /api/esp32/status  — Check if ESP32 is online
router.get('/status', getESP32Status);

// GET /api/esp32/fetch?slotId=xxx&lotId=xxx&sensorId=xxx — Poll ESP32 and update slot
router.get('/fetch', fetchFromESP32);

// GET /api/esp32/history?sensorId=xxx&limit=10 — Get sensor readings history
router.get('/history', getSensorHistory);

export default router;
