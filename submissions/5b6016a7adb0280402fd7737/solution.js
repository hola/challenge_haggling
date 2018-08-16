'use strict';
/*jslint node:true*/

const START_PROFIT_RATIO = 0.7;
const FINISH_PROFIT_RATIO = 0.5;

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.init(counts, values, max_rounds, log);
    this.total = this.calculateTotal(counts, values);
  }

  offer(o) {
    this.round++;
    const limitSum = this.calculateAcceptableSumForRound();

    if (this.checkOffer(o, limitSum))
      return;

    return this.makeDemand(o, limitSum);
  }

  // private methods ---
  checkOffer(o, limitSum) {
    if (!o)
      return false;

    let sum = this.calculateOfferSum(o);

    if (sum >= limitSum) {
      return true;
    }

    return false;
  }

  makeDemand(o, limitSum) {
    let demand = this.counts.slice();

    for (let i = 0; i < this.typesNumber; i++) {
      if (!this.values[i])
        demand[i] = 0;
    }

    let indexes = [];
    for (let i = 0; i < this.typesNumber; i++) {
      indexes.push(i);
    }

    if (o) {
      indexes.sort((a, b) => {
        if (!this.counts[a] || !this.counts[b])
          return 0;
        return o[b] / this.counts[b] - o[a] / this.counts[a];
      });
    }

    const lossLimit = this.total - this.calculateAcceptableSumForRound();
    let loss = 0;
    for (var _i = 0; _i < this.typesNumber; _i++) {
      let n = indexes[_i];
      for (var k = 0, len = this.counts[n]; k < len; k++) {
        if (demand[n] == 0)
          break;
        if (lossLimit >= loss + this.values[n]) {
          loss += this.values[n];
          demand[n]--;
        }
      }
    }

    return demand;

  }

  init(counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.roundsLimit = max_rounds;
    this.log = log;

    this.round = 0;
    this.typesNumber = counts.length;
  }

  calculateAcceptableSumForRound() {
    const r = this.getSpreadPoint(START_PROFIT_RATIO, FINISH_PROFIT_RATIO);
    return Math.round(this.total * r);
  }

  calculateOfferSum(o) {
    let sum = 0;
    for (let i = 0; i < o.length; i++) {
      sum += this.values[i] * o[i];
    }
    return sum;
  }

  calculateTotal(counts, values) {
    let t = 0;
    for (let i = 0; i < counts.length; i++) {
      t += counts[i] * values[i];
    }
    return t;
  }

  getSpreadPoint(start, finish) {
    return start + (finish - start) * this.round / this.roundsLimit;
  }

};
