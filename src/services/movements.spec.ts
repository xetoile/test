import dataValidation from '../../test/movements/service-validation.json';
import movementsService from '../services/movements';
import { HttpException } from '../domain/utils';

describe(`service: movements`, () => {
    it.each(
        // disclaimer: test data uses standard ISO UTC date strings instead of date objects
        dataValidation as [string, any, any, boolean][]
    )(`should play scenario "%s"`, (title: string, input: any, expected: any, valid: boolean) => {
        // prepopulate vars otherwise stupid TypeScript believes we use the vars without init
        let output: ReturnType<typeof movementsService['validation']> = [{ message: 'fake message' }];
        let error: HttpException = new HttpException('fake error', 420);
        try {
            output = movementsService.validation(input);
        } catch (e) {
            error = e;
        }
        if (valid) {
            expect(error.statusCode).toBe(420); // tells the business didn't fire an error (original state)
            expect(output).toEqual(expected);
        } else {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.reasons).toEqual(expected);
            expect(error.statusCode).toBe(418);
        }
    });
});
