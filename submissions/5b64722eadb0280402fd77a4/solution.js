'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];

        this.offers = [];
        this.offersCount = 0;
        for (let i = 0; i < total; i++) {
            for (let j = 0; j < total; j++) {
                for (let k = 0; k < total; k++) {
                    if (i <= counts[0] && j <= counts[1] && k <= counts[2]) { // fixme take total as 3 till changes
                        offers.push({
                            value: values[0] * i + values[1] * j + values[2] * k,
                            indexes: [i, j, k]
                        });
                    }
                }
            }
        }

        offers.sort(function(o1, o2) {
            return o1.value <= o2.value;
        });
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o) {
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            if (sum >= this.total - 3)
                return;
        }

        return offers[offersCount++];
    }
};
