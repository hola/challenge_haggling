'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me,counts,values,max_rounds,log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
    }
    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        let check = false;
        let sum = 0;
        if (o) {
            check = true;
            sum = 0;
            let rand = Math.random();
            let profit = Math.floor(this.total * 0.7);
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
            let chance = 1 - ((profit - sum) * 0.4);
            if (chance>=rand) {
                return;
            }
        }
        o = this.counts.slice();
        for (let i = 0; i < o.length; i++) {
            if (!this.values[i])
                o[i] = 0;
        }
        let count = 0;
        let min_index = [];
        let max = this.values.reduce((m,cnt) => Math.max(m,cnt),0);
        for (let i = 1; i <= max; i++) {
            this.values.forEach((e,ind) => {
                if (e === i) {
                    min_index.push(ind);
                    count += this.counts[ind];
                    if (count >= 4)
                        return;
                }
            });
            if (count >= 4)
                break;
        }
        var ind = 0;
        for (let j = 0; j < 4 - this.rounds; j++) {
            o[min_index[j]]--;
            ind = j;
        }
        if (check) {
            let sum1 = 0;
            for (let i = 0; i<o.length; i++)
                sum1 += this.values[i]*o[i];
            if (sum1 == 0) {
                o[min_index[ind]]++;
            } else if (sum > sum1)
                return;
        }
        return o;
    }
};