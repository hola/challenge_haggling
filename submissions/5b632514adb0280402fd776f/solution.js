'use strict'; /*jslint node:true*/

module.exports = class Agent  {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];
        this.opponentWants = [0, 0, 0]
    }

    offer(o) {
        this.rounds--;
        if (o)
        {
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i]*o[i];
            if (this.rounds == 0 && this.me == 1 && sum > 0)
                return;
            if (sum > 9)
                return;
            for (let i = 0; i < o.length; i++)
                this.opponentWants[i] += this.counts[i] - o[i];
            let max = -1
            let index = -1
            for (let i = 0; i < o.length; i++) {
                if (this.values[i] > 8)
                    continue
                let w = this.opponentWants[i] / this.counts[i]
                if (w == max) {
                    if (this.values[i] < this.values[index]) {
                        max = w
                        index = i 
                    }
                } else if (w > max) {
                    max = w
                    index = i
                }
            }
            
            o = this.counts.slice();
            let flag = false
            for (let i = 0; i < o.length; i++)
                if (this.values[i] == 0) {
                    o[i] = 0
                    flag = true
                }
            if ((!flag || this.rounds == 0) && o[index] > 0)
                o[index]--;
            return o;
        } else { 
            return this.counts.slice();
        }
    }
};
