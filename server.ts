import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db/index';
import { apiRouter } from './src/server/routes/api';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize Relational Database State
  await db.init();

  // Middleware for body parsing
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      product: 'BE SAWA',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'PostgreSQL' : 'ACID Relational Local Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router FIRST
  app.use('/api', apiRouter);

  // Serve only same-origin public assets. The frontend is served by this app,
  // so permissive cross-origin asset access is unnecessary.
  const publicPath = path.join(process.cwd(), 'public');
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });

  // Explicit static route handlers for public folder & images subdirectories
  app.use('/images', express.static(path.join(publicPath, 'images'), { maxAge: '1h', fallthrough: true }));
  app.use(express.static(publicPath, { maxAge: '1h', fallthrough: true }));

  // Fallback handler for images (e.g. if .webp requested, check .jpg or top-level filename)
  app.get(['*.jpg', '*.jpeg', '*.png', '*.webp', '*.svg'], (req, res, next) => {
    const rawPath = req.path;
    const fs = require('fs');
    const tryPaths = [
      path.join(publicPath, rawPath),
      path.join(publicPath, 'images', rawPath),
      path.join(publicPath, rawPath.replace(/\.webp$/, '.jpg')),
      path.join(publicPath, 'images', rawPath.replace(/\.webp$/, '.jpg')),
      path.join(publicPath, path.basename(rawPath)),
      path.join(publicPath, 'images', 'therapists', path.basename(rawPath)),
      path.join(publicPath, 'images', 'founder', path.basename(rawPath)),
      path.join(publicPath, 'images', 'resources', path.basename(rawPath)),
    ];

    for (const testPath of tryPaths) {
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        return res.sendFile(testPath);
      }
    }
    next();
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 BE SAWA server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start BE SAWA server:', err);
  process.exit(1);
});
