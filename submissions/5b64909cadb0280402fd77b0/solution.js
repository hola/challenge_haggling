'use strict';
module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.round = 0;
        this.total = 0;
        this.best = 0;
        this.oSum = 0;
        this.items = counts.reduce((a, b) => a + b, 0);
        this.calc = new Array(counts.length);
        for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
            this.calc[i] = {ind: i, cnt: counts[i], val: values[i], rate: 0, oprate: counts.length, ovrate:0};
        }
        function compare(a,b) {
          if (a.val > b.val)
            return -1;
          if (a.val < b.val)
            return 1;
          return 0;
        }
        this.calc.sort(compare);
        let vl = -1;
        let subi = 0;
        for (let i = 0; i<counts.length; i++) {
            if (vl != this.calc[i].val) {
              subi++;
              vl = this.calc[i].val;
            }
            this.calc[i].rate = subi;
            this.calc[i].ovrate = this.calc[i].rate * this.calc[i].oprate;
        }
        this.step = this.total / 2 / this.rounds;
    }
    offer(o){
        this.round++;
        this.rounds--;
        this.off = o;
        if (o)
        {
            let sum = 0;
            for (let i = 0; i<o.length; i++) {
                sum += this.values[i]*o[i];
            }
            this.oSum = sum;
            if (sum == this.total) {
               return;
            }
            if (sum >= this.best) {
              this.bestOffer = o;
              this.best = sum;
            }
            if(sum == this.total) {
                return;
            }

            if (this.rounds == 0) {
                if (this.me == 1) {
                    if (sum>=(this.total/2-2)) {
                        return;
                    } 
                }
                if (this.me == 0 && this.best >= this.total/2) {
		         return this.bestOffer;
                }
            }
            for (let i = 0; i<o.length; i++) {
              if(o[i]>0) {
                for(let k = 0; k < o.length; k++) {
                  if (this.calc[k].ind == i) {
                        this.calc[k].oprate = 1;
                        this.calc[k].ovrate = this.calc[k].rate * this.calc[k].oprate;
                  }
                }
              }
            }
            function compareOvrate(a,b) {
              if (a.ovrate > b.ovrate)
                 return -1;
              if (a.ovrate < b.ovrate)
                 return 1;
              return 0;
            }
            this.calc.sort(compareOvrate);
        }
        o = this.counts.slice();
        let marker = 0;
        for (let i = 0; i < o.length; i++)
        {
            if (this.values[i] == 0){
                o[i]--;
                marker = 1;
                break;
            }
        }
        if (this.round == 1 && marker == 1) {
           return o;
        }
        let max_discount = this.step * this.round - 1;
        let discount = 0;
        for (let i = 0; i < this.calc.length; i++) {
          for(let it = 1; it <= this.calc[i].cnt; it++) {
            if (discount + this.calc[i].val <= max_discount) {
                discount += this.calc[i].val;
                if (o[this.calc[i].ind] > 0) {
                    o[this.calc[i].ind]--;
                }
            }
          }
        }
        let curOfferSum = 0;
        for (let i = 0; i<o.length; i++) {
            curOfferSum += this.values[i]*o[i];
        }
        if (curOfferSum <= this.best) {
            if (this.off && this.oSum == this.best) {
                return;
            }
         return this.bestOffer;
        }
        return o;
    }
};
