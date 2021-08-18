import { Request, Response, Router } from 'express';
import Joi from 'joi';
import { sanitizer } from '../domain/utils';
import { Movements } from '../domain/types';
import movementsService from '../services/movements';

const r = Router();

// sanitization schema for /validation
const joiValidation = Joi.object({
    // required although may be empty (no money movement in the timelapse is possible)
    movements: Joi.array().items(Joi.object({
        id: Joi.number(),
        date: Joi.date(),
        label: Joi.string(),
        amount: Joi.number()
    })).required(),
    // balances: at least 2 bounds are expected
    // service should validate the date bounds (router only handles the shape)
    balances: Joi.array().items(Joi.object({
        date: Joi.date(),
        balance: Joi.number()
    })).min(2).required()
});
/*
interface contract: all JSON
input:
{
    movements: [
        { id, date, label, amount }
    ],
    balances: [
        { date, balance }
    ] (min-length = 2)
}
output:
202 | 400 | 418
{
    [
        message: string,
        frame?: [
            { date, balance } | null
        ], (length = 2)
        movements?: [
            { id, date, label, amount }
        ]
    ]
}
*/
r.post('/validation', async (req: Request, res: Response) => {
    try {
        const input: Movements.Validation = await sanitizer(req.body, joiValidation);
        const output = movementsService.validation(input);
        res.status(202).send(output);
    } catch (e) {
        res.status(e.statusCode || 500).send(e);
    }
});

export default r;
