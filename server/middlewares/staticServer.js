const fs = require('node:fs');
const path = require('node:path');
const CONSTANTS = require('../config/constants');

function serveStatic(req, res, pathname) {
  // If request is an API path that reached staticServer, it means it's an unhandled API route
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ error: `API route not found: ${req.method} ${pathname}` }));
  }

  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let filePath;

  if (reqPath.startsWith('/uploads/')) {
    filePath = path.join(CONSTANTS.UPLOADS_DIR, reqPath.replace('/uploads/', ''));
  } else {
    filePath = path.join(CONSTANTS.DIST_DIR, reqPath);
  }

  // Prevent directory traversal
  if (!filePath.startsWith(CONSTANTS.DIST_DIR) && !filePath.startsWith(CONSTANTS.UPLOADS_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing to index.html
      const fallbackPath = path.join(CONSTANTS.DIST_DIR, 'index.html');
      fs.readFile(fallbackPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found - Please run npm run build');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONSTANTS.MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

module.exports = serveStatic;
