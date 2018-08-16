'use strict'; /*jslint node:true*/

const MIN_OFFER = 0.5;

module.exports = class Estimator {
  constructor(me, counts, values, maxRounds, log){
    this.counts = counts;
    this.values = values;
    this.maxRounds = maxRounds;
    this.log = log;

    this.round = 0;

    this.total = 0;
    for (let i = 0 ; i < this.counts.length; i++) {
      this.total += this.counts[i] * this.values[i];
    }

    this.possibleValues = [];
    this.possibleOffers = [];

    this.fillValues(this.counts.slice().fill(0), 0, 0);
    this.fillOffers(this.counts.slice().fill(0), 0);

    this.possibleValues = this.possibleValues.filter((v) => {
      return !v.every((cell, i) => {
        return this.values[i] === cell;
      });
    });
    this.possibleOffers = this.possibleOffers.filter((o) => {
      return this.offerValue(o, this.values) >= MIN_OFFER;
    });

    this.pastOffers = [];
  }

  invertOffer(offer) {
    return offer.map((count, i) => this.counts[i] - count);
  }

  offerValue(offer, values) {
    let res = 0;
    for (let i = 0; i < offer.length; i++) {
      res += offer[i] * values[i];
    }
    return res / this.total;
  }

  fillValues(values, i, total) {
    const count = this.counts[i];
    const max = (this.total - total) / count | 0;
    if (i === this.counts.length - 1) {
      if (total + max * count === this.total) {
        values[i] = max;
        this.possibleValues.push(values.slice());
      }
      return;
    }
    for (let j = 0; j <= max; j++) {
      values[i] = j;
      this.fillValues(values, i + 1, total + j * count);
    }
  }

  fillOffers(offer, i) {
    if (i === this.counts.length) {
      this.possibleOffers.push(offer.slice());
      return;
    }

    for (let j = 0; j <= this.counts[i]; j++) {
      offer[i] = j;
      this.fillOffers(offer, i + 1);
    }
  }

  offer(o) {
    this.round++;

    // Pretend that they ask for everything
    if (o === undefined) {
      o = this.counts.map(_ => 0);
    }

    this.pastOffers.push({ type: 'wanted', offer: this.invertOffer(o) });
    const estimates = this.estimate(this.pastOffers);
    const sortedValues = this.possibleValues.map((values, i) => {
      return { values, estimate: estimates[i] };
    }).sort((a, b) => b.estimate - a.estimate);

    const maxEstimate = sortedValues[0].estimate;
    const minEstimate = sortedValues[0].estimate * 0.4;

    const estimatedValues = this.averageValues(sortedValues.filter((entry) => {
      return entry.estimate >= minEstimate;
    }).map((entry) => {
      return entry.values;
    }));

    this.log(`estimated values=[ ${estimatedValues.join(', ')} ]`);
    this.log(`max=${maxEstimate} min=${minEstimate}`);

    const threshold = 0.8 - 0.3 * (this.round / this.maxRounds) ** 1.0;

    const scores = this.possibleOffers.map((offer) => {
      const selfValue = this.offerValue(offer, this.values);
      const opValue = this.offerValue(this.invertOffer(offer), estimatedValues);

      if (selfValue < threshold) {
        return -1e42;
      }

      return selfValue + opValue;
    });

    let maxScore = -Infinity;

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i];
      }
    }

    const offers = this.possibleOffers.filter((offer, i) => {
      return scores[i] === maxScore;
    });

    const result = offers[(offers.length * Math.random()) | 0];
    const value = this.offerValue(result, this.values);

    const proposedValue = this.offerValue(o, this.values);
    this.log(`we want=${value} threshold=${threshold}`);
    this.log(`score=${maxScore} choices=${offers.length}`);

    // Accept
    if (threshold <= proposedValue) {
      return undefined;
    }

    this.pastOffers.push({ type: 'rejected', offer: this.invertOffer(result) });
    return result;
  }

  estimate(pastOffers) {
    const scores = [];
    for (const values of this.possibleValues) {
      let score = 0;
      for (const o of pastOffers) {
        const value = this.offerValue(o.offer, values);
        if (o.type === 'rejected') {
          score -= value;
        } else {
          score += value;
        }
      }
      scores.push(score / pastOffers.length);
    }
    return scores;
  }

  averageValues(list) {
    const res = this.counts.slice().fill(0);

    for (const values of list) {
      for (let i = 0; i < values.length; i++) {
        res[i] += values[i] / list.length;
      }
    }

    return res;
  }
};
