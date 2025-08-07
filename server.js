import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import resourcesRouter from './routes/resources.js';
import { errorHandler } from './middleware/error_handler.js';

const PORT = 5002;
// const PORT = process.env.PORT || 5002;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Routes
app.use('/resources', resourcesRouter);


// Middleware für Fehlerbahandlung
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});