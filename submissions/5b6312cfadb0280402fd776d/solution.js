'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me_first = !me;
        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.round = 0;
        this.log = log;
        this.total = this.calcSum(this.counts);
        this.acceptable = [];
        this.bid = this.counts;
    }
    offer(o){
        this.round++;
        // this.showMyData(o);
        const good_offer = this.checkOffer(o);
        if (good_offer > this.total * 0.8)
            return undefined;
        this.findConcessions();
        //if this is my last bid, I am trying to accept one of the acceptable counteroffers
        if (this.round == this.max_rounds) {
            if (this.me_first) {
                if (this.acceptable.length)
                    return this.acceptable.sort((a, b) => b - a)[0][1]
            } 
            else if (good_offer)
                return undefined;
            }
        return this.bid;
    }
    init() {
    }
    calcSum(counts) {
        return counts.reduce((sum, cur, i) => sum + cur*this.values[i], 0);
    }
    checkOffer(o) {
        if (!o)
            return;
        const sum = this.calcSum(o);
        if (sum >= this.total/2) {
            this.acceptable.push([sum, o]);
            return sum;
        }
        return false
    }
    findConcessions() {
        const sum = this.calcSum(this.bid);
        const limit = this.total * 0.7
        if (sum < limit)
            return;
        let min = {
            value: this.total,
            index: -1
        };
        this.values.forEach((v, i) => {
            if (v < min.value && this.bid[i] > 0)
                min = {value: v, index: i};
        })
        if (min.index == -1 || sum - min.value < limit)
            return;
        this.bid[min.index]--;
    }
    showMyData(o) {
        this.log(`
            round: ${this.round}
            me_first: ${this.me_first}
            counts: ${this.counts}
            values: ${this.values}
            total: ${this.total}
            bid: ${this.bid}
            offer: ${o}
            acceptable: ${this.acceptable.join(" | ")}
        `);
    }
};
