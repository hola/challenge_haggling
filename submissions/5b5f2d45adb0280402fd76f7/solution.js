'use strict'; /*jslint node:true*/

const MIN_THRESHOLD = 50;

const merge = (arr1, arr2) => {
  const newArr = [];
  for (const i of arr1) {
    for (const j of arr2) {
      newArr.push(i.concat(j));
    }
  }
  return newArr;
};

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log){
    this.meFirst = me === 0;
    this.counts = counts;
    this.values = values;
    this.maxRounds = maxRounds;
    this.rounds = maxRounds;
    this.log = log;
    this.lastOfferIndex = 0;
    this.total = counts.reduce(this._calcSum.bind(this), 0);
    this.myRange = this._defineMyRange();
    this.oppOffers = [];
   }

  _calcThreshold() {
    const threshold = MIN_THRESHOLD / this.maxRounds * (this.rounds) + MIN_THRESHOLD;
    return Math.max(MIN_THRESHOLD, threshold) / 100;
  }

  _calcSum(sum, count, ind) {
    sum += this.values[ind] * count;
    return sum;
  }

  _defineMyRange() {
    const arr = [];

    for (let index = 0; index < this.values.length; index++) {
      const r = [];
      for (let i = 0; i <= this.counts[index]; i++) {
        r.push(i);
      }
      arr.push(r);
    } 

    let range = [[]];
    for (const sc of arr) {
      range = merge(range, sc);
    }

    return range.sort((a, b) => {
      const va = a.reduce(this._calcSum.bind(this), 0);
      const vb = b.reduce(this._calcSum.bind(this), 0);
      return vb - va;
    });
  }

  _makeOffer(minThreshold) {
    this.lastOfferIndex += 1;

    const fromIndex = this.lastOfferIndex >= this.myRange.length 
      ? this.myRange.length - 1
      : this.lastOfferIndex;

    for (let index = fromIndex; index >= 0; index--) {    
      let threshold = this.myRange[index].reduce(this._calcSum.bind(this), 0) / this.total;
      if (threshold >= minThreshold) {
        this.lastOfferIndex = index;
        break;
      }
    }

    const o = this.myRange[this.lastOfferIndex];
    this.log(`my offer: ${o}, sum: ${o.reduce(this._calcSum.bind(this), 0)}`);    
    return o;
  }

  offer(o){
    this.log(`${this.rounds} rounds left`);
    this.rounds--;

    const threshold = this._calcThreshold();
    
    if (o) {
      o.sum = o.reduce(this._calcSum.bind(this), 0);
      this.oppOffers.push(o);

      this.log(`opp offer: ${o}`);
      this.log(`my threshold: ${threshold}`);
      this.log(`opp offer sum: ${o.sum}`);

      if (o.sum >= this.total * threshold) {
        return;
      } 
      
      if (this.rounds === 0) {
        const minSum = this.total / 100 * MIN_THRESHOLD;
        if (this.meFirst) {
          const maxOppOffer = this._getMaxOppOffer();
          this.log(`max opp offer ${maxOppOffer.sum} - ${maxOppOffer}`);
          if (maxOppOffer.sum > minSum) {
            this.log('take opp offer');
            return maxOppOffer;
          }
        } else if (o.sum > minSum) {
          sreturn;
        }
      }
    }
    return this._makeOffer(threshold);
  }

  _getMaxOppOffer() {
    this.oppOffers.sort((a, b) => {
      return b.sum - a.sum;
    });
    return this.oppOffers[0];
  }
};
