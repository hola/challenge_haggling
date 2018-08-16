'use strict'; /*jslint node:true*/

module.exports = class HalfOrAll {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o)
        {
            let sum = 0;
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
            if (sum>=this.total/2)
                return;
        }
        o = this.counts.slice();
        for (let i = 0; i<o.length; i++)
        {
            if (!this.values[i])
                o[i] = 0;
        }
        return o;
    }
};
