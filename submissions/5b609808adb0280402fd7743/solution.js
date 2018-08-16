'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.reductionRate = max_rounds;
    this.rounds = max_rounds;
    this.log = log;
    this.bids = [];

    this.data = this.counts
      .map((count, index) => ({
        count,
        index,
        priority: count * values[index],
        offer: 0,
        value: values[index],
        total: count * values[index]
      }));
    this.total = this.initTotal = this.data
      .reduce((p, n) => (p + n.total), 0);
  }

  offer(o) {
    this.log(`${this.rounds} rounds left`);
    this.rounds--;
    if (o) {
      let sum = this.data.reduce((p, n) => (p + (n.value * o[n.index])), 0);
      if (sum > 0 && (sum >= this.total || this.bids.some(bid => sum >= bid))) return;
      this.data.forEach(d => {
        if (o[d.index] && d.value) d.priority += d.value * o[d.index];
        d.offer = Math.max(d.offer, o[d.index]);
      });
    }
    let bid = 0;
    const length = this.counts.length;
    o = Array(length).fill(0);
    this.data.sort((a, b) => b.priority - a.priority).forEach((d, i) => {
      if (!d.value) return;
      if (bid >= this.total) return;
      if (i === length - 1) {
        return; // Leave the least worthy item for bargain
      }
      if (d.offer) {
        o[d.index] = d.count;
        bid += d.total;
        return;
      }

      if (bid + d.total <= this.total) {
        o[d.index] = d.count;
        bid += d.total;
        return;
      }
      o[d.index] = Math.ceil((this.total - bid) / d.value);
      bid += d.value * o[d.index];
    });
    if (bid === 0) this.data.forEach(d => o[d.i] = d.c);
    this.total = Math.floor(this.total * (1 - (1 / (this.reductionRate))));
    this.bids.push(bid);
    return o;
  }
};