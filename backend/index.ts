import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use chat routes
app.use('/', chatRoutes);

// A simple route for testing
app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

// Start the server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});