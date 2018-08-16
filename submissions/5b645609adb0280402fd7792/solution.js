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
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        //if it's first round, o is undefined, ask for everything
        if (!o && this.rounds > 0)
        {
            o = this.counts.slice();
            for (let i = 0; i < o.length; i++)
            {
                if (!this.values[i])
                {
                    o[i] = 0;
                }
            }
            return o;
        }
        //accept the offer if no more round
        if (this.rounds == 0) {
            return;
        }
        
        if (o)
        {
            var v1 = this.values.slice();
            var ans1 = o.slice();
            let chance = this.rounds;
            while (chance > 0) {
                let ind = 0;
                for (let i = 0; i < o.length; i++) {
                    if (v1[i] > v1[ind]){
                        ind = i;
                    }
                }
                if (v1[ind] == 0) {
                    break;
                }
                var diff = this.counts[ind] - ans1[ind];
                if (diff > chance) {
                    diff = chance;
                }
                ans1[ind] += diff;
                chance -= diff;
                v1[ind] = 0;
            }
            for (let i = 0; i < o.length; i++) {
                if (!this.values[i]){
                    ans1[i] = 0;
                }
            }
            if (chance == this.rounds) {
                return;
            }
            return ans1;
        }
        return;
    }
};
