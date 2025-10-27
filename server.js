require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const validateToken = require('./src/middleware/validateToken');
const cors= require('cors');
const router = require('./src/router');
const db = require("./src/utils/sqlite.js");

// Validar variables de entorno críticas
if (!process.env.secret) {
  console.error('ERROR: SECRET environment variable is required');
  process.exit(1);
}

const app = express();

// Configuración más segura de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  exposedHeaders: 'auth-token',
  credentials: true
};

app.use(bodyParser.json({ limit: '10mb' }))
app.use(cors(corsOptions));
app.use('/', router.restRouter );

// Invalid route handler
app.use((req, res, next) => {
  const error = {
    code: -1,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  };
  console.log(`404 - ${req.method} ${req.originalUrl}`);
  return res.status(404).json(error);
});

// Global error handler
app.use((error, req, res, next) => {
  const errorResponse = {
    code: error.code || -999,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };
  
  console.error(`Error in ${req.method} ${req.originalUrl}:`, {
    code: errorResponse.code,
    message: errorResponse.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  const statusCode = error.status || (error.code < 0 ? 400 : 500);
  return res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Secret: ${process.env.secret ? 'Loaded' : 'Missing'}`);
  console.log(`CORS Origin: ${corsOptions.origin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});