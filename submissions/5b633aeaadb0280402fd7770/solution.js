"use strict" /*jslint node:true*/;

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++) {
      this.total += counts[i] * values[i];
    }
    this.combinations = filterCombinations(
      combinations(counts, values),
      values,
      this.total * 0.6
    );
    this.pointer = 0;
  }
  offer(o) {
    this.rounds--;
    if (o && !nothing(o)) {
      const inTop = this.combinations
        .slice(0, 3)
        .map(o => JSON.stringify(o))
        .includes(JSON.stringify(o));

      if (inTop) {
        return;
      }
    }
    if (!this.combinations[this.pointer]) {
      console.log(["comb", this.pointer, this.combinations]);
      this.pointer = 0;
    }

    o = this.combinations[this.pointer];
    console.log(this.combinations);
    this.pointer++;
    return o;
  }
};

//
function combinations(counts = [], values = []) {
  let combinations = [];
  const totalRows = counts.reduce(function(prev, val) {
    return prev * (val + 1);
  }, 1);
  const totalCols = counts.length;

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      for (let i = 0; i < counts[col]; i++) {
        if (!combinations[row]) {
          combinations[row] = [];
        }
        combinations[row][col] = row % (counts[col] + 1);
      }
    }
  }
  const sorted = combinations.sort((a, b) => {
      const prices = (val, index) => values[index] * val;
      return b.map(prices).reduce(sum, 0) - a.map(prices).reduce(sum, 0);
    }),
    sortedForSearch = sorted.map(s => JSON.stringify(s));
  return sorted.filter(
    (item, pos) => sortedForSearch.indexOf(JSON.stringify(item)) == pos
  );
}

function filterCombinations(combinations, values, limit) {
  const rowSum = row =>
    row.reduce(function(acc, item, index) {
      return acc + item * values[index];
    }, 0);
  return combinations.filter(r => rowSum(r) > limit);
}

function sum(a, b) {
  return a + b;
}

function nothing(o) {
  return o.reduce(sum, 0) === 0;
}
