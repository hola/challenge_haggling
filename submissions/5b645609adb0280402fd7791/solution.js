'use strict'; /*jslint node:true*/

const OrderAscend = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const OrderDesend = (a,b) => a > b ? -1 : a < b ? 1 : 0;
const Sum = (a, c) => a + c

class Agent {

  constructor(me, counts, values, max_rounds, log){
    // this.player = me === 0 ? new FirstPlayer() : new SecondPlayer();
    // const ctor = me === 0 ? FirstPlayer : SecondPlayer;
    const ctor = Player
    // const strategy = new PercentageByHighestStrategy(counts, values, max_rounds, log)
    const strategy = new HalfItemsStrategy(counts, values, max_rounds, log)
    this.player = new ctor(strategy, log)
    this.rounds = max_rounds;
  }

  offer(o){
    this.player.log(`${this.rounds} rounds left`);
    this.rounds--;
    if (this.player._checkOffer(o, this.rounds)) {
      return; // accept
    }
    return this.player.strategy.counterOffer(this.rounds)
  }
}

class StrategyBase {

  constructor(counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.maxRounds = max_rounds
    this.log = (...args) => {
      const name = this.constructor.name
      log(`${name}: `, ...args)
    }
    this.highestValuesIndices = sortIndices(values, OrderDesend)
    this.totalValue = getTotal(counts, values)
    this.totalItemsCount = counts.reduce(Sum)
  }


  get lastOfferValue() {
    if (typeof this._lastOfferValue === 'undefined') {
      this._lastOfferValue = getTotal(this.counterOffer(1), this.values);
    }
    return this._lastOfferValue;
  }

  counterOffer(roundsLeft) {
  }

  checkOffer(offer, roundsLeft) {
    const value = getTotal(offer, this.values);
    return value >= this.lastOfferValue;
  }

}

// start offering 80% items, taking the highest first
// next offer less items, taking the highest first
class PercentageByHighestStrategy extends StrategyBase {
  
  constructor () {
    super(...arguments)
  }

  counterOffer(roundsLeft) {
    const currentRun = this.maxRounds - roundsLeft;
    let offer = this.values.slice().fill(0);
    const step = 80 / (this.maxRounds - 1);
    const roundAndLimit = val => limit(Math.round(val), 1, this.totalItemsCount - 1);
    const percent = (100 - step * currentRun) / 100;
    const itemsToOffer = roundAndLimit(this.totalItemsCount * percent);

    let expensiveType = 0;
    while (expensiveType < len && offer.reduce(Sum) < itemsToOffer) {
      const type = this.highestValuesIndices[expensiveType];
      if (offer[type] < this.counts[type]) {
        offer[type] ++;
      } else {
        expensiveType++;
      }
    }
    this.log(`on round ${currentRun} offering ${itemsToOffer} items: [`, ...offer, ']')

    return offer;
  }

}

// suggest half of items, starting with most expensive
// next take less expensive
class HalfItemsStrategy extends StrategyBase {

  constructor() {
    super(...arguments)
    this.halfItems = Math.round(this.totalItemsCount / 2)
  }

  counterOffer(roundsLeft) {
    const currentRun = this.maxRounds - roundsLeft;
    let offer = this.values.slice().fill(0);
    let reducers = offer.slice();
    const len = this.values.length;
    const step = 1 / (this.maxRounds - 1);
    // const stepType = currentRun / (this.maxRounds - 1);
    for (let i=0; i < len; i++) {
      reducers[i] = 1 - (Math.abs(1 + i - currentRun) * step)
    }

    let expensiveType = 0;
    while (expensiveType < len && offer.reduce(Sum) < this.halfItems) {
      const type = this.highestValuesIndices[expensiveType];
      if (offer[type] < this.counts[type] * reducers[expensiveType]) {
        offer[type] ++;
      } else {
        expensiveType++;
      }
    }

    this.log(`on round ${currentRun} offering ${offer.reduce(Sum)} items: [`, ...offer, ']')

    return offer;
  }

}

class Player {

  constructor(strategy, log) {
    this.log = (...args) => {
      const name = this.constructor.name
      log(`${name}: `, ...args)
    }
    this.strategy = strategy
  }

  _checkOffer(offer, roundsLeft) {
    if (typeof offer === 'undefined') {
      this.log(`got nothing...`)
      return false;
    }
    // greedy, allways accept last offer, otherwise, no money
    if (roundsLeft === 0) {
      this.log(`last round, let's get some money: ${getTotal(offer, this.strategy.values)}`)
      return true;
    }

    return this.strategy.checkOffer(offer, roundsLeft);
  }

}

function getTotal(counts, values) {
  let total = counts.reduce((a, c, i) => a + c * values[i])
  return total
}

function limit(val, min, max) {
  return (val > min) ? ((val < max) ? val : max) : min;
}

function sortIndices(toSort, compareFn) {
  let valuesWithIndices = toSort.map((c, i) => [c, i]);

  // sort by value
  const comp = compareFn || OrderAscend;
  valuesWithIndices.sort((left, right) => comp(left[0], right[0]));

  // return indices
  return valuesWithIndices.map(pair=>pair[1])
}

(function test() {
  let a = new Agent(0, [20,40,10,5,2], [1,4,2,3,2], 5, console.log)
  console.log(a.offer())
  console.log(a.offer([1,1,0,0,0]))
  console.log(a.offer([1,1,1,0,0]))
  console.log(a.offer([16,16,0,1,0]))
  console.log(a.offer([1,1,1,1,0]))
})()

module.exports = Agent