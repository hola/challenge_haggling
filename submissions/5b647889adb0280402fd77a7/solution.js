'use strict';
/*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.max_rounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++)
      this.total += counts[i] * values[i];
    this.minimum = this.total / 2;

    log(`counts:${JSON.stringify(this.counts)}`);
    log(`values:${JSON.stringify(this.values)}`);
    this.myPreviousOffers = [];
    this.allPossibleOffers = [];

    const offerQtys = counts.map(maxQty => {
      const qtysOpts = [];
      for (let i = 0; i <= maxQty; i++) {
        qtysOpts.push(i);
      }
      // [2,3,1] => [[0,1,2], [0,1,2,3], [0,1]]
      return qtysOpts;
    });

    let allPossibleOffers = offerQtys.reduce((acc, qtys, index) => {
      if (index === 0) {
        return qtys.map(qty => [qty]);// [0,1,2] =>[[0],[1],[2]]
      }
      const newAcc = [];
      qtys.forEach(qty => {
        acc.forEach(offerCounts => {
          newAcc.push([...offerCounts, qty]);
        });
      });
      return newAcc;
    }, []);

    allPossibleOffers.forEach(o => {
      const sum = o.reduce((total, qty, index) => {
        return total + qty * values[index]
      }, 0);
      const totalItems = o.reduce((total, qty) => {
        return total + qty
      }, 0);
      this.allPossibleOffers.push({offer: o, sum, items: totalItems});

    });
    this.allPossibleOffers.sort((a, b) => (a.sum - b.sum));

    this.bestOffers = this.allPossibleOffers
        .filter((offer) => offer.sum >= this.minimum) // only offers over minimum
        .filter((offer) => {
          // exclude any offer with unwanted items
          return !offer.offer.some((count, index) => (this.values[index] === 0 && count > 0));
        })
        .sort((o1, o2) => {
          if (o2.sum === o1.sum) {
            return o1.items - o2.items
          }
          return o2.sum - o1.sum;
        });
    log(`Acceptable offers: ${this.bestOffers.length}`);
    this.nextOfferIndex = 0;
  }

  offer(o) {
    this.rounds--;
    const roundPerCent = 100 - ((this.rounds / this.max_rounds) * 100);
    this.log(`${this.rounds} rounds left (${roundPerCent}% completed), next idx ${this.nextOfferIndex}`);
    if (o) {
      let sum = 0;
      for (let i = 0; i < o.length; i++)
        sum += this.values[i] * o[i];

      const heGets = o.map((count, idx) => this.counts[idx] - count);

      this.log(`offer received : I get ${JSON.stringify(o)}, sum: ${sum} of ${this.total}; He gets ${JSON.stringify(heGets)}`);

      // this.bestReceivedOffer = this.bestReceivedOffer && sum > this.bestReceivedOffer.sum ? {
      //   offer: o,
      //   sum
      // } : (this.bestReceivedOffer || {offer: o, sum});

      if (this.bestReceivedOffer) {
        if (sum > this.bestReceivedOffer.sum) {
          this.bestReceivedOffer = {offer: o, sum};
        } else if (sum === this.bestReceivedOffer.sum) {
          const offeredItems = o.reduce((acc, count) => (acc + count), 0);
          const bestOfferedItems = this.bestReceivedOffer.offer.reduce((acc, count) => (acc + count), 0);
          this.bestReceivedOffer = offeredItems > bestOfferedItems ? {offer: o, sum} : this.bestReceivedOffer;
        }

      } else {
        this.bestReceivedOffer = {offer: o, sum};
      }


      if (sum == this.total)
        return;

      if (this.rounds === 0 && this.me === 1 && sum >= this.minimum) {
        // last round last of is mine - accept anything
        this.log(`last round, last turn. i'll take anything greater than minimum`);
        return;
      } else if (this.rounds === 0 && this.me === 0 && sum <= this.bestReceivedOffer.sum && this.bestReceivedOffer.sum >= this.minimum) {
        const giveUp = Math.random() * (4 - 1) + 1;// 1 -> 4
        this.log(`last round, giving up? (${giveUp})`);
        if (Math.floor(giveUp) > 1) {// 2/3 of the time
          this.log(`last round, i'll take last best offer greater than minimum`);
          return sum === this.bestReceivedOffer.sum ? undefined : this.bestReceivedOffer.offer;
        } else {
          this.log(`last round, i'll take a risk and make a last offer`);
        }
      }

      // if matches previous offer accept
      if (this.myPreviousOffers.length) {
        const matchesPreviousOffer = this.myPreviousOffers.find((prevOffer) => {
          const offerSum = prevOffer.reduce((acc, qty, i) => (acc + qty * this.values[i]), 0);
          return offerSum === sum;
        });

        if (matchesPreviousOffer) {
          return;// maybe i should ask for more?
        }
      }

      let nextOffer;
      if (this.bestOffers[this.nextOfferIndex]) {
        nextOffer = this.bestOffers[this.nextOfferIndex];
        this.log(`next candidate offer: ${JSON.stringify(nextOffer)}`);
        if (this.nextOfferIndex === 0) {
          this.log(`offer path: 1`);
          this.nextOfferIndex++;//go to next
        } else if ((this.nextOfferIndex - 1) > 0 && nextOffer.sum === this.bestOffers[this.nextOfferIndex - 1].sum) {
          //we are good - next offer is the same as last offer
          this.nextOfferIndex++;//go to next
          this.log(`offer path: 2`);
        } else if ((this.nextOfferIndex - 1) >= 0 && nextOffer.sum < this.bestOffers[this.nextOfferIndex - 1].sum) {
          // the next offer is less than the last one. Should we allow it?
          const numberOfOffersLeft = this.bestOffers.filter((offer, index) => index > this.nextOfferIndex).length;
          if (numberOfOffersLeft < this.rounds || nextOffer.sum < this.minimum) {
            // stick to last offer
            nextOffer = this.bestOffers[this.nextOfferIndex - 1];
            this.log(`offer path: 3.1`);
            // next offer is this one
          } else if (nextOffer.sum === this.bestReceivedOffer.sum && this.rounds > 0) {
            // he already made this offer
            // it is not the last round. Let's stay put
            nextOffer = this.bestOffers[this.nextOfferIndex - 1];
            this.log(`offer path: 3.2`);
            // next offer is this one
          } else {
            // use next offer
            this.log(`offer path: 3.3`);
            this.nextOfferIndex++;
          }
        }
      } else if (this.bestOffers[this.nextOfferIndex - 1]) {
        this.log(`offer path: last. no more`);
        nextOffer = this.bestOffers[this.nextOfferIndex - 1];
      } else {
        throw new Error(`Out of range offer index${this.nextOfferIndex - 1}`);
      }

      this.myPreviousOffers.push(nextOffer.offer);
      this.log(`best offer: ${JSON.stringify(nextOffer)}`);
      return nextOffer.offer;
    }
    o = this.bestOffers[this.nextOfferIndex].offer;
    this.nextOfferIndex++;
    this.log(`my offer: ${JSON.stringify(o)}`);
    this.myPreviousOffers.push(o);
    return o;
  }
};
