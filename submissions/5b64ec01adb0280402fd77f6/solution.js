'use strict'; /*jslint node:true*/

const EXAMPLE = 0, OTHER = 1;



class Theory {
  constructor(game) {
    this.game = game;
    this.pv = new Array(game.vals.length).fill(1 / game.vals.length);
    this.pr = new Array(game.vals.length).fill(1);
    this.prt = 1;
  }
  rejected() {
    for (let i = 0; i < this.pv.length; i++) {
      this.pv[i] *= this.pr[i] / this.prt;
    }
  }
  calcPR(c) {
    this.prt = 0;
    for (let i = 0; i < this.game.vals.length; i++) {
      let s = 0;
      for (let j = 0; j < this.game.length; j++) {
        s += this.game.vals[i][j] * this.game.comb[c][j];
      }
      this.pr[i] = 1 - this.p_acc[this.game.me][this.game.max_rounds - this.game.rounds - 1][s];
      this.prt += this.pr[i] * this.pv[i];
    }
  }
}

class Example extends Theory {
  constructor(game) {
    super(game);
    this.p_acc =
            [[[0, 0.2, 0.32, 0.44, 0.6, 0.65, 0.72, 0.89, 0.94, 0.97, 1],
                [0, 0, 0, 0, 0, 0, 0.07, 0.4, 0.77, 0.85, 1],
                [0, 0, 0, 0, 0, 0, 0.14, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
                [0, 0.37, 0.73, 0.95, 0.96, 1, 1, 1, 1, 1, 1]],
              [[0, 0, 0, 0, 0, 0.01, 0.01, 0.08, 0.44, 0.87, 1],
                [0, 0, 0, 0, 0.02, 0.05, 0.06, 0.17, 0.44, 0.79, 1],
                [0, 0, 0, 0, 0, 0, 0, 0.08, 0.59, 1, 1],
                [0, 0, 0.26, 0.27, 0.54, 0.75, 0.9, 0.95, 0.97, 0.98, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]]

    this.ph = this.game.me ? 0.15 : 0.15
    this.pfel = [[0.74, 0.3, 0.17, 0.06, 0.06], [0.69, 0.34, 0.19, 0.09, 0.05]]
  }

  offered(o) {
    let sum = 0;
    for (let i = 0; i < this.pv.length; i++) {
      for (let j = 0; j < this.game.length; j++) {
        if (o[j] > 0 && this.game.vals[i][j] > 0 || o[j] == 0 && this.game.vals[i][j] == 0) {
          sum += this.pv[i];
          this.pv[i] = 0;
          break;
        }
      }
    }
    for (let i = 0; i < this.pv.length; i++) {
      this.pv[i] *= 1 / (1 - sum);
    }
  }
}

class Other extends Theory {
  constructor(game) {
    super(game);
    this.p_acc = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0.02, 0.03, 0.08, 0.17, 0.58, 0.85],
        [0, 0, 0, 0, 0, 0, 0.01, 0.05, 0.36, 0.86, 0.92],
        [0, 0, 0.01, 0.03, 0.06, 0.13, 0.21, 0.4, 0.59, 0.86, 0.9],
        [0, 0.3, 0.55, 0.85, 0.94, 1, 1, 1, 1, 1, 1]],
      [[0, 0, 0.01, 0.02, 0.03, 0.06, 0.08, 0.23, 0.32, 0.7, 0.96],
        [0, 0, 0, 0, 0, 0, 0.01, 0.1, 0.31, 0.63, 0.86],
        [0, 0, 0, 0, 0, 0, 0.09, 0.36, 0.57, 0.8, 0.97],
        [0, 0.03, 0.12, 0.19, 0.33, 0.53, 0.75, 0.87, 0.92, 0.97, 0.98],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]]


    this.ph = this.game.me ? 0.85 : 0.85

    this.p_off = [[[0, 0, 0, 0, 0, 0, 0.01, 0.01, 0.09, 0.28, 0.58],
        [0, 0, 0, 0, 0, 0.01, 0.02, 0.04, 0.27, 0.25, 0.37],
        [0, 0, 0, 0, 0, 0.02, 0.08, 0.14, 0.31, 0.14, 0.26],
        [0, 0, 0, 0, 0.02, 0.03, 0.07, 0.14, 0.25, 0.19, 0.26],
        [0, 0, 0, 0, 0.03, 0.06, 0.18, 0.16, 0.21, 0.09, 0.24]],
      [[0, 0.01, 0.01, 0, 0, 0, 0, 0, 0.09, 0.26, 0.58],
        [0, 0, 0, 0, 0, 0, 0.01, 0.02, 0.18, 0.26, 0.5],
        [0, 0, 0, 0, 0, 0.01, 0.05, 0.09, 0.34, 0.17, 0.31],
        [0, 0, 0, 0, 0.01, 0.02, 0.05, 0.12, 0.25, 0.16, 0.34],
        [0, 0, 0, 0, 0, 0.03, 0.16, 0.17, 0.27, 0.13, 0.19]]]


  }

  offered(o) {
    let sum = 0;
    for (let i = 0; i < this.pv.length; i++) {
      let v = 0;
      for (let j = 0; j < this.game.length; j++) {
        v += this.game.vals[i][j] * (this.game.counts[j] - o[j]);
      }
      let m = this.p_off[this.game.me][this.game.max_rounds - this.game.rounds - 2 + this.game.me][v] * this.pv[i];
      sum += m;
      this.pv[i] = m;
    }
    for (let i = 0; i < this.pv.length; i++) {
      this.pv[i] /= sum;
    }
  }
}


