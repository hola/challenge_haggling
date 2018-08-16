'use strict';

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.amIfirst = !me;
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.maxRound = max_rounds;
    this.log = log;
    this.total = 0;
    for (let i = 0; i < counts.length; i++)
      this.total += counts[i] * values[i];

    this.combos = counts.reduce((initial, value, index) => {
      const newVal = Array(value).fill(index);
      return initial.concat(...newVal);
    }, []);

    this.powerSet = this.getPowerSet(this.combos);

    const uniqueArr = [];

    this.powerSet
      .filter(arr => arr.length)
      .map(arr => arr.join('-'))
      .forEach(entry => {
        if (!uniqueArr.includes(entry)) {
          uniqueArr.push(entry);
        }
      });

    this.powerSetAssessed = uniqueArr
      .map(entry => entry.split('-').map(value => +value))
      .map(set => {
        const setValue = set.reduce((initial, value) => {
          return initial + this.values[value];
        }, 0);

        return { set, setValue };
      })
      .sort((a, b) => b.setValue - a.setValue)
      .filter(set => set.setValue >= 7);

    this.powerSetGroups = this.groupArrayByParam(this.powerSetAssessed, 'setValue');
    this.variants = Object.keys(this.powerSetGroups);
  }

  offer(o) {
    this.rounds--;
    const currentRound = this.maxRound - this.rounds;

    if (o) {
      let sum = 0;
      for (let i = 0; i < o.length; i++) {
        sum += this.values[i] * o[i];
      }

      if (currentRound === 1 && sum >= 9) {
        return;
      } else if (currentRound === 2 && sum >= 8) {
        return;
      } else if (currentRound > 2 && sum >= 7) {
        return;
      }

    }

    if (currentRound > 2) {
      this.variants = this.variants.length > 1 ? this.variants.slice(0, -1) : this.variants;
    }

    const variantsToPickFrom = this.powerSetGroups[this.variants[this.variants.length - 1]];

    const pickedVariant = variantsToPickFrom[Math.floor(Math.random() * variantsToPickFrom.length)];

    let offer = Array(this.counts.length).fill(0);

    offer = offer.map((el, i) => {
      const setRestored = pickedVariant.set.filter(v => v === i);
      return setRestored.length;
    });

    return offer;
  }

  getPowerSet(array) {
    return array.reduce((set, item) => set.concat(
      set.map(arr => [...arr, item])
    ), [[]]);
  }

  groupArrayByParam(array, key) {
    return array.reduce((group, item) => {
      (group[item[key]] = group[item[key]] || []).push(item);
      return group;
    }, {});
  }

};
