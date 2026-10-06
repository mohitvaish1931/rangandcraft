import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sanitize from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

mongoose.set('strictQuery', true);

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Render / Vercel sit behind a proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// CORS_ORIGINS (comma separated) restricts which sites may call the API.
// Auth uses bearer tokens (not cookies), so an unset allowlist is not a CSRF risk.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === 'null') return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  maxAge: 86400,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitize);
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', db: dbState });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', sitemapRoutes);

app.get('/', (req, res) => {
  res.send('Clothing Brand API is running...');
});

app.use(notFound);
app.use(errorHandler);

export { app };

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}
