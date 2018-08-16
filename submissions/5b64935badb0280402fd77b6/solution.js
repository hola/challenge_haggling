'use strict';
/*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me === 0;
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.total = 0;
    this.firstOffer = [];
    this.lastOffer = [];
    for (let i = 0; i < counts.length; i++) {
      this.total += counts[i] * values[i];
    }
  }

  isLastRound() {
    return this.me ? this.rounds === 0 : this.rounds === 1;
  }

  isUltimatum() {
    return this.me;
  }

  getOfferSum(offer) {
    if (offer) {
      let sum = 0;
      for (let i = 0; i < offer.length; i++) {
        sum += this.values[i] * offer[i];
      }

      return sum;
    }

    return 0;
  }

  getThreshold() {
    const ultimatum = this.isUltimatum();

    return ultimatum ? this.getUltimatumThreshold() : this.getSomeThreshold();
  }

  getUltimatumThreshold() {
    if (this.rounds < 1) {
      return this.total * 0.1;
    }

    return 0;
  }

  getSomeThreshold() {
    if (this.rounds < 1) {
      return this.total * 0.5;
    } else if (this.rounds < 2) {
      return this.total * 0.4;
    } else if (this.rounds < 3) {
      return this.total * 0.3;
    } else if (this.rounds < 4) {
      return this.total * 0.2;
    } else if (this.rounds < 5) {
      return this.total * 0.1;
    }

    return 0;
  }

  setRound() {
    this.rounds--;
  }

  setOfferInfo(offer) {
    if (offer && offer.length && !this.firstOffer.length) {
      this.firstOffer = offer;
    }

    if (offer && offer.length) {
      this.lastOffer = offer;
    }
  }

  createOffer(unused, threshold, nestedCount) {
    const offer = this.counts.slice();
    const lastRound = this.isLastRound();
    const ultimatum = this.isUltimatum();

    function compare(a,b) {
      if (a.v < b.v)
        return -1;
      if (a.v > b.v)
        return 1;
      return 0;
    }

    const sortedMap = this.values.map((v, i) => ({
      v,
      i,
      c: this.counts[i],
    })).sort(compare);

    let buffer = 0;
    let categoryIncludedCount = 0;
    let importantIncluded = false;
    for (let i = 0; i < this.counts.length; i++) {
      const categoryValue = sortedMap[i].v;
      const categoryCount = sortedMap[i].c;

      let categoryIncluded = false;
      for (let j = 0; j < categoryCount; j++) {
        if(ultimatum && categoryValue && categoryIncluded) continue;

        const unnecessary = nestedCount < 2 && Boolean(unused[i] && (unused[i] === this.counts[i]));
        const expectedPrice = buffer + categoryValue;
        const overpriced = expectedPrice > threshold;

        if (categoryValue && (unnecessary || overpriced)) continue;

        buffer += categoryValue;
        offer[sortedMap[i].i]--;

        if (!categoryIncluded) categoryIncludedCount++;
        categoryIncluded = true;

        if (!unnecessary) {
          importantIncluded = true;
        }
      }
    }

    const initialThreshold = this.getThreshold();
    const mainConditionExists = buffer && categoryIncludedCount > 1 && lastRound;

    if (!mainConditionExists && nestedCount < 1) {
      return this.createOffer(this.lastOffer, initialThreshold + 1, 1)
    }

    if (!mainConditionExists && nestedCount < 2) {
      return this.createOffer(this.lastOffer, initialThreshold + 2, 2)
    }

    return offer;
  };

  checkPartnerOffer(partnerOffer) {
    const sumPartnerOffer = this.getOfferSum(partnerOffer);
    const lastRound = this.isLastRound();
    const ultimatum = this.isUltimatum();

    return lastRound && !ultimatum && sumPartnerOffer > 0;
  }

  checkOwnOffer(partnerOffer, ownOffer) {
    const sumPartnerOffer = this.getOfferSum(partnerOffer);
    const sumOwnOffer = this.getOfferSum(ownOffer);

    return sumPartnerOffer < sumOwnOffer;
  }

  offer(partnerOffer) {
    this.setRound();
    this.setOfferInfo(partnerOffer);
    const partnerOfferChecked = this.checkPartnerOffer(partnerOffer);

    if (partnerOfferChecked) return;

    const threshold = this.getThreshold();
    const ownOffer = this.createOffer(this.lastOffer, threshold, 0);
    const ownOfferChecked = this.checkOwnOffer(partnerOffer, ownOffer);

    if (ownOfferChecked) return ownOffer;
  }
};

