import supertest from 'supertest';
import app from '../app';
import dataValidation from '../../test/movements/router-validation.json';
import movementsService from '../services/movements';
import { HttpException } from '../domain/utils';

describe(`router: movements`, () => {
    // helper to transform date string to date objects, as Joi transforms these
    const transformToExpectedDate = (data: any) => {
        for (const m of data.movements) {
            m.date = new Date(m.date);
        }
        for (const m of data.balances) {
            m.date = new Date(m.date);
        }
    };
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it.each(
        dataValidation as [string, any, boolean][]
    )(`should propagate valid input to service, scenario "%s"`, async (title: string, input: any, valid: boolean) => {
        const serviceReturn = [{ message: 'meuh' }];
        const serviceSpy = jest.spyOn(movementsService, 'validation').mockImplementation(() => {
            return serviceReturn;
        });
        await supertest(app)
            .post('/movements/validation')
            .send(input)
            .expect(res => {
                if (valid) {
                    expect(res.status).toBe(202);
                    expect(serviceSpy).toHaveBeenCalledTimes(1);
                    expect(res.body).toEqual(serviceReturn);
                    transformToExpectedDate(input); // mimic Joi conversion
                    expect(serviceSpy).toHaveBeenLastCalledWith(input);
                } else {
                    expect(res.status).toBe(400);
                    expect(serviceSpy).toHaveBeenCalledTimes(0);
                }
            });
    });
    it(`should throw HTTP 500 as a default`, async () => {
        const serviceSpy = jest.spyOn(movementsService, 'validation').mockImplementation(() => {
            throw new Error(`not a proper HttpException with a neat statusCode`);
        });
        await supertest(app)
            .post('/movements/validation')
            .send((<any>dataValidation.find(data => data[2]))[1]) // use any input data where valid=true (pass Joi)
            .expect(500);
    });
    it(`should use statusCode if any`, async () => {
        const serviceSpy = jest.spyOn(movementsService, 'validation').mockImplementation(() => {
            throw new HttpException(`with code!`, 404);
        });
        await supertest(app)
            .post('/movements/validation')
            .send((<any>dataValidation.find(data => data[2]))[1]) // use any input data where valid=true (pass Joi)
            .expect(404);
    });
});
