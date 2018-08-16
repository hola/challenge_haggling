'use strict';
/*jslint node:true*/

/**
 * SCRIPT CONFIGURATION
 *
 */

const CONFIG = {
    autoApplyOffers: 0.8,
    goodOpponentOffer: 0.6,
    valuableStatustics: 0.6,
    offer: {
        limit: 0.7,
        recoupment: 0.4,
    }
}

/**
 * Generate offers from best to worst
 *
 * @param counts
 * @param values
 * @param valuableElements
 * @param bestOffer
 * @param log
 */
const offerGenerator = function* (counts, values, valuableElements, bestOffer, log) {
    const nextOffer = [...bestOffer];
    yield nextOffer;

    // try to generate valuable offers (best ---> worst)
    let i;
    for (i = valuableElements.length - 1; i >= 0; i--) {
        let key = valuableElements[i];
        while (nextOffer[key] - 1 >= 0) {
            nextOffer[key]--;

            if (nextOffer.some((element) => (element > 0)))
                yield [...nextOffer];

            if (i < valuableElements.length - 1) {
                i = valuableElements.length - 1;
                key = valuableElements[i];
            }
        }
        nextOffer[key] = counts[key];
    }
}


/**
 * Returns offer which include all valuable elements
 *
 * @param counts
 * @param valuableElements
 *
 * @return {Array}
 */
const bestOffer = (counts, valuableElements) => {
    return counts.map((count, key) => valuableElements.includes(key) * count);
}

/**
 * Returns list of valuable elements ordered by from most valuable to less valuable
 * non-valuable will be excluded
 *
 * Example:
 * console.log(getValuableElements([0, 4, 6])) // returns [2, 1]
 * console.log(getValuableElements([0, 4, 6], 5)) // returns [2]
 *
 * @param {Array} values
 *
 * Elements with values less than filter will be excluded
 * @param {Number} filter
 * @return {Array}
 */
const getValuableElements = (values, filter = 0) => {
    const weight = Array.from(values.keys()).sort((a, b) => (values[b] - values[a]));

    // remove elements less than filter value
    return weight.filter((key) => (values[key] > filter));
}

/**
 * Calculate a total profit of the offer
 *
 * @param {Array} offer
 *
 * values of items
 * @param {Array} values
 * @return {number}
 */
const calculateProfit = (offer, values) => {
    let total = 0;
    for (let i = 0; i < offer.length; i++)
        total += offer[i] * values[i];
    return total;
}


/**
 *
 * This class helps to collect statistics about items valuable for an opponent
 *
 */

class Analytics {
    /**
     *
     * @param {Array} counts
     * @param {Array} values
     * @param {Array} total
     * @param {Array} valuableElements
     * @param {Function} log
     */
    constructor(counts, values, total, valuableElements, log) {
        this.counts = counts;
        this.values = values;
        this.total = total;
        this.statiscics = counts.map(() => 0);
        this.orderCount = 0;
        this.valuableElements = valuableElements
        this.bestOffer = bestOffer(counts, valuableElements);
        this.log = log
    }

    /**
     * Add opponent offer to statistics
     *
     * @param offer
     */
    addOpponentOffer(offer) {
        if (offer === undefined)
            return;
        let k = 1;

        this.orderCount++;

        // calculate weight of items for opponent
        for (let i = 0; i < offer.length; i++) {
            this.statiscics[i] = k * ((this.counts[i] - offer[i]) / this.counts[i]
                + this.statiscics[i]) / 2;
        }
        this.hasStatistics = true;
        this.filter = this.getOptimalFilterValues(CONFIG.valuableStatustics);

        if( this.valuableElements.length > 0 ) {
            this.valuableElements.length > 0
        }

        if (this.valuableElements.length >= 2) {
            for (let i = this.valuableElements.length-2; i >= 0; i--) {
                if (this.values[this.valuableElements[i]] === this.values[this.valuableElements[i - 1]]) {
                    [this.valuableElements[i], this.valuableElements[i - 1]] = [this.valuableElements[i - 1], this.valuableElements[i]]
                }
            }
        }

    }

    /**
     * Returns optimal value of statistics filter
     * this filter helps to get valuable statistics
     *
     * @param {Number} startValue
     * @return {Number}
     */

    getOptimalFilterValues(startValue) {
        let filter = startValue;

        while (filter > 0) {
            if (this.statiscics.some((item) => item > filter)) {
                break;
            }

            filter = filter - 0.0499;
        }

        return filter;
    }

    /**
     * Returns true if our best offer includes items valuable for opponents
     *
     * @return {boolean}
     */
    isBestOfferIncludesValuableOpponentItems() {
        const statiscics = getValuableElements(this.statiscics, this.filter);

        if (statiscics.some((item) => !this.valuableElements.includes(item))) {
            return true;
        }

        return false;
    }

