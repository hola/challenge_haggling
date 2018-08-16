'use strict';
/*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.firstOffer = !me;
        this.counts = counts;
        this.values = values;
        this.rounds = this.maxRounds = max_rounds;
        this.offers = [];

        this.newOffer = [];
        this.itemsArray = [];
        this.offersPlainArray = [];
        this.totalCount = 0;

        this.bestOffer = [];

        this.total = 0;

        for (let i = 0; i < counts.length; i++) {
            let weight = counts[i] * values[i];

            this.total += weight;

            this.newOffer[i] = counts[i];
            this.totalCount += counts[i];

            for (let j = 0; j < counts[i]; j++) {
                this.itemsArray.push({i : i, v : values[i]});
            }

            this.bestOffer[i] = 0;
        }

        let l = this.itemsArray.length - 1;

        for (let i = 0; i < l; i++) {
            for (let j = 0; j < l - i; j++) {
                if (this.itemsArray[j].v < this.itemsArray[j + 1].v) {
                    const thickest = this.itemsArray[j + 1];

                    this.itemsArray[j + 1] = this.itemsArray[j];
                    this.itemsArray[j] = thickest;
                }
            }
        }

        for (let i = 0; i < this.itemsArray.length; i++) {
            this.offersPlainArray.unshift(this.itemsArray[i].i);
        }

        this.baseOffer = this.newOffer.slice();
        this.baseOffersPlainArray = this.offersPlainArray.slice();

        this.reduceAppetite();
    }

    reduceAppetite() {
        let item = this.offersPlainArray.shift();

        if (this.newOffer[item] > 0) {
            this.newOffer[item]--;
        } else {
            this.reduceAppetite();
        }
    }

    arrayOfZeros(array) {
        var sum = 0;

        for (let value of array) {
            sum += value;
        }

        return sum === 0;
    }

    offer(_offer) {
        if (_offer) {
            this.offers.push(_offer);

            if (!this.bestOffer || (this.calculateOfferSum(_offer) > this.calculateOfferSum(this.bestOffer))) {
                this.bestOffer = _offer.slice();
            }
        }
        if (this.firstOffer && this.rounds === this.maxRounds) {
            this.rounds--;
            return this.newOffer;

        } else if (this.rounds == this.maxRounds) {
            this.rounds--;
            return this.newOffer;
        } else {
            this.rounds--;

            if (_offer) {
                let sum = 0;
                for (let i = 0; i < _offer.length; i++)
                    sum += this.values[i] * _offer[i];

                if (sum >= this.total * .7) {
                    return;
                }

                if (!this.rounds && sum > 0) {
                    if (this.calculateOfferSum(this.bestOffer) > sum) {
                        return this.bestOffer;
                    }
                } else {
                    this.reduceAppetite();

                    let myOfferSum = this.calculateOfferSum();

                    if (myOfferSum <= sum && sum > 0 && myOfferSum > 0) {
                        if (this.calculateOfferSum(this.bestOffer) > sum) {
                            return this.bestOffer;
                        }
                        return;
                    }

                    if (this.arrayOfZeros(this.newOffer)) {
                        let count = 0;

                        this.newOffer = this.baseOffer.slice();
                        this.offersPlainArray = this.baseOffersPlainArray.slice();

                        this.reduceAppetite();

                        return this.newOffer;
                    }

                    return this.newOffer;
                }
            }
        }
    }

    calculateOfferSum(offer) {
        let sum = 0;

        offer = offer || this.newOffer;

        for (let i = 0; i < offer.length; i++) {
            sum += this.values[i] * offer[i];
        }

        return sum;
    }
};
