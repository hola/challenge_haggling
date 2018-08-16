'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = 0;
        this.enemy_rounds = 0;
        this.max_rounds = max_rounds;
        this.log = log;
        this.total = this.calculateOffer(counts);

        this.offersList = this.getListOfOfferings(counts, values, this.total);
        this.offerIndex = -1;
        this.rejectedOfferIds = [];
        this.goodEnemyOffers = [];
    }
    threeRoundsLeft() { return this.max_rounds - this.rounds === 4 }
    twoRoundsLeft() { return this.max_rounds - this.rounds === 3 }
    oneRoundsLeft() { return this.max_rounds - this.rounds === 2 }
    isLastRound() { return this.max_rounds - this.rounds === 1 }
    isOutOfBoundary(offerIndex) { return offerIndex >= this.offersList.length - 1 }
    offer(o) {
        let index = this.offerIndex;

        if (!this.isOutOfBoundary(index + 1) && this.offersList[index + 1].percent >= 70) {
            index += 1;
        }

        this.offerIndex = index;
        this.rejectedOfferIds.push(index);

        const next = this.offersList[this.offerIndex];

        const value = this.calculateOffer(o);
        const percent = value / this.total * 100;
        this.log(`enemy offers: [${String(o)}], $${value}, ${percent}%`);

        // remember good enemy offers
        if (value >= this.total / 2) {
            this.goodEnemyOffers.push({
                offer: o,
                value,
                percent
            });
        }

        // TODO: Count enemy rounds?
        this.rounds++;
        this.log(`[ME] ${this.rounds} round`);
        if (o) {
            this.enemy_rounds++;
        }
        this.log(`[ENEMY] ${this.enemy_rounds} round`);

        // TODO: if there is 80% or higher offered then accept?
        if (value >= next.value || percent >= 80) {
            this.log('offer ACCEPTED')
            return void 0;
        } else if (this.isLastRound() && this.goodEnemyOffers.length) {
            this.goodEnemyOffers.sort((a, b) => b.value - a.value);
            const lastBestEnemyOffer = this.goodEnemyOffers[0];

            if (value >= lastBestEnemyOffer.value && lastBestEnemyOffer.percent >= 70) {
                return void 0;
            }
            // if very last round then accept even 50% if rounds === enemy_rounds === max_rounds
            if (lastBestEnemyOffer.percent >= 70) {
                this.log(`offering BEST PREVIOUS offer [${String(lastBestEnemyOffer.offer)}], $${lastBestEnemyOffer.value}, ${lastBestEnemyOffer.percent}%`)
                return lastBestEnemyOffer.offer;
            }
        } else if (percent >= 50 && this.rounds === this.max_rounds) {
            this.log('LAST ROUND - ACCEPTING')
            return void 0;
        }

        this.logOffer();
        return next.offer;
    }

    logOffer() {
        this.offersList.map((offer, index) => {
            let currentOffer = '';
            if (this.offerIndex === index) {
                currentOffer = ' <';
            } else if (this.rejectedOfferIds.indexOf(index) !== -1) {
                currentOffer = ' X';
            }
            this.log(offer.str + currentOffer);
        });
    }
    cartesianProduct(...arrays) {
        function _inner(...args) {
            if (arguments.length > 1) {
                let arr2 = args.pop(); // arr of arrs of elems
                let arr1 = args.pop(); // arr of elems
                return _inner(...args,
                    arr1.map(e1 => arr2.map(e2 => [e1, ...e2]))
                        .reduce((arr, e) => arr.concat(e), [])
                );
            } else {
                return args[0];
            }
        };
        return _inner(...arrays, [[]]);
    };

    createFilledArray(len) {
        return Array.from({ length: ++len }, (v, i) => i);
    }
    calculateOffer(offerCounts) {
        let value = 0;

        if (!offerCounts) { // No offer got yet.
            return value;
        }

        for (let i = 0; i < this.counts.length; i++)
            value += offerCounts[i] * this.values[i];
        return value;
    }
    getListOfOfferings(counts, values, total) {
        const possibleOfferingsPerItem = counts.map((item, index) => this.createFilledArray(values[index] ? item : 0));
        const offerrings = this.cartesianProduct.apply(null, possibleOfferingsPerItem);

        const offerList = offerrings.map((offer) => {
            let value = this.calculateOffer(offer);
            const percent = value / total * 100;
            const totalItems = offer.reduce((last, current) => last + current, 0);

            return {
                offer,
                value,
                percent,
                totalItems,
                str: `[${String(offer)}], $${value}, ${percent}% {${totalItems}}`
            }
        });

        return offerList.sort((a, b) => {
            const order = b.value - a.value;
            if (order === 0) {
                return b.totalItems - a.totalItems;
            }
            return order;
        });
    }
};
