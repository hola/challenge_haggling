'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.counts = counts
    this.values = values
    this.rounds = maxRounds
    this.log = log
    this.total = 0
    for (let i = 0; i < counts.length; i++) {
      this.total += counts[i] * values[i]
    }
    this.importance = new Array(counts.length)
    for (let i = 0; i < counts.length; i++) {
      this.importance[i] = 0
    }
    this.totalImportance = 0
    this.offers = 0
    this.firstOffer = null
    this.secondOffer = null
    this.thirdOffer = null
    this.maxDifference = 10000

    this.valuations = []
    this.initValuations(new Array(counts.length), 0, 0)
    this.probableValuations = this.valuations.slice()
    log('My values: ' + JSON.stringify(values) + ', total = ' + this.total)
    log('Possible valuations: ' + JSON.stringify(this.valuations))
  }

  isDynamicOpponent() {
    if (!this.firstOffer || !this.secondOffer) {
      return false
    }

    let dyn = false
    for (let i = 0; i < this.firstOffer.length; i++) {
      if (this.firstOffer[i] != this.secondOffer[i]) {
        dyn = true
      }
    }
    return dyn
  }

  isChaoticOpponent() {
    if (!this.firstOffer || !this.secondOffer) {
      return false
    }

    let chaotic = false
    for (let i = 0; i < this.firstOffer.length; i++) {
      if (this.thirdOffer) {
        let dir1 = this.firstOffer[i] - this.secondOffer[i]
        let dir2 = this.secondOffer[i] - this.thirdOffer[i]
        if ((dir1 < 0 && dir2 > 0) || (dir1 > 0 && dir2 < 0)) { // Opponent keeps changing mind
          chaotic = true
        }
      } else {
        if (this.firstOffer[i] > this.secondOffer[i]) { // Opponent by some reason became greedier
          chaotic = true
        }
      }
    }
    return chaotic
  }

  initValuations(values, i, totalValue){
    let count = this.counts[i]
    let max = (this.total - totalValue) / count | 0
    if (i == this.counts.length - 1) {
      if (totalValue + max * count == this.total) {
        values[i] = max
        this.valuations.push(Array.from(values))
      }
      return
    }
    for (let j = 0; j <= max; j++) {
      values[i] = j
      this.initValuations(values, i + 1, totalValue + j * count)
    }
  }

  offer(o) {
    let sums
    this.rounds-- // Now rounds is between 4..0 inclusive
    if (o) {
      this.storeOffer(o)
      this.probableValuations = this.getProbableValuations()

      sums = this.evaluateOffer(o)

      this.log('Predicted sums: ' + sums[0] + ', ' + sums[1] + ', ' + sums[2])
    }
    this.log('All probable valuations: ' + JSON.stringify(this.probableValuations))
    this.log('Importance: ' + JSON.stringify(this.importance))
    this.log('Is opponent dynamic? ' + (this.isDynamicOpponent() ? 'YES' : 'NO'))
    //this.log('Best/worst for k=1: ' + JSON.stringify(this.getBestWorstOffer(1)))
    //this.log('Best/worst for k=0.75: ' + JSON.stringify(this.getBestWorstOffer(0.75)))
    //this.log('Best/worst for k=0.5: ' + JSON.stringify(this.getBestWorstOffer(0.5)))
    //this.log('Best/worst for k=0.25: ' + JSON.stringify(this.getBestWorstOffer(0.25)))
    //this.log('Best/worst for k=0: ' + JSON.stringify(this.getBestWorstOffer(0)))
    ///this.log('Best/worst for k=-0.25: ' + JSON.stringify(this.getBestWorstOffer(-0.25)))
    //this.log('Best/worst for k=-0.5: ' + JSON.stringify(this.getBestWorstOffer(-0.5)))
    //this.log('Best/worst for k=-0.75: ' + JSON.stringify(this.getBestWorstOffer(-0.75)))
    //this.log('Best/worst for k=-1: ' + JSON.stringify(this.getBestWorstOffer(-1)))

    if (this.rounds >= 4) { // First two rounds
      return this.absoluteGreed(o, sums)
    } else
    if (this.rounds == 0) { // The very last round
      return this.lastChance(o, sums)
    } else {
      return this.normalStrategy(o, sums)
    }
  }

  storeOffer(o) { // Perform some analysis
    this.offers++
    if (!this.firstOffer) {
      this.firstOffer = o
    } else
    if (!this.secondOffer) {
      this.secondOffer = o
    } else
    if (!this.thirdOffer) {
      this.thirdOffer = o
    }

    for (let i = 0; i < o.length; i++) {
      // Normalize (0 - no importance at all, 1 - maximum importance)
      this.importance[i] += (this.counts[i] - o[i]) / this.counts[i] 
      this.totalImportance += (this.counts[i] - o[i]) / this.counts[i] 
    }
    // After N offers: 0 - no importance (never asked), N - asked every time (at full amount) 

  }

  getExpectedSum(values) {
    let prob = 0
    let max = 0
    for (let i = 0; i < values.length; i++) {
      max = Math.max(max, values[i])
    }
    for (let i = 0; i < values.length; i++) {
      prob += Math.abs(values[i] / max - (this.totalImportance > 0 ? this.importance[i] / this.totalImportance : 0))
      if ((this.importance[i] > 0) == (values[i] > 0)) {
        prob--
      }
    }
    return prob
  }

  getExpectedSum2(values) {
    let prob = 0
    let max = 0
    for (let i = 0; i < values.length; i++) {
      max = Math.max(max, values[i])
    }
    for (let i = 0; i < values.length; i++) {
      if ((this.importance[i] > 0) == (values[i] > 0)) {
        prob--
      }
    }
    return prob
  }

  getProbableValuations() {
    this.valuations.sort((a, b) => {
      return this.getExpectedSum2(a) - this.getExpectedSum2(b)
    })

    let probable = [this.valuations[0]]
    for (let i = 1; i < this.valuations.length; i++) {
      if (this.getExpectedSum2(this.valuations[i]) == this.getExpectedSum2(probable[0])) {
        probable.push(this.valuations[i])
      } else {
        break
      }
    }
    return probable
  }



  getAllPossibleOffers(offer, i, offers) {
    if (!offer) {
      return this.getAllPossibleOffers(new Array(this.counts.length), 0, [])
    }

    if (i == this.counts.length) {
      // Evaluate offer
      let sums = [offer.slice(), 0, 0]
      for (let j = 0; j < this.counts.length; j++) {
        sums[1] += offer[j] * this.values[j] 
      }

      for (let j = 0; j < this.probableValuations.length; j++) {
        for (let k = 0; k < this.counts.length; k++) {
          sums[2] += (this.counts[k] - offer[k]) * this.probableValuations[j][k] / this.probableValuations.length
        }
      }
      //this.log('Possible offer: ' + JSON.stringify(sums))
      offers.push(sums)
      return offers
    }

    let bestWorst = null
    for (let j = 0; j <= this.counts[i]; j++) {
      offer[i] = j
      this.getAllPossibleOffers(offer, i + 1, offers)
      /*
      if (sums) {
        let isAcceptable = true//sums[1] * (1 - k) <= sums[2] * k
        if (isAcceptable) {
          if (bestWorst === null) {
            bestWorst = sums
          } else
          
          if (bestWorst[1] * (k + 1) - bestWorst[2] * k < sums[1] * (k + 1) - sums[2] * k) {
            bestWorst = sums
          }
          
          //if (bestWorst[1] < sums[1]) {
          //  bestWorst = sums
          //}
        }
      }
      */
    }
    return offers
  }

  getBestWorstOffer(ourMin) {
    let possibleOffers = this.getAllPossibleOffers()
    possibleOffers.sort((a, b) => {
      //return (a[1] == b[1]) ? (a[2] - b[2]) : (b[1] - a[1])
      return (b[1] - a[1]) + (a[2] - b[2])
    })
    let nonEmpty = []
    for (let i = 0; i < possibleOffers.length; i++) {
      if (possibleOffers[i][1] > ourMin && possibleOffers[i][1] - possibleOffers[i][2] < this.maxDifference) {
        nonEmpty.push(possibleOffers[i])
      }
    }
    this.log('Non-empty offers: ' + JSON.stringify(nonEmpty))
    if (!nonEmpty.length) {
      return possibleOffers[0]
    }
    this.maxDifference = Math.max(nonEmpty[0][1] - nonEmpty[0][2], 0) * 0.9
    this.log('Max diff now is = ' + this.maxDifference)
    return nonEmpty[0]
  }

  evaluateOffer(o) {
    this.valuations.sort((a, b) => {
      return this.getExpectedSum(a) - this.getExpectedSum(b)
    })

    this.log('Expected values: ' + JSON.stringify(this.valuations[0]) + ', expected sum: ' + this.getExpectedSum(this.valuations[0]))

    let sums = [0, 0, 0]
    for (let i = 0; i < o.length; i++) {
      sums[0] += o[i] * this.values[i]
      sums[1] += (this.counts[i] - o[i]) * this.valuations[0][i]
      for (let j = 0; j < this.probableValuations.length; j++) {
        sums[2] += (this.counts[i] - o[i]) * this.probableValuations[j][i] / this.probableValuations.length;
      }
    }
    return sums
  }

  absoluteGreed(o, sums) {
    if (o) {
      if (sums[0] == this.total) {
        return
      }
    }
    o = this.counts.slice() // Ask for maximum
    return o
  }

  normalStrategy(o, sums) { // this.round = 1..2
    if (o) {
      if (sums[0] > sums[2]) { // We want at least what our opponent is expecting
        return
      }
    }
    let offer = this.getBestWorstOffer(0)
    //this.log('Chose offer for k = ' + k + ': ' + JSON.stringify(offer))
    return offer[0]
  }

  lastChance(o, sums) {
    if (o) {
      if (sums[0] > sums[2] * 0.66) { // We want at least 66% of what our opponent is expecting
        return
      }
    }
    let k = 0.0
    let offer = this.getBestWorstOffer(0)
    //this.log('Chose offer for k = ' + k + ': ' + JSON.stringify(offer))
    return offer[0]
  }
}