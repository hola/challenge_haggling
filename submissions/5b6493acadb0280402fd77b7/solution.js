'use strict';
/*jslint node:true*/

const getOfferSum = (log, offer, counts, values) => {
  log(`offer, ${offer}`);

  if (offer) {
    let sum = 0;
    for (let i = 0; i < offer.length; i++) {
      sum += values[i] * offer[i];
    }

    return sum;
  }

  return 0;
};

const getUltimatumThreshold = (log, rounds, total) => {
  if (rounds < 1) {
    return total * 0.3;
  }

  return 0;
};

const getSomeThreshold = (log, rounds, total) => {
  if (rounds < 1) {
    return total * 0.6;
  } else if (rounds < 2) {
    return total * 0.3;
  } else if (rounds < 3) {
    return total * 0.1;
  }

  return 0;
};

const createOffer = (log, ultimatum, last, firstOffer, lastOffer, counts, values, rounds, threshold, nestedCount = 0) => {
  const offer = counts.slice();

  let buffer = 0;

  for (let i = 0; i < counts.length; i++) {
    const categoryValue = values[i];
    const categoryCount = counts[i];
    log(`threshold, ${threshold}`);

    for (let j = 0; j < categoryCount; j++) {
      const unnecessary = Boolean(lastOffer[i] && (lastOffer[i] === counts[i]));
      const expectedPrice = buffer + categoryValue;
      const overpriced = expectedPrice > threshold;

      log(`unnecessary, ${unnecessary}`);
      log(`buffer + categoryValue, ${buffer + categoryValue}`);
      log(`overpriced, ${overpriced}`);

      if (unnecessary || overpriced) continue;

      buffer += categoryValue;
      offer[i]--;
    }
  }

  log(`buffer, ${buffer}`);

  if (!buffer && last && nestedCount < 1) {
    return createOffer(log, ultimatum, last, firstOffer, lastOffer, counts, values, rounds, threshold + 1, 1)
  }

  if (!buffer && last && nestedCount < 2) {
    return createOffer(log, ultimatum, last, firstOffer, lastOffer, counts, values, rounds, threshold + 2, 2)
  }

  return offer;
};

const ultimatum = (log, offer, firstOffer, lastOffer, total, rounds, counts, values) => {
  const sum = getOfferSum(log, offer, counts, values);

  const threshold = getUltimatumThreshold(log, rounds, total);

  const last = rounds === 0;

  const newOffer = createOffer(log, true, last, firstOffer, lastOffer, counts, values, rounds, threshold, 0);
  const sumNewOffer = getOfferSum(log, newOffer, counts, values);
  log(`sumNewOffer ${sumNewOffer}`);
  log(`sum ${sum}`);

  if (sumNewOffer && sum && sum >= sumNewOffer) {
    return;
  }

  return newOffer;
};

const something = (log, offer, firstOffer, lastOffer, total, rounds, counts, values) => {
  const sum = getOfferSum(log, offer, counts, values);

  if (rounds === 0 && sum > 0) {
    log(`rounds === 0 && sum > 0, ${rounds === 0 && sum > 0}`);
    return;
  }

  const threshold = getSomeThreshold(log, rounds, total);

  const last = rounds === 1;

  const newOffer = createOffer(log, false, last, firstOffer, lastOffer, counts, values, rounds, threshold, 0);
  const sumNewOffer = getOfferSum(log, newOffer, counts, values);
  log(`sumNewOffer ${sumNewOffer}`);
  log(`sum ${sum}`);

  if (sumNewOffer && sum && sum >= sumNewOffer) {
    return;
  }

  return newOffer;
};

module.exports = class Agent1 {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me === 0;
    this.counts = counts;
    this.values = values;
    this.max_rounds = max_rounds;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    this.firstOffer = [];
    this.lastOffer = [];
    for (let i = 0; i < counts.length; i++) {
      this.total += counts[i] * values[i];
    }

    log(`total, ${this.total}`);
  }

  offer(offer) {
    this.log(`${this.rounds} rounds left`);
    this.rounds--;

    this.log(`offer, ${offer}`);
    this.log(`this.firstOffer, ${this.firstOffer}`);
    if (offer && offer.length && !this.firstOffer.length) {
      this.firstOffer = offer;
    }

    if (offer && offer.length) {
      this.lastOffer = offer;
    }

    if (this.me) {
      this.log('### ULTIMATUM ###');
      return ultimatum(this.log, offer, this.firstOffer, this.lastOffer, this.total, this.rounds, this.counts, this.values);
    }

    return something(this.log, offer, this.firstOffer, this.lastOffer, this.total, this.rounds, this.counts, this.values);
  }
};

// while true; do node haggle.js --id=andrewchuhlomin@gmail.com:fzgk123 -l log.json /home/epodiachev/Projects/negotiation-bot/src/index.js wss://hola.org/challenges/haggling/arena/standard; done