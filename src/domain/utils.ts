import Joi from 'joi';

// router exception with HTTP code
export class HttpException extends Error {
    constructor(
        msg: any,
        public readonly statusCode = 500,
        public readonly reasons: any[] = []
    ) {
        super(msg);
    }
}

// router sanitization abstration
export const sanitizer = async (payload: any, schema: Joi.Schema<any>): Promise<any> => {
    try {
        return await schema.validateAsync(
            payload,
            {
                dateFormat: 'utc'
            }
        );
    } catch (e) {
        throw new HttpException(e, 400);
    }
};
