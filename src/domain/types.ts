export namespace Movements {
    export interface Validation {
        movements: {
            id: number;
            date: Date;
            label: string;
            amount: number
        }[];
        balances: {
            date: Date;
            balance: number;
        }[];
    }
    export interface ValidationInformation {
        message: string;
        frame?: [
            Validation['balances'][0] | null,
            Validation['balances'][0] | null
        ];
        movements?: Validation['movements'];
    }
}
