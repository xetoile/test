import { Request, Response, Router } from 'express';

const r = Router();

r.get('/', (req: Request, res: Response) => {
    res.send(`test server up and running!`);
});

export default r;
