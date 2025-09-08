import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { router } from '../routes/routes';
import { verifyTokenMiddleware } from '../middleware/verifyToken.middleware';

const appExpress = express();
appExpress.use(morgan('dev'));//Loggs HTTP requests
appExpress.use(express.json());//Respuestas en formato JSON
appExpress.use(cors());//Permite solicitudes desde otros dominios
appExpress.use('/api', router, verifyTokenMiddleware);//Rutas

export default appExpress;