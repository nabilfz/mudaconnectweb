import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import chatApi from './api/chat.js';
import contactApi from './api/contact.js';
import contactReplyApi from './api/contact-reply.js';
import interestApi from './api/interest.js';
import interestDecisionApi from './api/interest-decision.js';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

function createWebAdapter(handler: { fetch: (request: Request) => Promise<Response> }) {
  return async (req: express.Request, res: express.Response) => {
    try {
      const origin = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
      const url = `${origin}${req.originalUrl || req.url}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      let bodyText: string | undefined = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        bodyText = await new Promise<string>((resolve, reject) => {
          let data = '';
          req.setEncoding('utf8');
          req.on('data', (chunk) => {
            data += chunk;
          });
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });
      }

      const webRequest = new Request(url, {
        method: req.method,
        headers,
        body: bodyText,
      });

      const webResponse = await handler.fetch(webRequest);

      res.status(webResponse.status);
      webResponse.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });

      const responseText = await webResponse.text();
      res.send(responseText);
    } catch (error) {
      console.error('Server error processing API request:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
    );

    if (isProduction) {
      res.setHeader('Content-Security-Policy', contentSecurityPolicy);
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    next();
  });

  app.use('/api/chat', createWebAdapter(chatApi));
  app.use('/api/contact', createWebAdapter(contactApi));
  app.use('/api/contact-reply', createWebAdapter(contactReplyApi));
  app.use('/api/interest', createWebAdapter(interestApi));
  app.use('/api/interest-decision', createWebAdapter(interestDecisionApi));

  // Vite middleware for development
  if (!isProduction) {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
