import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import prodectRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import couponRoutes from './routes/coupon.route.js';
import paymentsRoutes from './routes/payments.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import { connectDB, isDbConnected } from './lib/db.js';
import { isRedisAvailable } from './lib/redis.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve everything from this file, never from process.cwd(). The old code
// mixed path.resolve() (cwd-dependent) with __dirname, which is why the locales
// path kept breaking between local runs and Render.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Render terminates TLS in front of the app. Without this, `secure` cookies are
// never set and req.protocol is wrong.
app.set('trust proxy', 1);

// Cookies are sent with credentials, so an unrestricted origin is unsafe once
// CLIENT_URL is configured. Falls back to open CORS when it is unset so local
// development keeps working.
const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" })); // for parsing application/json
app.use(cookieParser());
app.use('/locales', express.static(path.join(__dirname, 'locales')));

// Health check. Render points its health check here, and an uptime pinger can
// hit it to keep the free instance from spinning down.
app.get('/api/health', (req, res) => {
    const dbUp = isDbConnected();

    res.status(dbUp ? 200 : 503).json({
        status: dbUp ? 'ok' : 'degraded',
        database: dbUp ? 'connected' : 'disconnected',
        cache: isRedisAvailable() ? 'connected' : 'unavailable',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', prodectRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/analytics', analyticsRoutes);

// An unmatched /api path must 404 as JSON, not fall through to index.html.
app.use('/api', (req, res) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(projectRoot, 'frontend', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(projectRoot, 'frontend', 'dist', 'index.html'));
    });
}

// Central error handler. Without one, a thrown error in any route leaves the
// request hanging until the client times out.
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    if (res.headersSent) return next(error);

    res.status(error.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Server error' : error.message,
    });
});

// A rejected promise or a thrown error outside a request must not take the
// process down silently — log it and keep serving.
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

const start = () => {
    // Bind the port first. connectDB retries for up to ~80s in the worst case,
    // and Render marks a deploy failed if nothing is listening before then.
    // The server comes up immediately and /api/health reports 503 until the
    // database is actually reachable.
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    connectDB();

    const shutdown = (signal) => {
        console.log(`${signal} received — shutting down`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