    /**
     * Returns offer contains almost all valuable for us items
     * and includes at least one item valuable for an opponent
     *
     * @return {Array}
     */
    aggressiveOffer(itemsCount = 1) {
        const offer = [...this.bestOffer];
        const statiscics = getValuableElements(this.statiscics, this.filter);
        this.log(CONFIG.valuableStatustics);
        this.log(this.filter);
        this.log(this.statiscics);
        let bestOfferIncludes = 0
        statiscics.map((item) => {
            if(!this.valuableElements.includes(item)) {
                bestOfferIncludes++;
            }
        });

        // return our best offer if it contains valuable items for opponent
        if (bestOfferIncludes >= itemsCount ) {
            return offer;
        }

        let loops = itemsCount;

        while( loops > 0 ) {
            let count = loops;

            // remove one valuable for opponent element from the offer
            for (let i = this.valuableElements.length - 1; i >= 0; i--) {
                if (this.statiscics[this.valuableElements[i]] > 0) {
                    offer[this.valuableElements[i]]--;
                    i--;
                    count--;
                }

                if (count === 0 ) {
                    break;
                }
            }

            // return the offer if it have any value
            if (calculateProfit(offer, this.values) >= this.total * 0.5) {
                return offer;
            }

            loops--;
        }

        // otherwise return best offer
        return [...this.bestOffer];
    }
}


module.exports = class Agent {

    /**
     * @param {Number} me
     * @param {Array} counts
     * @param {Array} values
     * @param {Number} max_rounds
     * @param {Function} log
     */
    constructor(me, counts, values, max_rounds, log) {
        this.log = log;
        this.counts = counts;
        this.values = values;
        this.weight = getValuableElements(values);
        this.myLastOffer = undefined;
        this.bestOpponentOffer = undefined;
        this.bestOpponentOfferTotal = 0;
        this.max_rounds = max_rounds;
        this.rounds = max_rounds;
        this.meFirst = !me;
        this.total = this._calculateProfit(counts);
        this.bestOffer = bestOffer(this.counts, this.weight);

        this.offerGenerator = offerGenerator(counts, values, this.weight, this.bestOffer, log);

        this.analytics = new Analytics(counts, values, this.total, this.weight, log);
    }

    /**
     * @param {Array|undefined} o
     * @return {Array|undefined}
     */
    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;

        this.analytics.addOpponentOffer(o);
        const nextOffer = this._getNextOffer(o);

        if (o) {
            const opponentTotal = this._calculateProfit(o);
            const currentTotal = this._calculateProfit(nextOffer);
            let aggressiveOffer = this.analytics.aggressiveOffer();

            if ( this.rounds === 1 ) {
                aggressiveOffer = this.analytics.aggressiveOffer(2);
            }

            if ( this.rounds === 0 ) {
                aggressiveOffer = this.analytics.aggressiveOffer(3);
            }

            const aggressiveOfferProfit = this._calculateProfit(aggressiveOffer)

            // save best opponent offer
            if (opponentTotal >= this.bestOpponentOffer) {
                this.bestOpponentOffer = [...o];
                this.bestOpponentOfferTotal = opponentTotal;
            }

            // agree if opponent get all valuable objects
            if (opponentTotal >= this.total * CONFIG.autoApplyOffers) {
                return;
            }

            if (this.meFirst) {
                // we go first
                // we can make aggressive offer
                if (aggressiveOfferProfit <= opponentTotal) {
                    return;
                }

                if (aggressiveOfferProfit < this.bestOpponentOfferTotal) {
                    return this.bestOpponentOffer
                }

                // make aggressive offer if it is last round and my script make first offer
                return aggressiveOffer;
            } else {
                if (this._isLastRound()) {
                    // apply any valuable offer
                    if (opponentTotal > 0) {
                        return;
                    }

                    // disagree if offer hasn't any value
                    return [...this.bestOffer];
                }

                if (this.rounds === 1) {
                    // if it's last but one round agree to opponent best offer
                    // if opponent best offer is greater or equal 40% of total
                    if (this.bestOpponentOfferTotal > 0 && this.bestOpponentOfferTotal >= this.total * 0.4) {
                        return this.bestOpponentOffer;
                    }
                }

                // send back opponents best offer if current offer is worse
                // and opponent offer is better than 50% (CONFIG.goodOpponentOffer) of total
                if (!this._isLastRound() && currentTotal < this.bestOpponentOfferTotal) {
                    if (this.bestOpponentOfferTotal >= this.total * CONFIG.goodOpponentOffer) {
                        return this.bestOpponentOffer;
                    }

                    return aggressiveOffer;
                }
            }
        }

        return nextOffer;
    }

    /**
     * Calculate a total value of current offer
     *
     * @param {Array} offer
     * @return {number}
     * @private
     */

    _calculateProfit(offer) {
        return calculateProfit(offer, this.values);
    }

    /**
     * Generate next offer (from best to worst)
     *
     * @return {Array}
     * @private
     */

    _getNextOffer() {
        let next = this.nextOffer;
        if (!next) {
            // generate offers from best to worst
            next = this.offerGenerator.next();
        }


        // return last valuable offer if there are no available offers or offer have low value
        if (next.done || this._calculateProfit(next.value)
            < this.total * (CONFIG.offer.limit
                - CONFIG.offer.recoupment * (this.max_rounds - this.rounds) / this.max_rounds) && this.myLastOffer) {
            this.nextOffer = next;
            return this.myLastOffer;
        }

        this.nextOffer = null;

        return this.myLastOffer = next.value;
    }

    /**
     * @return {boolean}
     * @private
     */
    _isLastRound() {
        return this.rounds === 0
    }
};
