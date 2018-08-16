'use strict';

class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.round = 0;
        this.log = log;
        this.n = counts.length;

        this.total = this.getTotal(this.counts, this.values);
        this.half = this.total / 2;

        this.moves = this.rfindAll(this.counts)
            .map((counts, id) => ({ counts, total: this.getTotal(counts, this.values) }))
            .filter(s => s.total >= this.half)
            .sort((a, b) => b.total - a.total);

        if (this.moves.length > this.max_rounds) {
            this.moves = this.moves.slice(1);
        }

        this.myw = this.calcImportance(this.moves);
        //this.log(JSON.stringify(this.moves));

        this.history = { my: [], op: [] };
    }

    rfindAll(c) {
        const arr = new Array(c.length);
        const values = this.values;
        const results = [];

        (function foo(i = 0) {
            const stop = values[i] === 0 ? 0 : c[i]
            for (let j = 0; j <= stop; j++) {
                arr[i] = j;
                if (i === c.length - 1) {
                    results.push(arr.slice(0));
                } else {
                    foo(i + 1);
                }
            }
        })();

        return results;
    }

    sum(items) {
        let sum = 0;
        for (let i = 0; i < items.length; i++) {
            sum += items[i];
        }
        return sum;
    }

    getTotal(counts, values) {
        let total = 0;
        for (let i = 0; i < counts.length; i++) {
            total += counts[i] * values[i];
        }
        return total;
    }

    getReverseCounts(c) {
        const reverse = new Array(c.length);
        for (let i = 0; i < c.length; i++) {
            reverse[i] = this.counts[i] - c[i];
        }
        return reverse;
    }

    isOpPrefer(move) {
        for (let i = 0; i < move.counts.length; i++) {
            if ((1 - this.opw[i]) <= 0.15 && move.counts[i] === 0) {
                return true;
            }
        }
        return false;
    }

    strategy1() {
        if (this.opw) {
            const preferred = this.moves
                .filter(s => !s.used)
                .find(s => this.isOpPrefer(s));

            const threshold = Math.max(this.total - this.round, this.half);
            if (preferred && preferred.total >= threshold) {
                preferred.used = true;
                return preferred.counts;
            }
        }

        return this.moves
            .find(s => !s.used)
            .counts;
    }

    strategy2() {
        const k = this.moves.length / this.max_rounds * (this.round - 1);
        const index = Math.min(Math.floor(k), this.moves.length - 1);
        return this.moves[index].counts;
    }

    isGoodDeal(o) {
        const threshold = Math.max(this.total - this.round, this.half);
        const total = this.getTotal(o, this.values);
        return total >= threshold;
    }

    calcImportance(moves) {
        const sum = new Array(this.n).fill(0);
        for (let i = 0; i < moves.length; i++) {
            for (let j = 0; j < moves[i].counts.length; j++) {
                sum[j] += moves[i].counts[j];
            }
        }

        const imp = new Array(this.n);
        for (let i = 0; i < sum.length; i++) {
            imp[i] = sum[i] / (this.counts[i] * moves.length);
        }
        return imp;
    }

    offer(o) {
        this.round += 1;
        this.log(`${this.round} round`);

        if (o) {
            const reverse = this.getReverseCounts(o);
            this.history.op.push({
                counts: reverse,
                total: this.getTotal(reverse, this.values)
            });

            this.opw = this.calcImportance(this.history.op);
            //this.log(`opw=[${this.opw.join(',')}]`);

            if (this.isGoodDeal(o)) {
                return;
            }
        }

        const move = this.moves.length >= this.max_rounds
            ? this.strategy1()
            : this.strategy2();

        this.history.my.push(move);
        return move;
    }
};

module.exports = Agent;