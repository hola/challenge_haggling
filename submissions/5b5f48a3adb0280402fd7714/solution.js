'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.maxRounds = max_rounds;
        this.rounds = max_rounds;
        this.currentRound = -1;
        this.rejectedCount = 0;
        this.log = log;
        this.total = 0;
        this.opponentItemsWithValue = [];
        this.iWentFirst = !me;
        
        this.sumArray = (array) => {
            let sum = 0;
            array.forEach((val) => { sum += val; });
            return sum;
        };
        
        this.evaluateOffer = (o) => {
            let sum = 0;
            for (let i = 0; i < o.length; i++) {
                sum += this.values[i] * o[i];
            }

            return sum;
        };

        log('a1b2c3d4e5');

        if (me) {
            log('--------  I am Bob  -------');
        }
        else {
            log('-------  I am Alice  -------');
        }

        this.maxOffer = {
            offer: null,
            value: 0
        };

        let bits = [];
        let totalCombinations = 0;

        // Generate an array of all possible offers and their values
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i] * values[i];

            let vals = [];

            for (let j = 0; j < counts[i] + 1; j++) {
                vals.push(j);
            }

            bits.push(vals);

            if (!totalCombinations) {
                totalCombinations = (counts[i] + 1);
            }
            else {
                totalCombinations *= (counts[i] + 1);
            }
        }

        log(`Total Value: $${ this.total }`);

        let allCombinations = [];

        for (let i = 0; i < totalCombinations; i++) {
            allCombinations.push([]);
        }

        let prevLength, prevRepeat;

        bits.forEach((bit, bitsIndex) => {
            if (bitsIndex === 0) {
                // first Item
                let reps = (totalCombinations / bit.length);

                let index = 0;
                for (let i = 0; i < reps; i++) {
                    bit.forEach((b) => {
                        allCombinations[index].push(b);
                        index++;
                    });
                }

                prevLength = bit.length;
                prevRepeat = 1;
            }
            else if (bitsIndex === (bits.length - 1)) {
                // last item
                let loopCap = (totalCombinations / bit.length);

                let index = 0;
                bit.forEach((b) => {
                    for (let i = 0; i < loopCap; i++) {
                        allCombinations[index].push(b);
                        index++;
                    }
                });
            }
            else {
                // any middle items
                let repeat = prevRepeat * prevLength;
                let loopCap = (totalCombinations / bit.length) / repeat;

                let index = 0;
                for (let i = 0; i < loopCap; i++) {
                    bit.forEach((b) => {
                        for (let j = 0; j < repeat; j++) {
                            allCombinations[index].push(b);
                            index++;
                        }
                    })
                }

                prevLength = bit.length;
                prevRepeat = repeat;
            }
        });

        let allPossibleOffers = [];
        let totalItemsAvailable = this.sumArray(counts);
        
        allCombinations.forEach((combo) => {
            allPossibleOffers.push({
                offer: combo,
                value: this.evaluateOffer(combo),
                itemsGiven: totalItemsAvailable - this.sumArray(combo),
                isWorseThan(otherOffer) {
                    if (this.itemsGiven >= otherOffer.itemsGiven) {
                        return false;
                    }

                    for(let i = 0; i < this.offer.length; i++) {
                        if (otherOffer.offer[i] > this.offer[i]) { // If this offer keeps fewer of ANY item, it is not objectively worse
                            return false;
                        }
                    }

                    log(`[${ this.offer }] is worse than [${ otherOffer.offer}]`);
                    return true;
                }
            });
        });

        this.allPossibleOffers = allPossibleOffers.filter((o) => {
            return o.itemsGiven > 0 && o.value >= this.total * 0.4; // filter out greedy offers and < 40% value offers
        }).sort((a, b) => {
            if (a.value === b.value) {
                return b.itemsGiven - a.itemsGiven;
            }

            return b.value - a.value;
        });

        let filtered = [];
        let previousOffer = null;

        this.allPossibleOffers.forEach((offer) => {
            if (previousOffer && (previousOffer.value === offer.value)) {
                if (!offer.isWorseThan(previousOffer)) {
                    filtered.push(offer);

                    previousOffer = {
                        offer: offer.offer,
                        value: offer.value,
                        itemsGiven: offer.itemsGiven
                    };
                }
            }
            else {
                filtered.push(offer);

                previousOffer = {
                    offer: offer.offer,
                    value: offer.value,
                    itemsGiven: offer.itemsGiven
                };
            }
        });

        this.allPossibleOffers = filtered;

        this.allPossibleOffers.forEach((offer) => {
            this.log(`Offer: [${ offer.offer }]; Value: $${ offer.value}; Items Given: ${ offer.itemsGiven }`);
        });

        let greedyOfferCounts = this.counts.slice();
        
        for (let i = 0; i < greedyOfferCounts.length; i++) {
            if (!this.values[i])
                greedyOfferCounts[i] = 0;
        }

        this.greedyOffer = {
            offer: greedyOfferCounts,
            value: this.total,
            itemsGiven: 0
        };
    }
    offer(o) {
        this.rounds--;
        this.currentRound++;

        let myNextOffer;

        if (this.currentRound > this.allPossibleOffers.length -1) {
            // If I am out of reasonable offers, stick with the best offer in the list
            myNextOffer = this.allPossibleOffers.length ? this.allPossibleOffers[0] : this.greedyOffer;
        }
        else {
            myNextOffer = this.allPossibleOffers[this.currentRound];
        }

        if (o) {
            let offerValue = this.evaluateOffer(o);

            o.forEach((item, i) => {
                if (item < this.counts[i] && !this.opponentItemsWithValue.includes(i)) {
                    this.opponentItemsWithValue.push(i);
                }
            });

            this.log(`opponentItemsWithValue: ${ this.opponentItemsWithValue }`);

            if (offerValue > this.maxOffer.value) {
                this.maxOffer = {
                    offer: o,
                    value: offerValue
                };
            }

            if (offerValue >= this.total * 0.7) {
                this.log(`Opponent Offer Value: $${ offerValue } -- ACCEPTED because it is >= 70%`);
                return;
            }
            else if (offerValue >= myNextOffer.value && offerValue >= this.maxOffer.value) {
                this.log(`Opponent Offer Value: $${ offerValue } -- ACCEPTED because it is >= my next offer AND >= the max offer I've received`);
                return;
            }
            else if (this.rejectedCount === 4) {
                if (offerValue >= this.maxOffer.value && offerValue > 0) {
                    this.log(`Opponent Offer Value: $${ offerValue } -- ACCEPTED because it is the highest and last offer I'll get.`);
                    return;
                }

                this.log(`Opponent Offer Value: $${ offerValue } -- REJECTED!`);
                this.log('------ Offering Max Offer (A) ------');
                
                return this.maxOffer.offer;
            }
            else {
                this.log(`Opponent Offer Value: $${ offerValue } -- REJECTED!`);
                this.rejectedCount++;
            }                
        }

        if (this.rounds === 0 && this.maxOffer.value > 0) {
            this.log('------ Offering Max Offer (B) ------');
            return this.maxOffer.offer;
        }
        else {
            this.log(`My Offer Value: $${ myNextOffer.value }`);
        }

        return myNextOffer.offer;
    }
};
