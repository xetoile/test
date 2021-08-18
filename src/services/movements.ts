import { HttpException } from '../domain/utils';
import { Movements } from '../domain/types';

class MovementsService {
    // Array.sort helper for nested .date props, used in .validation (no use of this => no need to bind)
    private sorter(a: { date: Date }, b: typeof a) {
        return +a.date - +b.date;
    }
    // business sanitization of movements - data altered in place (no return)
    private sanitizeMovements(movements: Movements.Validation['movements']): void {
        // ensure there're no dupes in the movements
        const len = movements.length;
        movements.splice(
            0,
            len,
            ...<Movements.Validation['movements']>Object.values(
                movements.reduce((acc, m) => {
                    acc[m.id] = m;
                    return acc;
                }, {} as any)
            )
        );
        // chronologically sort our data to ease the job
        movements.sort(this.sorter);
    }
    // business sanitization of balances - data altered in place (no return)
    private sanitizeBalances(balances: Movements.Validation['balances']): void {
        // chronologically sort our data to ease the job
        balances.sort(this.sorter);
    }
    // business sanitization of movements vs. balances (cut off the out of date movements)
    // to be called after this.sanitize* methods (relies on chronological order of items)
    // the input is actually changed in place
    private sanitizeOutOfBounds(
        { movements, balances }: Movements.Validation,
        out: Movements.ValidationInformation[]
    ): void {
        const b0 = balances[0].date; // there are always at least 2 balances
        while (movements.length && movements[0].date < b0) {
            out.push({
                message: `[skipped] out of bound movement`,
                frame: [null, balances[0]],
                movements: [movements[0]]
            });
            movements.shift();
        }
        const bN = balances[balances.length - 1].date;
        // use >=: same date means the milestone was computed before the movement was considered (so it's OOB)
        while (movements.length && movements[movements.length - 1].date >= bN) {
            out.push({
                message: `[skipped] out of bound movement`,
                frame: [balances[balances.length - 1], null],
                movements: [movements[movements.length - 1]]
            });
            movements.pop();
        }
    }
    // abstraction for frame validation (to be refined with a better typing, probably)
    private validateFrame({
        balances,
        movements,
        sum,
        mLastFrameStart,
        mIndex,
        out
    }: Movements.Validation & {
        sum: number,
        mLastFrameStart: number,
        mIndex: number,
        out: Movements.ValidationInformation[]
    }): boolean {
        const frameDelta = balances[1].balance - balances[0].balance;
        const invalid = sum !== frameDelta;
        if (invalid) {
            out.push({
                message: `[invalid] inconsistent frame: movements sum is ${sum}, frame delta is ${frameDelta}`,
                frame: [balances[0], balances[1]],
                movements: movements.slice(mLastFrameStart, mIndex)
            });
        }
        return invalid;
    }
    // validates movements in-between balance milestones
    // expects both args to be ordered by their .date
    public validation({
        movements,
        balances
    }: Movements.Validation): Movements.ValidationInformation[] {
        const out: Movements.ValidationInformation[] = [];
        let invalid = false;
        // the base structure to be passed to this.validateFrame (wouldn't need to pre-declare everything, but TypeScript has its ways...)
        const data = {
            balances,
            movements,
            sum: 0,
            mLastFrameStart: 0,
            mIndex: 0,
            out
        };
        // 1. business sanitization (cannot make invalid, only provide information on skipped items)
        this.sanitizeMovements(movements);
        this.sanitizeBalances(balances);
        this.sanitizeOutOfBounds({ movements, balances }, out);
        // 2. validate remaining in-bounds movements (may make the process invalid)
        let sum = 0;
        // these 2 counters are only here to extract a slice of movements in case of inconsistency
        let mIndex = 0;
        let mLastFrameStart = 0;
        for (const m of movements) {
            // pseudo-stopping condition: timeframe from { balances[0], balances[1] }
            // consider >= on outer bound (exclude a movement of same date as outer bound as milestone computation won't have considered it)
            if (m.date >= balances[1].date) {
                // 2.1. validate
                data.sum = sum;
                data.mLastFrameStart = mLastFrameStart;
                data.mIndex = mIndex;
                invalid = this.validateFrame(data) || invalid; // stay true if you switched already
                // 2.2. prepare for next frame
                sum = 0;
                mLastFrameStart = mIndex;
                balances.shift();
            }
            // 2.3. keep walking
            sum += m.amount;
            mIndex++;
        }
        // 2.4. finalize last frame
        data.sum = sum;
        data.mLastFrameStart = mLastFrameStart;
        data.mIndex = movements.length;
        invalid = this.validateFrame(data) || invalid;
        // 3. return messages or blow
        if (invalid) {
            throw new HttpException(`I'm not a kettle!`, 418, out);
        }
        return out;
    }
}

export default new MovementsService();
