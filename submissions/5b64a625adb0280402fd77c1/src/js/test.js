'use strict';

const Neural = require('./agents/neural');
const Estimator = require('./agents/estimator');

const counts = [ 1, 2, 1 ];

const n = new Neural(0, counts, [ 4, 1, 4 ], 5, () => {});
const e = new Estimator(0, counts, [ 2, 4, 0 ], 5, () => {});

function invert(offer) {
  const res = offer.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] = counts[i] - res[i];
  }
  return res;
}

let offer = undefined;
for (let i = 0; i < 5; i++) {
  console.log('> neural', offer);
  let counter = n.offer(offer);
  console.log('< neural', counter);

  if (counter === undefined) {
    console.log('neural accept');
    break;
  }

  offer = invert(counter);

  console.log('> estimator', offer);
  counter = e.offer(offer);
  console.log('< estimator', counter);

  if (counter === undefined) {
    console.log('estimator accept');
    break;
  }

  offer = invert(counter);
}
