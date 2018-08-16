'use strict'; /*jslint node:true*/

module.exports = class Agent {
    equal(v1, v2) {
        if(!v1 || !v1) {
            return false
        }
        for (var i = 0; i < v1.length; i++) {
            if (v1[i] != v2[i]) {
                return false
            }
        }
        return true
    }

    score(offer, val) {
        return offer[0] * val[0] + offer[1] * val[1] + offer[2] * val[2]
    }

    getValuations(counts, excludeValuation) {
        var vals = []
        for (var i = 0; i <= 10; i++)  {
            for (var j = 0; j <= 10; j++)  {
                for (var k = 0; k <= 10; k++)  {
                    let v = [i, j, k]
                    if (this.score(v, counts) == 10 && !vals.includes(v) && !this.equal(v, excludeValuation)) {
                        vals.push(v)
                    }
                }
            }
        }
        return vals
    }

    switchOffer(offer, counts) {
        if (!offer) {
            return offer
        }
        var res = counts.slice()
        for( var i = 0; i < counts.length; i++) {
            res[i] -= offer[i]
        }
        return res
    }

    remove(arr, value) {
        var idx = arr.indexOf(value);
        if (idx != -1) {
            return arr.splice(idx, 1);
        }
        return false;
    }

    constructor(me, counts, values, max_rounds){
        this.balance = 0;///
        this.testex = 1;
        this.counts = counts;
        this.me = me;
        this.values = values;
        this.rounds = max_rounds;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.allOffersConst = []
        for (var i = 0; i <= counts[0]; i++)  {
            for (var j = 0; j <= counts[1]; j++)  {
                for (var k = 0; k <= counts[2]; k++)  {
                    let offer = [i, j, k]
                    if (!this.equal(offer, [0, 0, 0]) && !this.equal(offer, counts) && !this.allOffersConst.includes(offer) && this.score(offer, values) > 0) {
                        this.allOffersConst.push(offer)
                    }
                }
            }
        }
        this.offers = this.allOffersConst.slice()
        this.allEnemyPossibleValues = this.getValuations(this.counts, this.values)
        this.enemyPossibleValues = this.allEnemyPossibleValues.slice()
        this.allPossibleValuesConst = this.enemyPossibleValues.slice()
        this.allPossibleValuesConst.push(this.values) 
        this.maxProfit = 7
        this.enemyDesiresIntersection = counts.slice()
        this.scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (var i = 0; i < this.offers.length; i++) {
            this.scores[this.score(this.offers[i], this.values)]++
        }
        this.c = 0;
        for (var i = 0; i < this.scores.length; i++) {
            if (this.scores[i] > 0) 
                this.c++
        }
    }

    numberItemsInEnemyDesire() {
        var res = 0
        for (var i = 0; i < this.enemyDesiresIntersection.length; i++) 
            res += this.enemyDesiresIntersection[i]
        return res
    }

    answer10(offer, counts, values) {
      if(this.score(offer, values) >= 2) {
        return
      }
      return counts
    }

    countAnswer10Accept(offer, counts) {
      let reverseOffer = this.switchOffer(offer, counts)
      var res = 0
      for (var i = 0; i < this.enemyPossibleValues.length; i++) 
        if (!this.answer10(reverseOffer, counts, this.enemyPossibleValues[i]))
          res++
      return res
    }

    question9() {
      var offers = this.allOffersConst.slice()
      var self = this
      var valuesLocal = this.values
      var countsLocal = this.counts
      var offerCandidates = offers.map(function(o) {
        return {offer: o, profit: self.score(o, valuesLocal), acceptCount: self.countAnswer10Accept(o, countsLocal)}
      });
      return offerCandidates.reduce(function (p, v) {
        return ( p.profit * p.acceptCount > v.profit * v.acceptCount ? p : v );
      }).offer
    }

    answer9(offer, counts, values) {
      if (this.numberItemsInEnemyDesire() <= 2 && this.numberItemsInEnemyDesire() >= 1 )
        return this.switchOffer(this.enemyDesiresIntersection, this.counts)
      let myOffer = this.question9()
      if (this.score(myOffer, this.values) > this.score(offer, this.values)) {
        return myOffer
      } else {
        return
      }
    }

    countAnswer9Accept(offer, counts) {
      let reverseOffer = this.switchOffer(offer, counts)
      var res = 0
      for (var i = 0; i < this.enemyPossibleValues.length; i++) 
        if (!this.answer10(offer, counts, this.enemyPossibleValues[i]))
          res++
      return res
    }

    offer(o) {
        this.rounds--;
        var self = this
        if (o)
        {
            let sum = this.score(o, this.values)
            var switchOff = this.switchOffer(o, this.counts)
            for (var i = 0; i < this.counts.length; i++)
            {
                if(switchOff[i] < this.enemyDesiresIntersection[i])
                    this.enemyDesiresIntersection[i] = switchOff[i]
            }
            this.enemyPossibleValues = this.enemyPossibleValues.filter(function(v) {
                return self.score(switchOff, v) > 1;
            });
            if (this.values[0] == 10) {
                if (o[0] == 1)
                    return undefined
                else
                    return [1, 0, 0]
            }
            if (this.values[1] == 10) {
                if (o[1] == 1)
                    return undefined
                else
                    return [0, 1, 0]
            }
            if (this.values[2] == 10) {
                if (o[2] == 1)
                    return undefined
                else
                    return [0, 0, 1]
            }

            if (this.me == 1 && this.rounds == 0 && sum >= 1) {
                return
            }
            if (sum >= this.maxProfit)
                return
        }
        if (this.me == 0 && this.rounds == 0 ) {
            let t = this.answer9(o, this.counts, this.values)
            return t
        }
        var index = -1
        var max = -1
        var tmax = -1
        for (var i = 0; i < this.offers.length; i++)
        {
            let off = this.offers[i]
            let switchOff = this.switchOffer(off, this.counts)
            let s = this.score(off, this.values)
            if (s >= max) {
                var t = 0
                for (var j = 0; j < this.enemyPossibleValues.length; j++) {
                    let temp = this.score(switchOff, this.enemyPossibleValues[j])
                    if (temp == 10)
                        t += 50
                    if (temp >= 7)
                        t += 100
                }
                if(t == 0) 
                    continue
                if (s > max || t > tmax) {
                    tmax = t
                    index = i
                    max = s
                }
            }
        }
        if (max < this.maxProfit)
            this.maxProfit = max
        let off = this.offers[index]
        var reert = this.switchOffer(off, this.counts)
        this.enemyPossibleValues = this.enemyPossibleValues.filter(function(v) {
            return self.score(reert, v) < 10;
        });
        if (this.c + this.rounds < 7) {
            this.c += 2
            return this.counts.slice()
        }
        this.offers = this.offers.filter(function(v) {
            if (v[0] >= off[0] && v[1] >= off[1] && v[2] >= off[2])
                return false
            return true
        });
        if (o) {
            for (var i = 0; i < o.length; i++) {
                if (o[i] != off[i]) {
                    return off
                }
            }
            return
        }
        return off;
    }
};