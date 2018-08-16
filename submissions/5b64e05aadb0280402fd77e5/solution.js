module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++)
      this.total += counts[i] * values[i];
  }
  offer(o) {

    if (this.rounds > 4) {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
          sum += this.values[i] * o[i];
        if (sum >= this.total / 10 * 8)
          return;
      }
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (!this.values[i]) {
          o[i] = 0;
        }
      }
    } else if (this.rounds > 3) {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
          sum += this.values[i] * o[i];
        if (sum >= this.total / 10 * 8)
          return;
      }
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (this.values[i] > 1) {
          o[i] = this.counts[i];
        } else {
          o[i] = 0;
        }
      }
    } else if (this.rounds > 2) {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
          sum += this.values[i] * o[i];
        if (sum >= this.total / 10 * 7)
          return;
      }
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (this.values[i] > 2) {
          o[i] = this.counts[i];
        } else {
          o[i] = 0;
        }
      }
    } else if (this.rounds > 1) {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
          sum += this.values[i] * o[i];
        if (sum >= this.total / 10 * 6)
          return;
      }
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (this.values[i] > 3) {
          o[i] = this.counts[i];
        } else {
          o[i] = 0;
        }
      }
    } else {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++)
          sum += this.values[i] * o[i];
        if (sum >= this.total / 5)
          return;
      }
      o = this.counts.slice();
      for (let i = 0; i < o.length; i++) {
        if (this.values[i] > 4) {
          o[i] = this.counts[i];
        } else {
          o[i] = 0;
        }
      }
    }
    this.rounds--;
    return o;
  }
};