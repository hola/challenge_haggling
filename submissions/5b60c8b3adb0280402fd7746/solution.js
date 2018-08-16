module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.maxRounds = maxRounds;
    this.log = log;

    this.round = 0;

    // Opponent offers store
    this.opponentVariants = [];

    // Max worth for me
    this.total = this.getTotal(counts, values);

    // Offer variants
    this.variants = this.getVariants()
      .filter(this.filter, this);
  }

  static sum(a, b) {
    return a + b;
  }

  static arrSum(arr) {
    return arr.reduce(Agent.sum, 0);
  }

  getTotal(counts, values) {
    let res = 0;

    for (let i = 0, l = counts.length; i < l; i++) {
      res += counts[i] * values[i];
    }

    return res;
  }

  getVariants() {
    const combs = new Array(this.counts.length).fill(0);
    const variants = [];

    const next = (i = combs.length - 1) => {
      combs[i] = (combs[i] + 1) % (this.counts[i] + 1);

      if (combs[i] === 0) {
        if (i === 0 && Agent.arrSum(combs) === 0)
          return;

        return next(i - 1);
      }

      variants.push({
        offer   : combs.slice(),
        worth   : this.getTotal(combs, this.values),
        count   : Agent.arrSum(combs),
        oppWorth: 0,
      });

      next();
    };

    next();

    const totalCount = Agent.arrSum(this.counts);

    return variants
      .filter(variant => variant.count < totalCount && variant.worth > 0)
      .sort((a, b) => b.worth - a.worth);
  }

  // Filters variants with same price and lower counts for opponent
  filter(variant, i, variants) {
    for (let i = 0, iLen = variants.length; i < iLen; i++) {
      if (variant.worth !== variants[i].worth) continue;

      let hasLower = false;
      let hasGreater = false;

      for (let j = 0, jLen = variant.offer.length; j < jLen; j++) {
        const dif = variant.offer[j] - variants[i].offer[j];

        if (dif > 0) {
          hasGreater = true;
        } else if (dif < 0) {
          hasLower = true;
        }
      }

      if (hasGreater && !hasLower) {
        return false;
      }
    }

    return true;
  }

  // Returns predicated opponent values
  approximateOpponentValues() {
    const approxValues = [];

    for (let i = 0, l = this.opponentVariants.length; i < l; i++) {
      for (let j = 0; j < this.opponentVariants[i].offer.length; j++) {
        approxValues[j] = approxValues[j] || 0;
        approxValues[j] += this.opponentVariants[i].offer[j] / l;
      }
    }

    for (let i = 0, l = approxValues.length; i < l; i++) {
      approxValues[i] = 1 - approxValues[i] / this.counts[i];
    }

    const sum = Agent.arrSum(approxValues);

    for (let i = 0, l = approxValues.length; i < l; i++) {
      approxValues[i] *= this.total / sum / this.counts[i];
    }

    const possible = this.getPossibleValues()
      .sort((a, b) => Agent.arrDif(a, approxValues) - Agent.arrDif(b, approxValues));

    return possible[0];
  }

  static arrDif(a, b) {
    let res = 0;

    for (let i = 0, l = a.length; i < l; i++) {
      res += Math.abs(a[i] - b[i]);
    }

    return res;
  }

  // Returns all possible values cases for this counts
  getPossibleValues() {
    const values = new Array(this.values.length).fill(0);
    const map = (v, i) => v * this.counts[i];
    const res = [];

    const next = (i = values.length - 1) => {
      values[i] = (values[i] + 1) % (this.total + 1);

      if (values[i] === 0) {
        if (i === 0 && Agent.arrSum(values) === 0)
          return;

        return next(i - 1);
      }

      const total = Agent.arrSum(values.map(map));

      if (total > this.total) {
        values[i] = this.total;
        return next(i);
      }

      if (total !== this.total) {
        return next();
      }

      res.push(values.slice());

      next();
    };

    next();

    return res;
  }

  offer(offer) {
    this.round++;

    if (!offer) {
      return this.variants[0].offer;
    }

    const sum = this.getTotal(offer, this.values);
    this.opponentVariants.push({offer, worth: sum});

    if (this.round === this.maxRounds && this.me === 1 && sum > 0) return;

    if (this.round === this.maxRounds && this.me === 0 || this.round === this.maxRounds - 1 && this.me === 1) {
      const oppValues = this.approximateOpponentValues();
      const oppOffer = [];
      let variants = this.getVariants();

      for (let i = 0, l = variants.length; i < l; i++) {
        for (let j = 0; j < variants[i].offer.length; j++) {
          oppOffer[j] = this.counts[j] - variants[i].offer[j];
        }

        variants[i].oppWorth = this.getTotal(oppOffer, oppValues);
      }

      variants = variants
        .filter(v => v.oppWorth > 0.4 * this.total)
        .sort((a, b) => b.worth + b.oppWorth - a.worth - a.oppWorth);

      let variant = variants[0];

      // Find most nearest variant to opponent propositions
      if (!variant) {
        variants = this.variants.slice();
        variants.forEach(v => {
          v.dif = 0;
          this.opponentVariants.forEach(oppV => v.dif += Agent.arrDif(v, oppV));
        });

        variants.sort((a, b) => a.dif - b.dif);
        variant = this.variants[0];
      }

      if (variant) {
        this.opponentVariants.push(variant);
        this.opponentVariants.sort((a, b) => b.worth - a.worth);
      }

      variant = this.opponentVariants[0];

      if (variant.worth > 0) {
        if (sum >= variant.worth)
          return;

        return variant.offer;
      }
    }

    const variants = this.variants.filter(variant => variant.worth >= this.total * 0.7);
    const index = Math.min(variants.length, this.round) - 1;
    const variant = variants[index];

    if (sum >= variant.worth)
      return;

    return variant.offer;
  }
};
