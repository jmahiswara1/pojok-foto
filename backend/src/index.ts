import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import frameLayoutRoutes from './routes/frameLayout.routes';
import photoProjectRoutes from './routes/photoProject.routes';
import './config/passport';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', frameLayoutRoutes);
app.use('/api', photoProjectRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Pojok Foto Backend API is running');
});

// Start server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
