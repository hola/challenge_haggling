'use strict';

const TOTAL = 4000;
const MAX_LEN = 1000;

function fill(count) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(i);
  }
  return list;
}

function fillA(count) {
  const list = [];
  for (let i = 0; i < count; i++) {
    if (list.length < MAX_LEN) {
      list.push(i);
    } else {
      const rand = (Math.random() * list.length) | 0;
      list[rand] = i;
    }
  }
  return list;
}

function fillB(count) {
  let list = [];
  let delta = 1;
  for (let i = 0; i < count; i += delta) {
    list.push(i);
    if (list.length < 2 * MAX_LEN) {
      continue;
    }

    const half = [];
    for (let i = 0; i < list.length; i += 2) {
      half.push(list[i]);
    }
    list = half;
    delta *= 2;
  }
  return list;
}

function stats(list) {
  let mean = 0;
  let stddev = 0;
  for (const elem of list) {
    mean += elem;
    stddev += Math.pow(elem, 2);
  }
  mean /= list.length;
  stddev /= list.length;
  stddev -= Math.pow(mean, 2);
  stddev = Math.sqrt(stddev);

  return { mean, stddev };
}

console.log('_: %j', stats(fill(TOTAL)));
console.log('A: %j', stats(fillA(TOTAL)));
console.log('B: %j', stats(fillB(TOTAL)));
