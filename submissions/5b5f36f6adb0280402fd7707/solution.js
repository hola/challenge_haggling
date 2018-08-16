'use strict'; /*jslint node:true*/
module.exports = class Agent {
  constructor (me, counts, vals, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.vals = vals;
    this.max_rounds = max_rounds;
    this.curr_round = 0;
    this.rem_rounds = max_rounds;
    this.best = new Array();
    this.remote_counts = new Array();
    this.script = {};
    for (let i = 0; i < this.counts.length; i++) {
     this.remote_counts[i] = 0;
    }
    this.total_val = 0;
    for (let i = 0; i < this.counts.length; i++) {
      this.total_val += this.counts[i] * this.vals[i];
    }
    function find_all (counts, vals) {
      let all = new Array();
      let p = 0;
      for (let i = 0; i <= counts[0]; i++) {
        for (let j = 0; j <= counts[1]; j++) {
          for (let k = 0; k <= counts[2]; k++) {
            let pos = {
              'counts': [i, j, k],
              'num': i + j + k,
              'val': i * vals[0] + j * vals[1] + k * vals[2]
            };
            all[p] = pos;
            p++;
          }
        }
      }
      return all;
    }
    function find_best (array, counts, vals) {
      let best = new Array();
      for (let i = 0; i < array.length; i++) {
        let new_node = array[i];
        if (array[i].val == 0 || vals[0] == 0 && new_node.counts[0] == counts[0] || vals[1] == 0 && new_node.counts[1] == counts[1] || vals[2] == 0 && new_node.counts[2] == counts[2] || counts[0] + counts[1] + counts[2] == array[i].num) {
        } else {
          let j = 0
          while (best[j] != null) {
            if (new_node.val > best[j].val || new_node.val == best[j].val && new_node.num <= best[j].num) {
              let tmp_node = best[j];
              best[j] = new_node;
              new_node = tmp_node;
            }
            j++;
          }
          best[j] = new_node;
        }
      }
      return best;
    }
    this.find_best_min = function (array, ref, min) {
      for(let i = 0; i < array.length; i++) {
        if (array[i].counts[min] < ref[min]) {
          return array[i];
        }
      }
    }
    this.find_max = function (array) {
      let max = 0;
      for (let i = 0; i < array.length; i++) {
        if (array[i] >= array[max]) {
          max = i;
        }
      }
      return max;
    };
    this.find_min = function (array, max, prev) {
      let min = max;
      for (let i = 0; i < array.length; i++) {
        if (array[i] <= array[min] && prev != i) {
          min = i;
        }
      }
      return min;
    };
    function find_stats (array, length) {
      let stats = new Array();
      for (let i = 0; i <= length; i++) {
        let c = {
          'num': 0,
          'prob': 0
        };
        stats[i] = c;
      }
      for (let i = 0; i < array.length; i++) {
        stats[array[i].val].num++;
      }
      for (let i = 0; i < stats.length; i++) {
        let sum = 0;
        for (let j = i + 1; j < stats.length; j++) {
          sum += stats[j].num;
        }
        stats[i].prob = sum / array.length;
      }
      return stats;
    }
    this.all = find_all(this.counts, this.vals);
    this.best = find_best(this.all, this.counts, this.vals);
    this.min_val = this.best[0].val * 0.8;
    this.min_prob = 0.2;
    this.stats = find_stats(this.all, this.total_val)
  }
  offer (o) {
    this.rem_rounds--;
    this.curr_round++;
    if (o) {
      let num = 0;
      let val = 0;
      for (let i = 0; i < o.length; i++) {
        num += o[i];
        val += this.vals[i] * o[i];
        this.remote_counts[i] += o[i]
      }
      if (this.me == 0 && val >= this.best[0].val) {
        return;
      } else if (this.me == 1 && (val >= this.min_val || this.stats[val] <= this.min_prob || (val > 0 && this.rem_rounds == 0))) {
        return;
      }
    }
    if (this.me == 0 && this.rem_rounds == 0) {
      this.script.val = 0;
      let max = this.find_max (this.remote_counts);
      if(this.remote_counts[max] == 0) {
        this.script = Object.assign({}, this.best[0]);
      } else {
        let min = this.find_min (this.remote_counts, max, -1);
        this.script = Object.assign({}, this.find_best_min (this.best, this.counts, min));
        if (this.script != null) {
        } else {
          this.script = Object.assign({}, this.best[0]);
        }
      }
    } else {
      this.script = Object.assign({}, this.best[0]);
    }
    return this.script.counts;
  }
};
