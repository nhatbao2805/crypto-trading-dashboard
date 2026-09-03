const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');
const CONSTANTS = require('./config/constants');
const routeDispatcher = require('./routes/index');
const serveStatic = require('./middlewares/staticServer');
const errorHandler = require('./middlewares/errorHandler');

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function createApp() {
  const server = http.createServer(async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
      // 2. Image Upload Handler
      if (pathname === '/api/upload' && req.method === 'POST') {
        const body = await parseBody(req);
        const image = body.base64Data || body.image;
        const filename = body.filename || 'screenshot.png';
        if (!image) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'No image provided' }));
        }

        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer;
        let ext = '.png';
        if (matches && matches.length === 3) {
          buffer = Buffer.from(matches[2], 'base64');
          if (matches[1].includes('jpeg') || matches[1].includes('jpg')) ext = '.jpg';
          if (matches[1].includes('webp')) ext = '.webp';
        } else {
          buffer = Buffer.from(image, 'base64');
        }

        const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const targetPath = path.join(CONSTANTS.UPLOADS_DIR, cleanName);
        fs.writeFileSync(targetPath, buffer);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, url: `/uploads/${cleanName}`, filename: cleanName }));
      }

      // 3. Parse JSON Body for API routes
      let body = {};
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        body = await parseBody(req);
      }

      // 4. Dispatch API Routes
      const handled = await routeDispatcher(req, res, parsedUrl, body);
      if (handled) return;

      // 5. Static File & Frontend SPA Fallback
      serveStatic(req, res, pathname);

    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  return server;
}

function startServer(port = CONSTANTS.PORT) {
  const server = createApp();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Cảnh báo: Cổng ${port} đang được sử dụng bởi một tiến trình khác.`);
      console.error(`👉 Để giải phóng cổng ${port}, hãy chạy lệnh: kill -9 $(lsof -ti:${port})`);
      console.error(`👉 Hoặc khởi động với cổng khác: PORT=3001 npm start\n`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Modular Crypto Trading Dashboard Server is running!`);
    console.log(`🌐 Dashboard URL: http://localhost:${port}`);
    console.log(`📂 Database: data/dashboard.sqlite`);
    console.log(`📁 Uploads : uploads/`);
    console.log(`🏛️  Multi-Agent Council: Ready`);
    console.log(`======================================================\n`);
  });

  return server;
}

module.exports = {
  createApp,
  startServer
};
