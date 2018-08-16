'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.currentRoundNo = 0;
    this.maxRounds = maxRounds;
    this.log = log;
    this.total = 0;
    this.savedPartnerOffers = [];
    this.savedMyOffers = [];
    this.myOfferThreshold = 0.70;
    this.lastOfferThreshold = 0.50;
    this.highOfferThreshold = 0.95;

    for (let i = 0; i < counts.length; i += 1) {
      this.total += counts[i] * values[i];
    }
  }

  offer(partnerOffer) {
    this.currentRoundNo += 1;

    if (!partnerOffer) {
      this.log('I get to make the first offer');
      this.log(`round ${this.currentRoundNo}`);
      const myOffer = this.takeAll();
      this.savedMyOffers[this.currentRoundNo - 1] = myOffer.slice();
      return myOffer;
    }

    this.log(`round ${this.currentRoundNo}`);
    this.savedPartnerOffers[this.currentRoundNo - 1] = partnerOffer.slice();

    // accept high offers
    if (this.calcSumOffer(partnerOffer) >= this.total * this.highOfferThreshold) {
      return undefined;
    }

    // accept if the partner responded with my previous offer
    if (this.offerWasGivenByMe(partnerOffer)) {
      return undefined;
    }

    // last round, choose the best previous offer from partner
    if (this.maxRounds === this.currentRoundNo) {
      const maxInd = this.findBestPartnerOffer();
      const maxSum = this.calcSumOffer(this.savedPartnerOffers[maxInd]);

      if (maxSum >= this.total * this.lastOfferThreshold) {
        if (maxSum === this.calcSumOffer(partnerOffer)) {
          return undefined;
        }
        if (this.me === 0) {
          return this.savedPartnerOffers[maxInd];
        }
      }
    }

    const myOffer = this.makeCounterOffer(partnerOffer);
    this.savedMyOffers[this.currentRoundNo - 1] = myOffer.slice();

    if (JSON.stringify(myOffer) === JSON.stringify(partnerOffer)) {
      return undefined;
    }

    return myOffer;
  }

  makeCounterOffer(partnerOffer) {
    const myOffer = this.savedMyOffers[this.currentRoundNo - 2];

    if (!myOffer) {
      return this.makeMyBestOffer();
    }

    // if the partner wants something that has no value for me, give it away gradually
    let improved = false;
    for (let i = 0; i < myOffer.length; i += 1) {
      if (this.values[i] === 0 && myOffer[i] > 0 && partnerOffer[i] < this.counts[i]) {
        myOffer[i] = Math.floor(myOffer[i] / 2);
        improved = true;
      }
    }
    if (improved) {
      return myOffer;
    }

    // find an item with the lowest value and give it away
    const minValue = this.findMinNonZeroValue(myOffer);
    for (let i = 0; i < myOffer.length; i += 1) {
      if (this.values[i] === minValue && myOffer[i] > 0 && partnerOffer[i] < this.counts[i]) {
        let myCounterOffer = myOffer.slice();
        myCounterOffer[i] -= 1;
        myCounterOffer = this.takePartnerUnwantedItems(myCounterOffer, partnerOffer);
        if (this.calcSumOffer(myCounterOffer) >= this.total * this.myOfferThreshold && !this.offerWasGivenByMe(myCounterOffer)) {
          if (this.calcSumOffer(partnerOffer) > this.calcSumOffer(myCounterOffer)) {
            return partnerOffer;
          }
          else {
            return myCounterOffer;
          }
        }
      }
    }

    if (this.calcSumOffer(partnerOffer) >= this.total * this.myOfferThreshold) {
      return partnerOffer;
    }

    return this.makeMyBestOffer();
  }

  findMinNonZeroValue(o) {
    let minValue = this.total;
    for (let i = 0; i < o.length; i += 1) {
      if (this.values[i] < minValue && this.values[i] !== 0 && o[i] > 0) {
        minValue = this.values[i];
      }
    }
    return minValue;
  }

  offerWasGivenByMe(o) {
    for (let i = 0; i < this.savedMyOffers.length; i += 1) {
      if (JSON.stringify(this.savedMyOffers[i]) === JSON.stringify(o)) {
        return true;
      }
    }
    return false;
  }

  findBestPartnerOffer() {
    let maxInd = 0;
    let maxSum = 0;

    for (let i = 0; i < this.maxRounds; i += 1) {
      const currSum = this.calcSumOffer(this.savedPartnerOffers[i]);
      if (currSum > maxSum) {
        maxSum = currSum;
        maxInd = i;
      }
    }

    return maxInd;
  }

  makeMyBestOffer() {
    // take all items that have a value
    const o = this.counts.slice();
    for (let i = 0; i < o.length; i += 1) {
      if (this.values[i] === 0) {
        o[i] = 0;
      }
    }
    return o;
  }

  takePartnerUnwantedItems(myCounterOffer, partnerOffer) {
    for (let i = 0; i < myCounterOffer.length; i += 1) {
      if (partnerOffer[i] > myCounterOffer[i] && this.values[i] !== 0) {
        myCounterOffer[i] = partnerOffer[i];
      }
    }

    return myCounterOffer;
  }

  takeAll() {
    return this.counts.slice();
  }

  calcSumOffer(o) {
    if (!o) return -1;

    let sum = 0;
    for (let i = 0; i < o.length; i += 1) {
      sum += o[i] * this.values[i];
    }
    return sum;
  }
};
