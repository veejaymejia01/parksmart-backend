import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import lotRoutes from './routes/lotRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import esp32Routes from './routes/esp32Routes.js';

import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[Backend] ${req.method} ${req.url} - ${res.statusCode}`);
  });
  next();
});

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/esp32', esp32Routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;

