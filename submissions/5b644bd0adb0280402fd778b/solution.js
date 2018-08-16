'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.debug = false;
    this.counts = counts;
    this.values = values;
    this.valuesSortedIdx = this.getValueSortedIdx(values);
    this.max_rounds = max_rounds;
    this.rounds = max_rounds;
    this.log = log;
    this.offers = [];
    this.total = 0;
    this.winThresh = 0.8;

    for (let i = 0; i < counts.length; i++) {
      this.total += counts[i] * values[i];
    }
  }

  offer(o) {
    this.debugLog(`${this.rounds} rounds left`);
    this.debugLog(`Counts: ${this.counts}`);
    this.debugLog(`Values: ${this.values}`);
    this.debugLog(`vaSort: ${this.valuesSortedIdx}`)
    this.debugLog(`Offer:  ${o}`);
    this.offers.push(o);

    if (this.rounds === this.max_rounds) {
      o = this.counts.slice();
    } else {
      const val = this.calcOffer(o);
      this.debugLog(`Offer Value: ${val}`);
      const roundDiff = this.max_rounds - this.rounds;
      o = this.removeItems(roundDiff);
      let counter = this.calcOffer(o);

      if (counter < this.total * this.winThresh) {
        o = this.lowestOffer;
        counter = this.calcOffer(o);
      } else {
        this.lowestOffer = o;
      }

      if (counter <= val) {
        return;
      }
      
      this.debugLog(`Counter: ${this.calcOffer(o)}`);
    }

    this.rounds--;
    return o;
  }

  debugLog(msg) {
    if (this.debug) {
      this.log(msg);
    }
  }

  calcOffer(o) {
    let val = 0;
    let that = this;

    o.forEach(function (o, i) {
      val += o * that.values[i];
    });

    return val;
  }

  removeItems(amt) {
    const o = this.counts.slice();
    this.debugLog(o);
    for (let i = 0; i < amt; i++) {
      for (let k = 0, kLen = this.valuesSortedIdx.length; k < kLen; k++) {
        if (o[this.valuesSortedIdx[k]]) {
          o[this.valuesSortedIdx[k]]--;
          break;
        }
      }
    }
    this.debugLog(o);
    return o;
  }

  getValueSortedIdx(values) {
    const ret = [];
    const that = this;

    for (let i = 0, iLen = values.length; i < iLen; i++) {
      ret[i] = i;
    }

    ret.sort(function(a, b) {
      return that.values[a] < that.values[b] ? -1 : that.values[a] > that.values[b] ? 1 : 0; 
    });

    return ret;
  }
};