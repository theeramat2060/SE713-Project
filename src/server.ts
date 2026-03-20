import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {errorHandler} from './middlewares/errorHandlerMiddleware';
import routes from './routes';
import multer from 'multer';
import { uploadFile } from './services/UploadFileService';

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.get('/start', (req, res) => {
    res.json({status: 'ok'});
});

app.use('/api', routes);

app.all(/.*/, (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


