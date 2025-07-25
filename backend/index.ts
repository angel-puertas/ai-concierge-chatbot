import 'dotenv/config' // Load environment variables first
import express, { Express, Request, Response } from 'express';
import chatRoutes from './routes/chat.js';
import mongoose from 'mongoose';
import payload from 'payload';
import payloadConfig from './payload.config.js';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT;

const start = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Initialize Payload CMS
    console.log('Initializing Payload CMS...');
    await payload.init({
      config: payloadConfig,
    });
    console.log('Payload CMS initialized successfully');

    // MongoDB connection
    console.log('Connecting to MongoDB...');
    if (!process.env.DATABASE_URI) {
      throw new Error('DATABASE_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('MongoDB connected successfully');

    // CORS configuration
    const corsOptions = {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
    };
    
    // Middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Custom app routes
    console.log('Setting up routes...');
    app.use('/api', chatRoutes);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });

    app.get('/api', (req: Request, res: Response) => {
      res.send('Express + TypeScript Server');
    });

    // Start Express server
    const server = app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[payload]: Admin panel at http://localhost:${port}/admin`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') throw error;
      
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${port} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          console.error(`Port ${port} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('Failed to start server:');
    console.error(error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();