'use strict';

const ACCEPT_ACTION = undefined;

const forLength = (length, delegate) => {
    for (let i = 0; i < length; i++) {
        delegate(i);
    }
};

class Haggler {
   static getTotalValue(counts, values) {
        return counts.reduce((accumulatedSum, count, i) => (
            accumulatedSum + count * values[i]
        ), 0);
    }

    constructor(amIFirst, counts, values, totalRounds, log) {
        this.counts = counts;
        this.values = values;
        this.totalRounds = totalRounds;
        this.roundsRemaining = totalRounds;
        this.log = log;
        this.totalValue = Haggler.getTotalValue(counts, values);
    }

    offer(proposedOffer) {
        if (!proposedOffer) {
            return this.getInitialOffer();
        }

        if (this.isReasonableIncomingOffer(proposedOffer)) {
            return ACCEPT_ACTION;
        }

        const response = this.calculateResponseOffer(proposedOffer);

        this.roundsRemaining--;

        return response;
    }

    getInitialOffer() {
        return this.counts.map(count => count || 0);
    }

    isReasonableIncomingOffer(offer) {
        const offerSum = Haggler.getTotalValue(offer, this.values);
        return offerSum >= this.totalValue * (this.roundsRemaining + (this.totalRounds - this.roundsRemaining + 1) / this.totalRounds);
    }

    calculateResponseOffer(proposedOffer) {
        const offer = Haggler.getTotalValue(proposedOffer, this.values) > 0
            ? proposedOffer
            : this.getInitialOffer();

        forLength(this.round, () => {
            let leastValuableIndex = 0;
            let mostValuableIndex = 0;

            forLength(offer.length, i => {
                if (this.values[i] * this.counts[i] < this.values[leastValuableIndex] * offer[leastValuableIndex]) {
                    leastValuableIndex = i;
                } else if (this.values[i] * this.counts[i] > this.values[mostValuableIndex] * offer[mostValuableIndex]) {
                    mostValuableIndex = i;
                }
            });

            if (offer[leastValuableIndex] > 0) {
                offer[leastValuableIndex]--;
            }

            if (offer[mostValuableIndex] < this.counts[mostValuableIndex]) {
                offer[mostValuableIndex]++;
            }
        });

        return offer;
    }
}

module.exports = Haggler;
