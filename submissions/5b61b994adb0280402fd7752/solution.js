"use strict" /*jslint node:true*/;

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++) this.total += counts[i] * values[i];
    this.myProposal = [];
    this.myOffer = [];
  }

  offer(o) {
    this.log(`${this.rounds} rounds left`);
    this.rounds--;
    if (o && this.verifyOffer(o)) return;
    return this.makeProposal();
  }

  verifyOffer(o) {
    this.myOffer.push(o);
    let sum = 0;
    for (let i = 0; i < o.length; i++) sum += this.values[i] * o[i];
    if (sum === this.total) return true;
    if (this.rounds === 0 && sum > 0) return true;
    return false;
  }

  makeProposal() {
    let o;
    if (!this.myProposal.length) {
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (!this.values[i]) o[i] = 0;
      }
    } else {
      o = this.myProposal[this.myProposal.length - 1];
      let minPrice = 0;
      let position;
      for (let i = 0; i < o.length; i++) {
        if (o[i] && this.values[i])
          if (!minPrice || minPrice > this.values[i]) {
            minPrice = this.values[i];
            position = i;
          }
      }
      let amounThings = 0;
      for (let i = 0; i < o.length; i++) {
        amounThings = amounThings + o[i];
      }
      if (amounThings > 2) o[position] = o[position] - 1;
    }
    this.myProposal.push(o);
    return o;
  }
};
