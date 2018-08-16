'use strict'; /*jslint node:true*/

module.exports = class {
    constructor(me, counts, values, rounds, log) {
        this.counts = counts;
        this.log = log;
        this.meFirst = me === 0;
        this.round = rounds;
        this.values = values;

        this.offers = [];

        this.totalValue = this.getValue(counts, values);
        this.valueOffers = this.getValueOffers(counts, values);

        // dynamic value that can be accepted
        this.accept = this.totalValue;

        // minimum offer/value that can be accepted
        this.minOffer = counts.map((count, i) => values[i] ? count : 0);
        this.minValue = Math.ceil(this.totalValue * 0.3);

        // update minValue using generated combinations
        this.updateMinOfferValue();

        this.bestOffer = null;
        this.bestOfferValue = this.minValue;
    }
    offer(offer) {
        this.round--;

        if (!offer) {
            return this.valueOffers[this.accept].shift();
        }

        let currentOfferValue = this.getValue(offer, this.values);
        if (currentOfferValue >= this.accept) {
            return;
        }

        if (currentOfferValue > this.bestOfferValue)
        {
            this.bestOffer = offer;
            this.bestOfferValue = currentOfferValue;
        }

        this.offers.push(offer);

        // don't play with items that worthless for opponent
        this.removeUselessOffers();

        let myOffer = this.getNextOffer() || this.bestOffer || this.minOffer;
        // last offer from my side
        if (!this.meFirst && !this.round) {
            myOffer = this.bestOffer || this.minOffer;
        }
        if (currentOfferValue >= this.getValue(myOffer, this.values)) {
            return;
        }
        if (this.round < 0 && currentOfferValue >= this.minValue) {
            return;
        }
        return myOffer;
    }

    /**
     * 
     * @param array counts      - use this.counts
     * @param array offers      - use this.offers
     * @param int totalValue    - use this.totalValue
     * @returns array of floats with estimated values
     */
    estimateValues(counts, offers, totalValue) {
        let estimates = counts.map(count => Math.floor(totalValue / count));
        let estimated = [];
        let value = 0;

        // handle cases when first offer contains all zero values items
        // and some cheapest items, but not all of them.
        if (offers.length > 0) {
            // make a copy of first offer with all values
            offers.unshift(offers[0].slice());
            // leave only zero-values items in first offer
            for (let i = 0; i < offers[0].length; i++) {
                if (offers[0][i] !== counts[i]) {
                    offers[0][i] = 0;
                }
            }
        }

        offers.forEach((offer, o) => {
            let hasValue = false;
            for (let i = 0; i < offer.length; i++) {
                if (offer[i] && !estimated.includes(i)) {
                    hasValue = true;
                    estimated.push(i);
                    estimates[i] = value;
                }
            }
            // update value only if offer used new items
            // or if all opponent items have value and first offer is empty
            if (hasValue || !o) {
                // do not use integers, value always has to be <= 1
                // in case multiple opponent items have value 1
                value = value + 1 / offers.length;
            }
        });

        // round all estimated values to int
        let estimatedValue = estimated.reduce((sum, i) => {
            return sum + counts[i] * Math.ceil(estimates[i]);
        }, 0);

        // re-estimate not estimated values depending on qty
        totalValue = totalValue - estimatedValue;
        for (let i = 0; i < estimates.length; i++) {
            if (!estimated.includes(i)) {
                estimates[i] = Math.floor(totalValue / counts[i]);
            }
        }

        return estimates;
    }
    getNextOffer() {
        while (this.accept > this.bestOfferValue) {
            if (!this.valueOffers[this.accept] || !this.valueOffers[this.accept].length) {
                this.accept--;
                continue;
            }

            return this.sortOffersByValue(
                    this.valueOffers[this.accept],
                    this.estimateValues(
                            this.counts,
                            this.offers,
                            this.totalValue
                            )
                    ).shift();
        }
    }
    getValueOffers(counts, values) {
        // total valuable items, referred by index
        let items = [];
        for (let i = 0; i < counts.length; i++) {
            if (values[i]) {
                for (let c = 0; c < counts[i]; c++) {
                    items.push(i);
                }
            }
        }

        let emptyOffer = counts.slice();
        for (let i = 0; i < emptyOffer.length; i++) {
            if (!values[i]) {
                emptyOffer[i] = 0;
            }
        }

        let combinations = Math.pow(2, items.length);
        let hashes = {};
        let offers = {};
        for (let n = 0; n <= combinations; n++) {
            let offer = emptyOffer.slice();
            for (let o = 0; o < items.length; o++) {
                let mask = 1 << o;
                if ((n & mask) !== 0) {
                    offer[items[o]]--;
                }
            }
            let offerValue = this.getValue(offer, values);
            if (!offers[offerValue]) {
                offers[offerValue] = [];
            }
            let hash = JSON.stringify(offer);
            if (!hashes[hash]) {
                hashes[hash] = true;
                offers[offerValue].push(offer);
            }
        }

        return offers;
    }
    getValue(counts, values) {
        var value = 0;
        for (let i = 0; i < counts.length; i++) {
            value += counts[i] * values[i];
        }
        return value;
    }
    removeUselessOffers() {
        // estimate only first time for zero values
        // changes in these items don't change value for opponent
        if (this.offers.length !== 1) {
            return;
        }
        let offer = this.offers[0];
        let zeroValues = [];
        for (let i = 0; i < offer.length; i++) {
            if (this.values[i] && offer[i] === this.counts[i]) {
                zeroValues.push(i);
            }
        }
        if (!zeroValues.length) {
            return;
        }
        for (let v = this.totalValue; v >= this.minValue; v--) {
            if (!this.valueOffers[v] || !this.valueOffers[v].length) {
                continue;
            }
            this.valueOffers[v] = this.valueOffers[v].filter(offer => {
                for (let i = 0; i < zeroValues.length; i++) {
                    let z = zeroValues[i];
                    if (offer[z] !== this.counts[z]) {
                        return false;
                    }
                }
                return true;
            });
        }
        this.updateMinOfferValue();
    }
    sortOffersByValue(offers, values) {
        return offers.sort((a, b) =>
            this.getValue(b, values) - this.getValue(a, values));
    }
    updateMinOfferValue() {
        for (let value = this.minValue; value <= this.totalValue; value++) {
            if (this.valueOffers[value] && this.valueOffers[value].length) {
                this.minOffer = this.sortOffersByValue(
                        this.valueOffers[value],
                        this.estimateValues(this.counts, this.offers, this.totalValue)
                        )[0];
                this.minValue = value;
                break;
            }
        }
    }
};