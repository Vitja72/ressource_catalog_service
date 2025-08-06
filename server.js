import express from 'express';
import resourcesRouter from './routes/resources.js';
import { errorHandler } from './middleware/error_handler.js';

const port = 5002;

const app = express();

// Middleware
app.use(express.json());


// Routes
app.use('/resources', resourcesRouter);


// Middleware für Fehlerbahandlung
app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});