'use strict';


module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.round = 0;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];
        }
        this.last = [];
    }

    offer(offer) {

        if (offer) {
            let sum = 0;
            for (let i = 0; i < offer.length; i++) {
                sum += this.values[i] * offer[i];
            }

            if (sum > this.total / 2 || (this.last.length && (this.last[this.round - 1] < sum))) {
                return;
            }

            this.last.push(sum);
        } else {
            offer = this.counts.slice();
            for (let i = 0; i < offer.length; i++) {
                if (!this.values[i])
                    offer[i] = 0;
            }
            return offer;
        }

        let important = [];
        for (let i = 0; i < offer.length; i++) {
            important.push({
                i,
                value: this.values[i] * offer[i],
                offer: offer[i]
            });
        }

        important.sort((a, b) => {
            return a.value - b.value;
        });


        let myProp = [];
        let howManyICanGive = this.total / 2;
        for (let i = 0; i < offer.length; i++) {

            myProp[important[i].i] = important[i].offer;
            howManyICanGive -= important[i].value;

            if (howManyICanGive <= 0) {
                break;
            }
        }

        offer = this.counts.slice();
        for (let i = 0; i < offer.length; i++) {
            offer[i] -= myProp[i];
            offer[i] = Math.max(0, offer[i]);
        }

        return offer;
    }
};