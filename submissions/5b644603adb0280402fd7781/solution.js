'use strict';

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.current_round = 0;
        this.log = log;
        this.total = this.countTotal(counts, values);
        this.min_total = 0.1 * this.total;
        this.discount = Math.max(...values.map((value, i) => {
            let count = counts[i];

            do {
                let total = count * value;

                if (total <= this.total - this.min_total) {
                    return total;
                }
            } while (count--);

            return 0;
        }));
        this.step = this.discount ** (1 - this.discount / this.total) / max_rounds;
        this.discounts = [...new Array(max_rounds)].map((discount, i) => Math.round(((i + 1) * this.step) ** (this.total / (this.total - this.discount))) || 1);
        this.best_offer = this.counts.map((count, i) => this.values[i] ? count : 0);
        this.enemy_offers = new Map();
        this.diff = null;
        this.last_index = 0;

        if (this.discount) {
            this.log(`Hooray, today we have discounts: ${Math.round(this.discount / this.total * 100)}%.`);
        } else {
            this.log('Damn, no discounts today.');
        }
    }
    offer(o) {
        let total;
        let discount_value;
        let discounted_total;
        let diff;
        let prev_diff;

        this.log(`${this.max_rounds - this.current_round} rounds left from ${this.max_rounds}`);
        this.current_round++;

        if (!o) {
            return this.best_offer;
        }

        total = this.countTotal(o, this.values);

        if (total >= this.total) {
            return;
        }

        discount_value = this.discounts[this.current_round - 1];
        discounted_total = this.total - discount_value;

        if (this.me && this.current_round >= this.max_rounds && total || total >= discounted_total) {
            return;
        }

        for (let total of Array.from(this.enemy_offers.keys()).sort((a, b) => b - a)) {
            if (total >= discounted_total) {
                return this.enemy_offers.get(total);
            }
        }

        this.enemy_offers.set(total, o);
        prev_diff = Array.isArray(this.diff) ? [...this.diff] : null;
        diff = this.best_offer.map((count, i) => Math.max(0, count - o[i]));
        this.diff = [...diff];
        o = [...this.best_offer];

        if (prev_diff !== null) {
            while (discount_value > 0 && diff.findIndex(count => count > 0) !== -1) {
                let i = prev_diff.findIndex((count, i) => count > 0 && count === diff[i] && this.values[i] <= discount_value);

                if (i === -1) {
                    break;
                }

                prev_diff[i] = diff[i] = Math.max(0, diff[i] - 1);
                o[i] = Math.max(0, o[i] - 1);
                discount_value -= this.values[i];
            }
        }

        while (discount_value > 0 && diff.findIndex(count => count > 0) !== -1) {
            let i = diff.indexOf(Math.max(...diff));

            if (this.values[i] > discount_value) {
                diff[i] = 0;
                continue;
            }

            diff[i] = Math.max(0, diff[i] - 1);
            o[i] = Math.max(0, o[i] - 1);
            discount_value -= this.values[i];
        }

        while (discount_value > 0) {
            let i = -1;

            for (let j = this.last_index; j < this.values.length + this.last_index; j++) {
                let k = j % this.values.length;

                if (this.values[k] && this.values[k] <= discount_value) {
                    i = k;
                    break;
                }
            }

            if (i === -1) {
                break;
            }

            this.last_index = i;
            o[i] = Math.max(0, o[i] - 1);
            discount_value -= this.values[i];
        }

        return o;
    }
    countTotal(counts, values) {
        return counts.reduce((total, count, i) => total + count * values[i], 0);
    }
};