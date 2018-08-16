'use strict'; /*jslint node:true*/
module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.counts = counts
    this.me = me
    this.values = values
    this.rounds = max_rounds
    this.my = []
    this.op = []
    this.value = (o) => o.reduce((acc, cv, i) => acc + cv * this.values[i], 0)
  }
  offer(o) {
    this.rounds--
    if (o) {
      this.op.push(o)
      if (this.value(o) >= [[7, 8, 9, 10, 10], [1, 8, 9, 10, 10]][this.me][this.rounds])
        return
    }
    if (this.rounds == 4)
      o = this.counts.slice()
    else {
      let mi = 0, oi = 0, md = 7, mv = 0;
      for (let i = 0; i < this.my.length; i++)
        for (let j = 0; j < this.op.length; j++) {
          let d = this.my[i].reduce((acc, v, i) => acc + Math.max(v - this.op[j][i], 0), 0)
          if (d <= md && (d < md || this.value(this.my[i]) > mv)) {
            md = d
            mv = this.value(this.my[i])
            mi = i
            oi = j
          }
        }
      o = this.my[mi].slice()
      let min = 11
      let k = -1
      for (let i = 0; i < this.counts.length; i++)
        if (this.values[i] < min && o[i] > this.op[oi][i]) {
          k = i
          min = this.values[i]
        }
      if (k >= 0 && this.value(o) - this.values[k] >= [[5, 7, 7, 8, 10], [1, 6, 7, 8, 10]][this.me][this.rounds])
        o[k]--
    }
    this.my.push(o)
    return o
  }
};