class Res extends Theory {
  constructor(game) {
    super(game);
    this.p_acc = [[[0, 0.02, 0.04, 0.08, 0.16, 0.25, 0.33, 0.46, 0.62, 0.86, 0.96],
        [0, 0, 0, 0, 0, 0.02, 0.03, 0.11, 0.26, 0.7, 0.93],
        [0, 0, 0, 0, 0, 0, 0.02, 0.08, 0.43, 0.9, 0.93],
        [0, 0, 0.01, 0.03, 0.06, 0.12, 0.2, 0.39, 0.6, 0.87, 0.9],
        [0, 0.25, 0.5, 0.8, 0.9, 1, 1, 1, 1, 1, 1]],
      [[0, 0, 0.01, 0.02, 0.02, 0.05, 0.07, 0.19, 0.36, 0.78, 0.98],
        [0, 0, 0, 0, 0, 0.01, 0.02, 0.12, 0.37, 0.7, 0.92],
        [0, 0, 0, 0, 0, 0, 0.07, 0.32, 0.57, 0.86, 0.98],
        [0, 0.03, 0.12, 0.2, 0.34, 0.56, 0.77, 0.88, 0.93, 0.97, 0.98],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]]

    this.ph = this.game.me ? 0 : 0
  }
  offered(o) {
  }
  rejected() {
  }
}

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.length = counts.length;
    this.max_rounds = max_rounds;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++)
      this.total += counts[i] * values[i];
    this.comb = [];
    this.rewards = [];
    this.combos(new Array(this.counts.length), 0);
    this.vals = [];
    this.valuations(new Array(this.counts.length), 0, 0);
    this.prt = 1;
    this.offers = [];
    this.example = true;
    this.plan = new Array(this.max_rounds);
    this.th = [new Example(this), new Other(this), new Res(this)];
    this.best = {v: -1}
  }
  combos(c, k) {
    if (k == this.length) {
      this.comb.push(Array.from(c));
      let sum = 0;
      for (let i = 0; i < this.length; i++) {
        sum += this.values[i] * (this.counts[i] - c[i]);
      }
      this.rewards.push(sum);
    } else {
      for (let i = 0; i <= this.counts[k]; i++) {
        c[k] = i;
        this.combos(c, k + 1);
      }
    }
  }
  valuations(v, i, total) {
    let max = (this.total - total) / this.counts[i] | 0;
    if (i == this.length - 1) {
      if (total + max * this.counts[i] == this.total) {
        v[i] = max;
        this.vals.push(Array.from(v));
      }
    } else {
      for (let j = 0; j <= max; j++) {
        v[i] = j;
        this.valuations(v, i + 1, total + j * this.counts[i]);
      }
    }
  }
  offer(o) {
    this.rounds--;
    this.rejected();
    let sum = 0;
    if (o) {
      this.offers.push(o);
      for (let i = 0; i < this.length; i++) {
        sum += this.values[i] * o[i];
      }
      if (sum > this.best.v) {
        this.best = {v: sum, o: o};
      }
      if (this.isExample()) {
        if (this.rounds == 3 + this.me) {
          this.th[EXAMPLE].offered(o);
        }
        let pel = this.th[EXAMPLE].ph + this.th[EXAMPLE].pfel[this.me][this.max_rounds - this.rounds - 2 + this.me]
                * (1 - this.th[EXAMPLE].ph)
        this.th[EXAMPLE].ph /= pel;
        for (let i = 1; i < this.th.length; i++) {
          this.th[i].ph *= this.th[EXAMPLE].pfel[this.me][this.max_rounds - this.rounds - 2 + this.me] / pel;
        }
      } else if (this.th[EXAMPLE].ph > 0) {
        for (let i = 1; i < this.th.length; i++) {
          this.th[i].ph *= 1 / (1 - this.th[EXAMPLE].ph);
        }
        this.th[EXAMPLE].ph = 0;
      }
      for (let i = 1; i < this.th.length; i++) {
        this.th[i].offered(o);
      }
    }
    this.analyse(sum);
    this.calcPR(this.plan[4 - this.rounds]);
    let max_reward = 1;
    for (let i = this.rounds; i >= this.me; i--) {
      let v = 0;
      for (let j = 0; j < this.length; j++) {
        v += (this.counts[j] - this.comb[this.plan[4 - i]][j]) * this.values[j];
      }
      if (v > max_reward) {
        max_reward = v;
      }
    }
    let threshold = [this.me ? 1 : 7, 8, 9, 10, 10][this.rounds]
    if (this.me && !this.rounds && sum > 0 || sum >= max_reward && (sum >= threshold)) {
      return;
    }

    o = this.counts.slice();
    for (let i = 0; i < this.length; i++) {
      o[i] -= this.comb[this.plan[4 - this.rounds]][i];
    }

    if (this.rounds == this.me && this.best.v > 6 && this.rewards[this.plan[4 - this.rounds]] <= this.best.v
            && this.eval(this.plan.slice(4 - this.rounds)).v <= this.best.v * 0.6) {
      o = this.best.o;
    }
    return o;

  }

  isExample() {
    if (!this.example)
      return false;
    if (this.offers.length > 0) {
      let last = this.offers[this.offers.length - 1];
      for (let i = 0; i < this.length; i++) {
        if (last[i] != this.offers[0][i] || last[i] != this.counts[i] && last[i] != 0) {
          this.example = false;
          return false;
        }
      }
    }
    return true;
  }

  analyse(lim) {
    let s = this.rounds + 1;
    let tuples = this.tuples(s, lim, false);
    if (tuples.length == 0) {
      for (let i = 0; i < this.th.length - 1; i++) {
        this.th[i].ph = 0;
      }
      this.th[this.th.length - 1].ph = 1;
      tuples = this.tuples(s, lim, false);
      if (tuples.length == 0) {
        tuples = this.tuples(s, lim, true);
      }
      if (tuples.length == 0) {
        tuples = this.tuples(s, 0, true);
      }
    }
    let best = 0;
    let max = 0;
    for (let i = 0; i < tuples.length; i++) {
      if (tuples[i].v > max || tuples[i].v == max && this.rewards[tuples[i].t[0]] > this.rewards[tuples[best].t[0]]) {
        best = i;
        max = tuples[i].v;
      }
    }
    for (let i = 0; i < s; i++) {
      this.plan[i + this.plan.length - s] = tuples[best].t[i];
    }
  }

  rejected() {
    for (let i = 0; i < this.th.length; i++) {
      this.th[i].ph *= this.th[i].prt / this.prt;
      if (i == EXAMPLE)
        this.th[i].rejected();
    }
  }

  calcPR(c) {
    this.prt = 0;
    for (let i = 0; i < this.th.length; i++) {
      this.th[i].calcPR(c);
      this.prt += this.th[i].prt * this.th[i].ph;
    }
  }

  eval(tuple) {
    let sum = 0;
    let avg_p = 0;
    let start = this.max_rounds - tuple.length;
    for (let h = 0; h < this.th.length; h++) {
      if (this.th[h].ph > 0) {
        for (let j = 0; j < this.vals.length; j++) {
          let outcome = 0;
          let p = 1;
          for (let i = 0; i < tuple.length; i++) {
            let s = 0;
            for (let k = 0; k < this.length; k++) {
              s += this.vals[j][k] * this.comb[tuple[i]][k];
            }
            let p_acc = this.th[h].p_acc[this.me][start + i][s];
            outcome += this.rewards[tuple[i]] * p_acc * p;
            p *= (1 - p_acc);
          }
          sum += outcome * this.th[h].pv[j] * this.th[h].ph;
          avg_p += (1 - p) * this.th[h].pv[j] * this.th[h].ph;
        }
      }
    }
    return {v: sum, p: avg_p};
  }

  tuples(length, lim, rel) {
    let tuples = [];
    for (let i = 1; i < this.comb.length; i++) {
      if (this.rewards[i] > lim) {
        tuples.push({t: [i], v: this.eval([i]).v});
      }
    }
    for (let k = 2; k <= length; k++) {
      let input = [];
      let m = 300;
      let bins_n = 100;
      let limit = 0;
      if (tuples.length > m) {
        let bins = new Array(bins_n * 10 + 1).fill(0);
        for (let i = 0; i < tuples.length; i++) {
          bins[bins_n * tuples[i].v | 0]++;
        }
        let sum = 0;
        for (let i = bins.length - 1; i >= 0; i--) {
          if (sum + bins[i] > m) {
            if (sum > 10) {
              limit = (i + 1 - (sum + bins[i] - m) / bins[i]) / bins_n;
            } else {
              limit = i / bins_n;
            }
            break;
          } else {
            sum += bins[i];
          }
        }
      }
      for (let i = 0; i < tuples.length; i++) {
        if (tuples[i].v >= limit && m-- > 0) {
          input.push(tuples[i].t);
        }
      }
      tuples = [];
      for (let i = 0; i < input.length; i++) {
        for (let j = 1; j < this.comb.length; j++) {
          if (this.rewards[j] > lim && (this.rewards[j] >= this.rewards[input[i][0]] - 2 || rel)) {
            let rep = {}
            let nr = true;
            rep[j] = true
            let tuple = new Array(k);
            tuple[0] = j;
            for (let l = k - 1; l > 0 && nr; ) {
              if ((rep[input[i][l - 1]] && l != k - 1) && !rel) {
                nr = false;
              } else {
                if (l != k - 1) {
                  rep[input[i][l - 1]] = true
                }
                tuple[l--] = input[i][l];
              }
            }
            if (nr) {
              let ev = this.eval(tuple);
              tuples.push({t: tuple, v: ev.v, p: ev.p});
            }
          }
        }
      }
    }
    return tuples;
  }

}
