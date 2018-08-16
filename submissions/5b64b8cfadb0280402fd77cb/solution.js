'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.received = counts
        this.sent = counts
        this.min_val = 0;
        this.min_idx = 0;
        for (let i = 0; i<counts.length; i++)
        {   
            if (values[i] <= this.min_val) 
            {
                this.min_val = values[i];
                this.min_idx = i;
            }
        }
    }
    offer(o){
        this.rounds--;
        if (o)
        {
            this.received = o
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            if (this.rounds > 5 && sum >= this.total*0.6)
                return;
            if (this.rounds <= 1 && sum >= 5)
                return;
        }

        o = this.sent.slice()
        let sum = 0;
        for (let i = 0; i < o.length; i++)
            sum += this.values[i] * this.received[i];
        if (sum >= 8)
            return this.received;
        if (this.rounds <= 1 && sum >= 5)
            return this.received;

        let new_min = this.min_idx
        if (this.rounds >= 3)
        {
            for (let i = 0; i < o.length; i++) {
                if (this.values[new_min] > this.values[i])
                    new_min = i;
            }
        }
        for (let i = 0; i < o.length; i++)
        {
            if (this.values[i] > this.values[new_min])
            {
                o[i] = this.counts[i];
            }
            else
            {
                this.min_idx = i;
                o[i] = 0;
            }
        }
        this.sent = o
        return o;
    }
};
