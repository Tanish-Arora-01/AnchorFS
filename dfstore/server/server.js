// server.js
require('dotenv').config({ path: require('path').join(__dirname, '/.env') }); // must be first

const express = require('express');
const { connectMongo } = require('./src/db.js');            // ensure file exists
const filesRouter = require('./src/files.routes.js');       // ensure file exists
const verifyAuth = require('./src/auth.middleware.js');     // ensure file exists

const app = express();
app.use(express.json());

// Protected router under /api
app.use('/api', verifyAuth, filesRouter);

(async () => {
  await connectMongo(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/filesvc');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
})().catch(err => {
  console.error('Failed to connect Mongo:', err);
  process.exit(1);
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
