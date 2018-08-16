'use strict'; /*jslint node:true*/

/* Description:
 * Algo is trying to calculate op values by used offers.
 * After that, using values with best cost (for op) calculate offers cost for opp.
 * In the end, search optimal offer for me and op.
 *
 * In details:
 * combine_values, combine_offers, get_ind are support methods.
 * combine_values used to get array with all possible values for provided counts.
 * combine_offer does the same for offers.
 * get_ind search array index in array of arrays. Used to search in values and offers arrays.
 *
 * init_op_costs, update_op_costs, recalc_op_offers_cost main methods to predict op values and offers cost.
 * init_op_costs - with first op offer init op values array. Calculate cost for this offer and find max value.
 * update_op_costs - every next op offer updates values array.
 * recalc_op_offers_cost - simply creates op offers cost array, using predicted values array (max values only).
 *
 * get_best_offer_ind - main method for searching offers.
 * Algo is greedy before last trading round. At last trading round op offer can cost not more than +1 to me.
 * Also at last trading round algo can change offer to op_best_offer_ind (op offer with maximum cost for me seen during
 * trading rounds). Harder to exploit me.
 *
 * I think, that's all. :-) Good luck!
 */

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.max_rounds = max_rounds;
    this.rounds = max_rounds;
    this.log = log;

    this.total = 0;
    for (let i = 0; i<counts.length; i++)
        this.total += counts[i]*values[i];

    // get all possible values (total the same for both)
    this.all_values = [];
    this.combine_values([], 0, 0);

    this.values_ind_me = this.get_ind(this.all_values, this.values);
    this.used_offers_ind = [];
    this.op_best_offer_ind = 0;
    this.my_last_offer_ind = 0;

    // get all possible offers
    this.all_offers = [];
    this.combine_offers([], 0);

    this.all_offers_cost_me = [];
    for (let i = 0; i < this.all_offers.length; i++) {
      this.all_offers_cost_me.push(0);
      for (let j = 0; j < this.counts.length; j++) {
        this.all_offers_cost_me[i] += this.values[j] * this.all_offers[i][j];
      }
    }
  }
  offer(o) {
    this.rounds--;
    if (o) {
      this.offer_ind = this.get_ind(this.all_offers, o);

      // accept on last round anything with cost
      if (this.me == 1 && this.rounds == 0 && this.all_offers_cost_me[this.offer_ind] >= 1)
        return;
      
      if (!this.all_offers_cost_op)
        this.init_op_costs(o);
      else
        this.update_op_costs(o);

      if (this.all_offers_cost_me[this.offer_ind] >= this.all_offers_cost_me[this.op_best_offer_ind])
        this.op_best_offer_ind = this.offer_ind;
    }
    var my_offer = this.get_best_offer_ind();

    // accept if current offer not worse then founded for the last trading round only (harder to exploit me)
    if (((this.me == 0 && this.rounds == 0) || (this.me == 1 && this.rounds == 1))
      && this.all_offers_cost_me[this.offer_ind] >= this.all_offers_cost_me[my_offer]) {
      return;
    }

    if (this.used_offers_ind.indexOf(this.offer_ind) == -1)
      this.used_offers_ind.push(this.offer_ind);
    if (this.used_offers_ind.indexOf(my_offer) == -1)
      this.used_offers_ind.push(my_offer);

    this.my_last_offer_ind = my_offer;
    return this.all_offers[this.my_last_offer_ind];
  }
  get_best_offer_ind() {
    for (let cost = this.total; cost > 0; cost--) {

      // 1 - exclude "you get everyting", -1 for exclude "want everything" offers
      for (let i = 1; i < this.all_offers.length - 1; i++) {
        if (this.all_offers_cost_me[i] == cost && this.used_offers_ind.indexOf(i) == -1) {
          var op_max_ind = i;

          // maximize cost for op with same cost for me
          if (this.all_offers_cost_op) {
            for (let j = 0; j < this.all_offers.length - 1; j++) {
              if (this.used_offers_ind.indexOf(j) == -1
                && this.all_offers_cost_me[j] == this.all_offers_cost_me[i]
                && this.all_offers_cost_op[j] >= this.all_offers_cost_op[i])
                op_max_ind = j;
              }
          }
          if (this.my_last_offer_ind != 0) {
            if (this.all_offers_cost_me[op_max_ind] >= this.all_offers_cost_me[this.my_last_offer_ind]
              && this.all_offers_cost_op[op_max_ind] <= this.all_offers_cost_op[this.my_last_offer_ind])
              break;

            // before last offer doesn't decrease cost for me more then for op
            var decrease = 0;
            if ((this.me == 0 && this.rounds == 0) || (this.me == 1 && this.rounds == 1))
              decrease = 1;
            if (this.all_offers_cost_me[op_max_ind] < this.all_offers_cost_op[op_max_ind] - decrease)
              op_max_ind = this.my_last_offer_ind;

            // on last trading round change offer by op best offer if cost is not worse
            if (this.op_best_offer_ind != 0
              && ((this.me == 0 && this.rounds == 0) || (this.me == 1 && this.rounds == 1))
              && this.all_offers_cost_me[op_max_ind] <= this.all_offers_cost_me[this.op_best_offer_ind]) {
              op_max_ind = this.op_best_offer_ind;
            }
          }

          return op_max_ind;
        }
      }
    }
    // can't find possible offer with cost > 0
    return this.my_last_offer_ind;
  }
  init_op_costs(o) {
    this.all_values_cost_op = [];
    this.all_values_cost_op_max_ind = 0;
    for (let i = 0; i < this.all_values.length; i++) {
      this.all_values_cost_op.push(0);

      if (i == this.values_ind_me)
        continue;

      for (let j = 0; j < o.length; j++) {
        if (this.all_values[i][j] == 0 && o[j] == 0) {
          this.all_values_cost_op[i] = 0;
          break;
        }
        this.all_values_cost_op[i] += this.all_values[i][j] * (this.counts[j] - o[j]);
      }
      if (this.all_values_cost_op[i] > this.all_values_cost_op[this.all_values_cost_op_max_ind])
        this.all_values_cost_op_max_ind = i;
    }
    this.recalc_op_offers_cost();
  }
  update_op_costs(o) {
    this.all_values_cost_op_max_ind = 0;
    for (let i = 0; i < this.all_values.length; i++) {

      if (i == this.values_ind_me)
        continue;

      var sum = 0;
      for (let j =0; j < o.length; j++) {
        if (this.all_values[i][j] == 0 && o[j] == 0 && this.counts[j] > 1) {
          sum = 0; 
          break;
        }
        sum += this.all_values[i][j] * (this.counts[j] - o[j]);
      }
      this.all_values_cost_op[i] = (this.all_values_cost_op[i] + sum) / 2;
      if (this.all_values_cost_op[i] > this.all_values_cost_op[this.all_values_cost_op_max_ind])
        this.all_values_cost_op_max_ind = i;
    }
    this.recalc_op_offers_cost();
  }
  recalc_op_offers_cost() {
    this.possible_values_op = [];
    for (let i = 0; i < this.all_values_cost_op.length; i++) {
      if (this.all_values_cost_op[i] >= this.all_values_cost_op[this.all_values_cost_op_max_ind] - 2) {
        this.possible_values_op.push(this.all_values[i]);
      }
    }
    this.all_offers_cost_op = [];
    for (let i = 0; i < this.all_offers.length; i++) {
      this.all_offers_cost_op.push(0);
      for (let k = 0; k < this.possible_values_op.length; k++) {
        for (let j = 0; j < this.counts.length; j++) {
          this.all_offers_cost_op[i] += this.possible_values_op[k][j] * (this.counts[j] - this.all_offers[i][j]);
        }
      }
      this.all_offers_cost_op[i] /= this.possible_values_op.length;
    }
  }
  /* get index in array of arrays */
  get_ind(array_ext, array_int) {
    for (let i = 0; i < array_ext.length; i++) {
      var found = 1;
      for (let j = 0; j < this.counts.length; j++) {
        if (array_ext[i][j] != array_int[j]) {
          found = 0;
          break;
        }
      }
      if (found == 1) {
        return i;
      }
    }
  }
  /* collect all possible values combinations (total the same) */
  combine_values(val, sum, index) {
    if (index == this.counts.length) {
      this.all_values.push(val);
    }

    for (let i = 0; i <= (this.total - sum)/this.counts[index]; i++) {
      var val2 = val.slice();
      if (index == this.counts.length - 1) {
        i = (this.total - sum)/this.counts[index];
        if (i !== Math.floor(i)) //not natural number
          break;
      }
      val2.push(i);
      this.combine_values(val2, sum + i * this.counts[index], index + 1);
    }
  }
  /* collect all possible offers combinations */
  combine_offers(val, index) {
    if (index == this.counts.length) {
      this.all_offers.push(val);
    }

    for (let i = 0; i <= this.counts[index]; i++) {
      var val2 = val.slice();
      val2.push(i);
      this.combine_offers(val2, index + 1);
    }
  }
}
