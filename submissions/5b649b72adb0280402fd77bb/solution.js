'use strict';

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.itemsNum = counts.length;
        this.counts = counts;
        this.values = values;
        this.roundsLeft = max_rounds;
        this.currentRound = 0;
        this.log = log;
        this.total = 0;
        this.bound = 0;

        for (let i = 0; i < this.itemsNum; i++) {
            this.total += counts[i] * values[i];
        }

        this.bound = Math.floor(this.total * 0.7);
        this.minAceptableSum = Math.floor(this.total * 0.2);
    }

    offer(o) {
        this.roundsLeft--;
        this.currentRound++;
        
        let sum = 0;

        if (o) {    
            for (let i = 0; i < this.itemsNum; i++)
                sum += this.values[i] * o[i];

            if (sum >= this.bound || (this.roundsLeft === 0 && sum > this.minAceptableSum))
                return;
        } else {
            o = (new Array(this.counts.length)).fill(0, 0, this.itemsNum);
        }
       
        let i = Math.floor(Math.random() * this.itemsNum);
        while (sum <= this.bound) {
            if (this.values[i] > 0 && this.counts[i] > o[i]) {
                o[i]++;
                sum += this.values[i];
            }
            if (this.values[i] === 0) {
                o[i] = 0;
            }

            if (i >= this.itemsNum) i = 0;
            else i++;
        }

        return o;
    }


};