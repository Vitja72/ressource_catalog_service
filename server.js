import express from 'express';
import resourcesRouter from './routers/resources.js';


const app = express();

const port = 5002;

app.use(express.json());
app.use('/resources', resourcesRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});