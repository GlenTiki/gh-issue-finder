const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api/findIssues',
    proxy({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
