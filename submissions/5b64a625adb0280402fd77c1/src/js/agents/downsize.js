'use strict'; /*jslint node:true*/

module.exports = class Downsize {
  constructor(me, counts, values, max_rounds, log){
    this.counts = counts;
    this.values = values;
    this.maxRounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i<counts.length; i++)
      this.total += counts[i]*values[i];

    this.round = 0;
  }

  offer(o) {
    this.round += 1

    const alpha = 1 - Math.min(this.maxRounds, this.round) / this.maxRounds;
    const half = this.total / 2;
    const minimum = (this.total - half) * alpha + half;

    let offerValue = 0;
    if (o !== undefined) {
      for (let i = 0; i < this.values.length; i++) {
        offerValue += o[i] * this.values[i];
      }
    }

    // Accept offer
    if (offerValue >= minimum) {
      return undefined;
    }

    const offers = []
    this.findOffers(offers, new Array(this.counts.length).fill(0), minimum, 0,
        0);

    let minValue = Infinity;
    for (let { value, offer } of offers) {
      if (value > minValue) {
        continue;
      }
      minValue = value;
    }

    const minOffers = offers.filter((o) => o.value === minValue);
    return minOffers[(Math.random() * minOffers.length) | 0].offer;
  }

  findOffers(offers, offer, minimum, i, total) {
    if (i === this.counts.length) {
      return;
    }

    if (this.values[i] === 0) {
      return this.findOffers(offers, offer, minimum, i + 1, total);
    }

    for (let j = 0; j <= this.counts[i]; j++) {
      offer[i] = j;
      const value = total + j * this.values[i];
      if (value >= minimum) {
        offers.push({ value, offer: offer.slice() });
      }

      this.findOffers(offers, offer, minimum, i + 1, value);
    }
  }
};
