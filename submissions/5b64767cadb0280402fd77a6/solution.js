'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts
        this.values = values
        this.rounds = max_rounds
        this.log = log
        this.total = this.getSum(counts, values)

        this.log(`Solution script`)
    }

    offer(offer){
        this.log(`${this.rounds} rounds left`)
        this.rounds--

        let minValue = this.random(Math.floor(0.8 * this.total), Math.floor(0.9 * this.total))
        let maxValue = this.total

        if(offer) {
            this.log(`Check offer with sum ${this.getSum(offer, this.values)} in range ${minValue} and ${maxValue}`)
            if(this.isOfferInRange(offer, this.values, minValue, maxValue)) {
                return
            }
        }

        offer = this.calcOffer(this.counts, this.values, minValue, maxValue)
        this.log(`Calc offer with sum ${this.getSum(offer, this.values)}`)

        return offer
    }

    calcOffer(counts, values, minValue, maxValue) {
        while(true) {
            let offer = counts.map(it => this.random(0, it))

            if(this.isOfferInRange(offer, values, minValue, maxValue)) {
              return offer
            }
        }
    }

    isOfferInRange(offer, values, minValue, maxValue) {
        let sum = this.getSum(offer, values);

        return minValue <= sum && sum <= maxValue
    }

    getSum(offer, values) {
        let sum = 0

        for(let i = 0; i < offer.length; i++) {
            sum += offer[i] * values[i]
        }

        return sum
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
