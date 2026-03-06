import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/v1/auth.routes';
import taskRoutes from './routes/v1/task.routes';
import userRoutes from './routes/v1/user.routes';

const app: Application = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Body Parsing & Logging ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── API Docs ────────────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API v1 Routes ───────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
