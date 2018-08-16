'use strict'; /*jslint node:true*/

module.exports = class Accept {
  constructor(me, counts, values, maxRounds, log){
    this.counts = counts;
    this.values = values;
    this.round = 0;
    this.maxRounds = maxRounds;
  }

  offer(o) {
    // Ask everything
    if (o === undefined) {
      return this.randomOffer();
    }

    this.round++;
    if (Math.random() < (this.round / this.maxRounds) ** 5) {
      return undefined;
    }

    return this.randomOffer();
  }

  randomOffer() {
    while (true) {
      const offer = this.counts.slice();
      for (let i = 0; i < offer.length; i++) {
        offer[i] = Math.round(offer[i] * Math.random());
      }

      let value = 0;
      for (let i = 0; i < offer.length; i++) {
        value += this.values[i] * offer[i];
      }
      if (value >= 5) {
        return offer;
      }
    }
  }
};
