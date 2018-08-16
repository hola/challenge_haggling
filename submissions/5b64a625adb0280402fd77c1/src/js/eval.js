'use strict';

const assert = require('assert');
const random = new (require('random-js'))();

const Generator = require('./generate').Generator;

const Neural = require('./agents/neural');

const Estimator = require('./agents/estimator');
const Accept = require('./agents/accept');
const HalfOrAll = require('./agents/half-or-all');
const Downsize = require('./agents/downsize');
const Random = require('./agents/random');

const ENABLE_LOG = false;
const TOTAL_MATCHES = 2000;

function log(msg) {
  if (ENABLE_LOG) {
    console.error(msg);
  }
}

class Arena {
  constructor(types, minObj, maxObj, total, maxRounds) {
    this.sets = new Generator(types, minObj, maxObj, total, maxRounds);
  }

  match(A, B) {
    const scene = this.sets.get(random);

    const a = new A('a', scene.counts, scene.valuations[0], scene.max_rounds,
        log);
    const b = new B('b', scene.counts, scene.valuations[1], scene.max_rounds,
        log);

    log('A values: ' + scene.valuations[0].join(','));
    log('B values: ' + scene.valuations[1].join(','));

    let offer = undefined;
    for (let i = 0; i < scene.max_rounds; i++) {
      let previous = offer;

      offer = a.offer(offer);
      if (offer === undefined) {
        assert.notStrictEqual(previous, undefined, 'Invalid first offer');
        log('A accepted');

        // Accept
        return this.result(scene, i, previous);
      }

      log('A wants: ' + offer.join(','));
      previous = offer;
      offer = b.offer(this.inverseOffer(scene, offer));
      if (offer === undefined) {
        log('B accepted');
        return this.result(scene, i, previous);
      }

      offer = this.inverseOffer(scene, offer);
      log('B gives: ' + offer.join(','));
    }
    log('No consensus');
    return { accepted: false, rounds: scene.max_rounds, a: 0, b: 0 };
  }

  offerValue(scene, player, offer) {
    let value = 0;
    for (let i = 0; i < scene.valuations[player].length; i++) {
      value += (scene.valuations[player][i] * offer[i]) | 0;
    }
    return value;
  }

  inverseOffer(scene, offer) {
    const res = offer.slice();
    for (let i = 0; i < scene.counts.length; i++) {
      res[i] = (scene.counts[i] - res[i]) | 0;
    }
    return res;
  }

  result(scene, rounds, offer) {
    const aOffer = offer;
    const bOffer = this.inverseOffer(scene, aOffer);

    const aValue = this.offerValue(scene, 0, aOffer);
    const bValue = this.offerValue(scene, 1, bOffer);

    log(`A gets: ${aValue} B gets: ${bValue}`);
    return {
      accepted: true,
      rounds,
      a: aValue,
      b: bValue,
    };
  }
}

const arena = new Arena(3, 1, 6, 10, 5);

const contestants = [];

function addContestant(name, A) {
  contestants.push({
    agent: A,
    name,

    rounds: 0,
    sessions: 0,
    agreements: 0,
    score: 0,
    scoreSqr: 0,
    delta: 0,
  });
}

addContestant('neural', Neural);

// addContestant('half-or-all', HalfOrAll);
addContestant('downsize', Downsize);
// addContestant('accept', Accept);
// addContestant('random', Random);
// addContestant('estimator', Estimator);

const pairs = [];
for (const a of contestants) {
  for (const b of contestants) {
    if (a !== b) {
      pairs.push({ a, b });
    }
  }
}

for (let i = 0; i < TOTAL_MATCHES; i++) {
  for (const pair of pairs) {
    log('--------');
    log('A: ' + pair.a.name + ' vs B: ' + pair.b.name);
    const ab = arena.match(pair.a.agent, pair.b.agent);
    if (ab.accepted) {
      const delta = ab.a - ab.b;

      pair.a.delta += delta;
      pair.b.delta -= delta;
      pair.a.agreements++;
      pair.b.agreements++;
      pair.a.rounds += ab.rounds;
      pair.b.rounds += ab.rounds;
    }

    pair.a.sessions++;
    pair.b.sessions++;
    pair.a.score += ab.a;
    pair.b.score += ab.b;
    pair.a.scoreSqr += ab.a ** 2;
    pair.b.scoreSqr += ab.b ** 2;
  }
}

console.log(contestants.map((c) => {
  const mean = c.score / c.sessions;
  const stddev = Math.sqrt((c.scoreSqr / c.sessions) - mean ** 2) / mean;
  return {
    name: c.name,
    rounds: (c.rounds / c.agreements).toFixed(4),
    mean: mean.toFixed(4),
    stddev: stddev.toFixed(4),
    meanAccepted: (c.score / c.agreements).toFixed(4),
    meanDelta: (c.delta / c.agreements).toFixed(4),
    acceptance: (c.agreements / c.sessions).toFixed(4),
  };
}));
