import express from 'express';
import cors from 'cors';
import routerDefault from './routes/default';
import routerMovements from './routes/movements';

const app = express();

if (!process.env.PORT) {
    throw new Error(`[app] envvar PORT not defined`);
}
app.set('port', process.env.PORT);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', routerDefault);
app.use('/movements', routerMovements);

export default app;
