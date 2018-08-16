'use strict'; /*jslint node:true*/

const agreementPercentage = 0.6;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.isFirstOffer = true;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o && !this.isFirstOffer)
        {

            this.log(`his offer: ${o}`);
            let sum = 0;
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
            if (sum>=this.total*agreementPercentage)
                return;
        }
        if(o && this.isFirstOffer){
            this.isFirstOffer = false;
        }

        o = this.counts.slice();

        let sum = 0;
        while(sum < this.total*agreementPercentage) {
            for (let i = 0; i < o.length; i++) {
                o[i] = getRandomInt(this.counts[i]+1);
            }

            sum = 0;
            for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
        }
        this.log(`my offer: ${o}`);
        return o;
    }
};
