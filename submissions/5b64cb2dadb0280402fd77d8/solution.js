'use strict'; /*jslint node:true*/

function getOfferValue(offer, values) {
    return offer.reduce((acc, o, i) => acc + o * values[i], 0);
}

function getOfferVariants(counts, values, offerValue) {
    if (!counts.length && offerValue) return;

    const result = [];
    const [ maxCount, ...restCounts ] = counts;
    const [ value, ...restValues ] = values;

    for (let count = 0; count <= maxCount; count++) {
        const restValue  = offerValue - count * value;
        const rest = getOfferVariants(restCounts, restValues, restValue);
        if (rest) {
            if(rest.length) {
                rest.forEach(r => {
                    result.push([ count, ...r ]);
                });
            }
            else if(!restValue) {
               result.push([count, ...new Array(restCounts.length).fill(0)]);
            }
        }
    }

    return result;
}

// set from 0 to 1 depending on your opponent strategies
// set 0.6 to get 7.25 in a self to self competition
const MAGIC_CONST = 0.7;

module.exports = class Agent {
    constructor(me, counts, myValues, maxRounds, log){
        this.iAmFirst = !me;
        this.counts = counts;
        this.myValues = myValues;
        this.roundsLeft = maxRounds;
        this.maxRounds = maxRounds;
        this.log = log;

        this.total = counts.reduce((acc, c, i) => acc + c * myValues[i], 0);
        this.target = this.total;

        this.hisValueWeights = counts.map(_ => 0);
        this._ones = counts.map(_ => 1);
        this.nextOffers = [];
        this.weightUpdates = 0;
    }
    invertOffer(offer) {
        return this.counts.map((c, i) => c - offer[i]);
    }
    getHisOfferValue(myOffer) {
        return getOfferValue(this.invertOffer(myOffer), this.hisValueWeights);
    }
    sortNextOffersByHisValue() {
        this.nextOffers.sort((o1, o2) => {
            return this.getHisOfferValue(o2) - this.getHisOfferValue(o1);
        });
        this.log(`next: ${JSON.stringify(this.nextOffers)}`);
    }
    updateTarget() {
        this.target--;
        if(this.target < this.total * MAGIC_CONST && !this.overflow) {
            this.target = this.total;
            this.overflow = true;
        }
        this.log(`target: ${this.target}`);
    }
    ensureBestOffers() {
        while(!this.nextOffers.length) {
            this.nextOffers = getOfferVariants(this.counts, this.myValues, this.target)
                .filter(o => getOfferValue(this.invertOffer(o), this._ones) > 0)
                .filter(o => !this.weightUpdates || this.getHisOfferValue(o) > 0)
                .filter(o => {
                    for(let i = 0; i < o.length; i++) {
                        if(o[i] && !this.myValues[i]) {
                            return false;
                        }
                    };
                    return true;
                });
                
            if (!this.nextOffers.length) {
                this.updateTarget();
            }
        }
        this.overflow = false;
        this.sortNextOffersByHisValue();
    }
    getBestOffer() {
        this.ensureBestOffers();
        const result = this.nextOffers.shift();

        while(
            this.weightUpdates && this.nextOffers.length &&
            this.getHisOfferValue(result) <= this.getHisOfferValue(this.nextOffers[0])
        ) {
            this.log(`remove: ${this.nextOffers.shift()}`);
        }

        if(!this.nextOffers.length) {
            this.updateTarget();
        }

        return result;
    }
    updateHisValueWeights(myOffer) {
        const hisOffer = this.invertOffer(myOffer);
        this.counts.map((c, i) => {
            this.hisValueWeights[i] += hisOffer[i];
        });
        this.weightUpdates++;
        this.log(`weights: ${this.hisValueWeights}`);
    }
    offer(offer) {
        this.log(`counts: ${this.counts}`);
        this.log(`myValues: ${this.myValues}`);
        this.log(`offer: ${offer}`);
        let result;
        try {
            this.roundsLeft--;
            this.log(`roundsLeft: ${this.roundsLeft}`);
            if (offer) {
                this.updateHisValueWeights(offer);
                const myOfferValue = getOfferValue(offer, this.myValues);
                this.log(`myValue: ${myOfferValue}`);
                if(myOfferValue >= this.target || !this.roundsLeft && !this.iAmFirst && myOfferValue > 0) {
                    this.log(`AGREE`);
                    result = undefined;
                }
                else {
                    if(!this.roundsLeft && this.iAmFirst) {
                        this.log(`MY LAST ROUND`);
                        this.nextOffers = [];
                        this.target = this.total;
                    }
                    result = this.getBestOffer();
                }
            }
            else {
                result = this.getBestOffer();
            }
        }
        catch(e) {
            this.log(e.stack);
        }
        if(result) {
            this.log(`result: ${result} (${this.invertOffer(result)})`);
        }
        return result;
    }
};