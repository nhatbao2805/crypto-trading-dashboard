function errorHandler(err, req, res) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);
  const status = err.status || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)';
  
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: message, status }));
}

module.exports = errorHandler;
