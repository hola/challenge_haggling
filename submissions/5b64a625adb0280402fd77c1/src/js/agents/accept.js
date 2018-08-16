'use strict'; /*jslint node:true*/

module.exports = class Accept {
  constructor(me, counts, values, max_rounds, log){
    this.counts = counts;
  }

  offer(o) {
    // Ask everything
    if (o === undefined) {
      return this.counts;
    }

    // Accept anything
    return undefined;
  }
};
