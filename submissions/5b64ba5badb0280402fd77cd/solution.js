'use strict';

/*jslint node:true*/

class Agent {

  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.maxRounds = max_rounds;
    this.round = max_rounds;
    this.log = log;
    this.log(`I am Batman`);
    this.total = 0;
    this.types = this.counts.length;
    this.total = this.counts.reduce((acc, current, idx) => acc + current * values[idx], 0);
    this.config = {
      commonWealthAcceptableFactor: 0.5,
      jokerAcceptableRatio: 0.6,
      notReasonableJokerThreshold: 0.5,
      acceptableThresholdForLastPlay: 0.35,
      dynamicAcceptableValue: 0.0,
      winwinProbThreshold: 0.2,
      greedy: 2,
      tooLowPenaltyFactor: 0,
      zeroValuePenaltyFactor: 0.2,
      freier: true,
      batmanValueFactor: 2.5,
      maxminAcceptableValue: 0,
      useMaxmin: true,
      neverGiveSameOfferTwice: false,
      jokerAcceptProb: {
        4: {0: 0.00, 1: 0.02, 2: 0.05, 3: 0.05, 4: 0.20, 5: 0.30, 6: 0.40, 7: 0.70, 8: 0.90, 9: 0.97, 10: 1.00},
        3: {0: 0.00, 1: 0.02, 2: 0.05, 3: 0.05, 4: 0.20, 5: 0.30, 6: 0.40, 7: 0.70, 8: 0.90, 9: 0.97, 10: 1.00},
        2: {0: 0.00, 1: 0.02, 2: 0.05, 3: 0.05, 4: 0.20, 5: 0.30, 6: 0.40, 7: 0.70, 8: 0.90, 9: 0.97, 10: 1.00},
        1: {0: 0.00, 1: 0.02, 2: 0.05, 3: 0.05, 4: 0.20, 5: 0.30, 6: 0.40, 7: 0.70, 8: 0.90, 9: 0.97, 10: 1.00},
        0: {0: 0.00, 1: 0.02, 2: 0.05, 3: 0.05, 4: 0.20, 5: 0.30, 6: 0.40, 7: 0.70, 8: 0.90, 9: 0.97, 10: 1.00},
      }
    };
    this.allPossibleOffers = this.buildAllOffers(this.counts);
    // remove all offers that keeps 0 value to myself
    // .filter(({offer}) => !offer.some((itemCount, i) => this.values[i] === 0 && itemCount > 0))
    //remove the offer that keeps everything to myself
    // .filter(({offer}) => !offer.every((item, i) => item === this.counts[i]));
    //[{offer: [1,2,3], batmanValue: 12}]

    this.joker = {
      history: {offers: [/*{offer: [1,2,3], batmanValue: 12}*/]},
      allPossibleValues: this.buildAllPossibleValues([], this.total, 0, this.types)
      //[{values: [1,2,3], aggregatedValueToJoker: 0, prob: 1.0, tooLowOfferPenalty: 0, zeroValuePenalty: 0, probFactor: 1, maxmin: 0}]
    };
    this.log(`initialized  joke ${Array.isArray(this.joker.history.offers)}`);
    this.batman = {
      history: {offers: [/*{offer: [1,2,3], batmanValue: 12}*/]}
    };
    this.updateMaxMin();
    this.updateProbabilities({init: true});
    this.commonWealth = this.calcCommonWealth();
    this.updateAcceptable();
    this.log(`session counts@${JSON.stringify(this.counts)}@`);
    this.log(`batman config:@${JSON.stringify(this.config)}@`);
    this.log(`** total is ${this.total}`);
    this.log(`my secret values @${JSON.stringify(this.values)}@`);
    this.log(`who starts ? me @${this.me}@`);
    this.noOfferFound = {};
    this.counterOfferRoot = {}
  }


  offer(o) {
    this.log('offer');
    const startTime = Date.now();
    this.counterOfferRoot = {};
    this.round--;
    // if (!o && this.me===1) {
    //   this.log(`o = ${o} and me = ${this.me} how can it be ???`);
    //   this.me=0;
    // }
    if (o) {
      this.log(`round left @${this.round}@ withOffer @${o ? JSON.stringify(o) : ""} @ that worth @ ${o ? this.calcValue(o, this.values) : ""} @`);
    }
    const counterOffer = this.doOffer(o);
    if (!counterOffer) {
      this.log(`accepting joker offer @ ${JSON.stringify(o)} @ worth @ ${this.calcValue(o, this.values)} @`)
    } else {
      // about to return counterOffer
      this.log(`giving counter offer@ ${JSON.stringify(counterOffer)}@ worth @${this.calcValue(counterOffer, this.values)}@`);
      //find the instance in all possible offers for better lookup in history
      //later
      const offer = this.allPossibleOffers.find(({offer}) => offer.toString() === counterOffer.toString());
      this.log(`offer ${JSON.stringify(offer)} into history ${JSON.stringify(this.batman.history.offers)}`);
      this.batman.history.offers.push(offer);
    }
    const endTime = Date.now();
    this.log(`@counterOfferRoot@${this.counterOfferRoot}@`);
    this.log(`@@ time: ${endTime - startTime} ms`);
    return counterOffer;
  }

  doOffer(o) {
    let counterOffer;
    this.log(`@allPossibleOffers@${JSON.stringify(this.allPossibleOffers)}@`);
    if (this.round === this.maxRounds - 1 && this.me === 0) {
      this.log("this is the 1st offer ever. doing my best. wish me luck");
      counterOffer = this.buildFirstOffer();
      this.log(`first offer is ${counterOffer}`);
    }
    else {
      this.log(`before handleJoker`);
      counterOffer = this.handleJokerOffer(o);
    }
    if (!counterOffer && this.joker.history.offers.length) {
      this.log("safetyNet before accepting");
      counterOffer = this.safetyNet(o);
    }
    if (!counterOffer) {
      return;
    }
    //we have a concrete counterOffer
    if (this.joker.history.offers.length) {
      this.log("safetyNet before offering");
      const betterOffer = this.safetyNet(counterOffer);
      if (betterOffer) {
        this.counterOfferRoot = "SAFTYNET_BETTEROFFER";
      }
      counterOffer = betterOffer || counterOffer;
    }
    return counterOffer;
  }

  getOfferWithMinValueFromJokerHistory() {
    const minValue = this.joker.history.offers.reduce((acc, v) => {
      if (v.batmanValue < acc.minValue) {
        return {offer: v.offer, minValue: v.batmanValue}
      }
      return acc;
    }, {minValue: Number.POSITIVE_INFINITY});
    if (minValue.offer) {
      return minValue.offer;
    }

  }

  buildFirstOffer() {
    this.log(`buildFirstOffer`);
    if (this.values.some((v) => v === 0)) { //check if we have some zeros to give to joker
      this.log(`hey - there are zeros, lets give them all`);
      this.counterOfferRoot = "FO_ZEROS";
      return this.counts.map((c, i) => this.values[i] === 0 ? 0 : c)
    }
    this.log(`looking for an offer that has as many as joker's values that yield more than ${this.config.jokerAcceptableRatio} `);

    const offers = this.getAcceptableOffers().map((acceptableOffer) => {
      // {offer: [1,2,3], batmanValue: 12}
      return {
        numOfHighEnoughJokerValues: this.joker.allPossibleValues.filter((po) => {
          return this.calcValue(this.invertOffer(acceptableOffer.offer), po.values) >= Math.floor(this.config.jokerAcceptableRatio * this.total);
        }).length,
        acceptableOffer: acceptableOffer
      }
      // {values: [1,2,3], aggregatedValueToJoker: 0, prob: 1.0, tooLowOfferPenalty: 0, zeroValuePenalty: 0}
    });

    offers.sort((a, b) => {
      return b.numOfHighEnoughJokerValues - a.numOfHighEnoughJokerValues
    });
    this.log(`offers ${JSON.stringify(offers)}`);

    if (offers.length > 0) {
      this.log('firstOffer:meaningfulOffer');
      this.log(`will give the offer ${offers[0].acceptableOffer.offer} as it has a rank of ${offers[0].numOfHighEnoughJokerValues}`);
      this.counterOfferRoot = "FO_JOKER_LIKELY_TO_ACCPT";
      return offers[0].acceptableOffer.offer;
    }
  }

  doBuildAllOffers(candidate, index) {
    let allRes = [];
    if (index >= candidate.length) {
      // end condition - update new offer
      // this.log(`@@ offer ${JSON.stringify(candidate)}`);
      return [{
        offer: candidate.slice(),
        batmanValue: this.calcValue(candidate, this.values),
        offerable: true
      }];
    }
    // recurse onward while advancing current counter
    for (; candidate[index] <= this.counts[index]; candidate[index]++) {
      let r = this.doBuildAllOffers(candidate, index + 1);
      allRes = allRes.concat(r);
    }
    // retreating while cleaning state
    candidate[index] = 0;
    return allRes;
  }


  buildAllOffers(counts) {
    this.log("buildAllOffers");
    let allOffers = this.doBuildAllOffers(new Array(counts.length).fill(0), 0);

    allOffers.forEach((po) => {

      // remove all offers that keeps 0 value to myself
      if (po.offer.some((itemCount, i) => this.values[i] === 0 && itemCount > 0)) {
        po.offerable = false;
      }
      //remove the offer that keeps everything to myself
      if (po.offer.every((item, i) => item === this.counts[i])) {
        po.offerable = false;
      }
    });


    return allOffers.sort((a, b) => (b.batmanValue - a.batmanValue));
  }


// joker

  buildAllPossibleValues(candidate, totalLeft, typeStart, typeEnd) {
    const doBuild = () => {
      let res = [];
      if (totalLeft < 0) return [];
      if ((typeStart === typeEnd) && (totalLeft === 0)) {
        return [{
          values: candidate,
          aggregatedValueToJoker: 0,
          prob: 1.0,
          tooLowOfferPenalty: 0,
          zeroValuePenalty: 0,
          probFactor: 1,
          maxmin: 0
        }];
      }
      if (typeStart === typeEnd) {
        return [];
      }

      for (let i = 0; i <= this.total; i++) {
        let r = this.buildAllPossibleValues(candidate.concat([i]), totalLeft - i * this.counts[typeStart], typeStart + 1, typeEnd);
        res = res.concat(r)
      }
      return res;
    };

    const res = doBuild();
    res.forEach((r) => r.prob = 1.0 / res.length); //normalize prob
    return res;
  }

  handleJokerOffer(jokerOffer) {
    this.log('handle joker offer');
    this.updateJoker(jokerOffer);
    this.commonWealth = this.calcCommonWealth();
    this.updateAcceptable();


    const allPossibleOffersWithExpectedJokerValue = this.allPossibleOffers.map((po) => {
      const offerEff = this.joker.allPossibleValues.reduce((acc1, pv) => {
        return acc1 + pv.prob * this.calcValue(this.invertOffer(po.offer), pv.values)
      }, 0);
      return {offer: po.offer, batmanValue: po.batmanValue, expectedJokerValue: offerEff.toPrecision(3)}
    }).sort((a, b) => {
      return b.expectedJokerValue - a.expectedJokerValue;
    });

    this.log(`allPossibleOffersWithExpectedJokerValue: ${JSON.stringify(allPossibleOffersWithExpectedJokerValue)}`);


    if (this.round === 0 && this.me === 1) {
      return this.handleTakeItOrLeaveItByJoker(jokerOffer);
    }

    if (this.round === 1 && this.me === 1) {
      return this.handleThisisOurLastEffectiveOffer(jokerOffer);
    }
    if (this.round === 0 && this.me === 0) {
      return this.createTakeItOrLeaveItOffer(jokerOffer);
    }

    let counterOffer = this.buildCounterOffer({jokerOffer, offerGenerator: this.getAcceptableOffers.bind(this, true)});
    if (counterOffer !== this.noOfferFound) {
      this.counterOfferRoot = `${this.counterOfferRoot}_NO_HISTORY`;
      return counterOffer;
    }
    this.log(`couldn't find counter offer @excluding history@ trying with history`);
    // no acceptable offer was found excluding history fallback to return
    counterOffer = this.buildCounterOffer({jokerOffer, offerGenerator: this.getAcceptableOffers.bind(this, false)});
    if (counterOffer !== this.noOfferFound) {
      this.counterOfferRoot = `${this.counterOfferRoot}_WITH_HISTORY`;
    }
    return counterOffer;

  }

  buildCounterOffer({jokerOffer, offerGenerator}) {
    this.log('build c o');
    const batmanValue = this.calcValue(jokerOffer, this.values); // A
    const winwinCounterOffer = this.getBestWinWinCounterOffer(jokerOffer, batmanValue, offerGenerator);
    if (winwinCounterOffer) { //4a -- we have a wiwin
      this.counterOfferRoot = "CO_WINWIN";
      return winwinCounterOffer;
    }
    // 5
    if (this.isInBoundAcceptableValue(this.calcValue(jokerOffer, this.values))) {
      this.counterOfferRoot = "ACCEPTING";
      return; // return undefined for accepting the offer
    }

    const coBasedOnJoker = this.buildCounterOfferByJokerPsych(jokerOffer, this.acceptableValue({}));
    if (coBasedOnJoker) {
      return coBasedOnJoker;
    }
    return this.noOfferFound;
  }

  getAcceptableOffers(excludeHistory = false) {
    let offers = this.allPossibleOffers
      .filter((po) => this.isOutBoundAcceptableValue(po.batmanValue))
      .filter((po) => po.offerable)
      .filter((po) => !(excludeHistory && this.batman.history.offers.includes(po)))

      // exclude items that are subset of perviously offered items
      .filter(po => !this.batman.history.offers.find(this.subsetOf.bind(this, po)));

    if (!excludeHistory) {
      offers = offers.concat(this.batman.history.offers);
      offers = Array.from(new Set(offers));
    }

    return offers;
    //### 3. never keep an item of value 0 to us
  }

  // current [1,2,0] history [1,1,0]
  //return true if current offer is a subset of history offer 
  subsetOf({offer: currentOffer}, {offer: historyOffer}) {
    const diffs = currentOffer.map((currentItem, i) => currentItem - historyOffer[i]);
    return diffs.some(item => item > 0) && diffs.every(item => item >= 0);
  }

  getBestWinWinCounterOffer(jokerOffer, batmanValue, offerGenerator) {
    /*
    bestOffer = null, bestProb = 0
  Foreach offer x we can make whose value for us >max(A, acceptable):
  Prob =0
  Foreach potential value array v of Joker:
  If v*x > v*currentOffer: prob += v.prob
  // note that the above assumes the versions of x and currentOffer adjusted to Joker’s Point of View
  Maybe we want to weigh the probability to get some expected gain, e.g. prob *= value(x), or prob*=max(1+value(x)-v*x,1)
  If prob>bestProb: bestOffer=x, bestProb=prob
  *
     */
    const _o = this.invertOffer(jokerOffer);

    const acceptableBetterOffers = offerGenerator()
      .filter((po) => po.batmanValue > batmanValue);

    const offer = acceptableBetterOffers.reduce((acc, x) => {
      const probX = this.joker.allPossibleValues
        .filter((pv) => this.calcValue(this.invertOffer(x.offer), pv.values) >= this.calcValue(_o, pv.values))
        .reduce((acc, pv) => acc + pv.prob, 0);
      if ((probX > 0) && (probX > acc.prob)) {
        return {prob: probX, offer: x.offer}
      }
      return acc;
    }, {prob: -1});

    if (offer.prob > 0) { // found something
      this.log(`we found a potential win win offer ${JSON.stringify(offer)}`);
      if (this.winWinProbHighEnough(offer.prob)) {
        this.log(`the winwin offer looks good`);
        this.counterOfferRoot = "WINWIN";
        return offer.offer;
      }
      else {
        this.log(`couldn't find a good enough win win offer`);
        return;
      }
    }
    this.log("couldn't find a win win");
    // return;
  }

  updateJoker(o) {
    const batmanValue = this.calcValue(o, this.values);
    this.updateJokerHistory(o, batmanValue);
    const _o = this.invertOffer(o);

    this.joker.allPossibleValues.forEach(function (possibleValue) {
      possibleValue.aggregatedValueToJoker += this.calcValue(_o, possibleValue.values)
    }, this);

    this.penalise(_o);
    this.updateProbabilities({init: false});

    this.joker.allPossibleValues.sort((a, b) => b.prob - a.prob);

    this.log(`dumping allPossibleValues`);
    this.joker.allPossibleValues.forEach((pv) => {
      this.log(`apv@ val@ ${JSON.stringify(pv.values)}@ prob@${pv.prob.toFixed(3)}@ aggValue@ ${pv.aggregatedValueToJoker}@probFactor@${pv.probFactor}@`)
    })
  }

  penalise(_o) {
    this.updateTooLowOfferPenalty(_o);
    this.updateZeroValuePenalty(_o);
    this.killValuesWhereHeKeepsLArgerCountAndHasZero(_o);
    // if this is Joker's last offer don't put zero probFactor
    if (this.round === 0 && this.me === 0) {
      this.log(`this is joker's last offer we don't want to put ZERO in probFactor, as we assume he might give a low offer`);
      return;
    }
    this.updateProbFactor(_o);
  }

  killValuesWhereHeKeepsLArgerCountAndHasZero(_o) {
    if (this.batman.history.offers.length) {
      const whatWeLeftToJoker = this.invertOffer(this.batman.history.offers[this.batman.history.offers.length - 1].offer);

      _o.forEach((c, i) => {
        if (c > whatWeLeftToJoker[i]) {
          this.joker.allPossibleValues.filter((pv) => pv.values[i] === 0)
            .forEach((p) => p.probFactor = 0)
        }
      });
    }
  }

  updateZeroValuePenalty(_o) {
    this.joker.allPossibleValues.forEach(function (possibleValue) {
      possibleValue.zeroValuePenalty += _o.reduce((acc, v, idx) => {
        if (v > 0 && possibleValue.values[idx] === 0) {
          return acc + v;
        }
        return acc;
      }, 0)
    }, this);


  }

  updateProbFactor(_o) {
    this.joker.allPossibleValues.forEach(function (possibleValue) {
      let jokersValueToCurrentOffer = this.calcValue(_o, possibleValue.values);
      if (this.isJokerUnReasonableLow(jokersValueToCurrentOffer)) {
        possibleValue.probFactor = 0;
      }
    }, this);

  }

  isJokerUnReasonableLow(jokersValue) {
    // if (this.round === 0 || this.round === 1) {
    return jokersValue < parseInt(this.config.notReasonableJokerThreshold * this.total) + 1;
    // }
    // return jokersValue < parseInt(this.config.notReasonableJokerThreshold * this.total);
  }


  updateTooLowOfferPenalty(_o) {
    if (this.batman.history.offers.length) {
      const batmanLastOffer = this.batman.history.offers[this.batman.history.offers.length - 1].offer;
      this.joker.allPossibleValues.forEach(function (possibleValue) {
        let jokersValueToCurrentOffer = this.calcValue(_o, possibleValue.values);
        let jokersValueToLastBatmanOffer = this.calcValue(this.invertOffer(batmanLastOffer), possibleValue.values);

        if (jokersValueToCurrentOffer < jokersValueToLastBatmanOffer) {
          possibleValue.tooLowOfferPenalty += jokersValueToLastBatmanOffer - jokersValueToCurrentOffer;
        }
      }, this);
    }
  }

  updateProbabilities({init}) {
    // The probability of each potential values array is directly proportional to the product of:
    // 1. Its aggregated score, to the power of the greedy parameter
    // 2. The penalty fraction, raised by the number of penalties the potential values accumulated

    const {greedy, tooLowPenaltyFactor, zeroValuePenaltyFactor} = this.config;
    // first, sum the greedy-power of all scores while assessing penalties
    this.log("updateProbabilities");
    let probFunction = (possibleValue) => {
      if (init) {
        return possibleValue.probFactor /* * Math.pow(possibleValue.aggregatedValueToJoker, greedy)*/ * Math.pow(tooLowPenaltyFactor, possibleValue.tooLowOfferPenalty) * Math.pow(zeroValuePenaltyFactor, possibleValue.zeroValuePenalty);
      } else {
        return possibleValue.probFactor * Math.pow(possibleValue.aggregatedValueToJoker, greedy) * Math.pow(tooLowPenaltyFactor, possibleValue.tooLowOfferPenalty) * Math.pow(zeroValuePenaltyFactor, possibleValue.zeroValuePenalty);
      }
    };

    let sumGreedyScores = this.joker.allPossibleValues.reduce((acc, possibleValue) => acc + probFunction(possibleValue), 0.0);

    // avoid division by zero, e.g. before receiving any offer from the adversary
    if (this.isAlmostZero(sumGreedyScores)) {
      this.log("@@@ we killed all possible values");
      const normalDistVal = 1.0 / this.joker.allPossibleValues.length;
      this.joker.allPossibleValues.forEach((pv) => pv.prob = normalDistVal);
    }
    else {
      this.joker.allPossibleValues.forEach((pv) => pv.prob = probFunction(pv) / sumGreedyScores);
    }
  }

  // typeCounts - number of elements of each type available to haggle over
  // sortedBatmanOffers: all offers Batman can make, sorted from best (for Batman) to worse
  updateMaxMin() {
    this.joker.allPossibleValues.forEach((pv) => {
      // compute each value to Joker, keep the lower of the two
      pv.maxmin = this.allPossibleOffers.reduce((acc, po) => {
        const batmanOffer = po.offer; // the elements batman keeps
        const batmanValue = po.batmanValue; // the value for batman
        // compute Joker's value for this batman offer (remember to reverse item counts)
        const jokerValue = this.calcValue(this.invertOffer(batmanOffer), pv.values);
        // compute the value that the loser receives from this Batman offer
        const minValue = Math.min(jokerValue, batmanValue);
        // see if exceeds the highest minimum so far; if so, keep it
        return Math.max(acc, minValue);
      }, 0);
    })
  }


  calcCommonWealth() {
    return this.joker.allPossibleValues.reduce((acc, pv) => {
      const money = pv.values.reduce((acc, v, indx) => {
        return acc + this.counts[indx] * Math.max(v, this.values[indx])
      }, 0);
      return acc + pv.prob * money;
    }, 0)
  }

  calcDynamicAcceptableValue() {
    return this.commonWealth * this.config.commonWealthAcceptableFactor;
  }

  updateJokerHistory(jokerOffer, batmanValue) {
    this.joker.history.offers.push({
      offer: jokerOffer,
      batmanValue
    });
  }

  //utils

  calcValue(o, values) {
    return o.reduce((acc, val, i) => acc + val * values[i], 0);
  }


  invertOffer(o) {
    return o.map((c, i) => this.counts[i] - c);
  }


  createTakeItOrLeaveItOffer(jokerOffer) {
    this.log("this is the last round");
    const jokerValue = this.calcValue(jokerOffer, this.values);
    this.log(`evaluating joker's offer ${jokerOffer} with value ${jokerValue}`);
    if (this.isInBoundAcceptableValue(jokerValue)) {
      this.log(`joker is generous. accepting it`);
      return; // return undefined for accepting the offer
    }

    const coBasedOnJoker = this.buildCounterOfferByJokerPsych(jokerOffer, this.acceptableValue({outBound: true}));
    if (coBasedOnJoker) {
      return coBasedOnJoker;
    }

  }


  handleThisisOurLastEffectiveOffer(jokerOffer) {
    this.log(`this is the last time we can give an effective offer. next turn the Joker will give us 'take-it-or-leave-it-offer'`);
    const jokerValue = this.calcValue(jokerOffer, this.values);
    this.log(`evaluating joker's offer ${jokerOffer} with value ${jokerValue}`);
    if (this.isInBoundAcceptableValue(jokerValue)) {
      this.log(`joker is generous. accepting it`);
      this.counterOfferRoot = "ACCEPT";
      return; // return undefined for accepting the offer
    }

    const coBasedOnJoker = this.buildCounterOfferByJokerPsych(jokerOffer, Math.min(6, this.acceptableValue({}))); // VAR1: use Math.min(6, acceptable)
    if (coBasedOnJoker) {
      return coBasedOnJoker;
    }
  }

  handleTakeItOrLeaveItByJoker(jokerOffer) {
    this.log("Handle Last Offer. I can accept it, or we both get 0");
    const batmanValueToJokerOffer = this.calcValue(jokerOffer, this.values);
    const bestJokerOfferSoFar = this.joker.history.offers
      .reduce((acc, elm) => Math.max(acc, elm.batmanValue), 0);

    //VAR2A: we will accept >=1
    //VAR2B: we will accept >=5

    if (batmanValueToJokerOffer >=  5) {
      this.log(`I'm @freier@Accept_Joker_take_it_or_leave_it_offer@ - accepting Joker's last offer`);
      this.counterOfferRoot = "JTYOL_FR";
      return;
    }
    if (batmanValueToJokerOffer >= this.config.acceptableThresholdForLastPlay * this.total) {
      this.log(`accept offer. value ${batmanValueToJokerOffer} worth more than ${this.config.acceptableThresholdForLastPlay * 100}% of ${this.total}`);
      this.counterOfferRoot = "JTYOL_AC";
      return;
    }
    this.log(`reject offer. too lower offer ${batmanValueToJokerOffer} for last round תמות נפשי עם פלשתים`);
    this.counterOfferRoot = "JTYOL_RJ";
    return jokerOffer; // we need to return any offer to reject.
  }

  isInBoundAcceptableValue(value) {
    return value >= this.acceptableValue({outBound: false});
  }


  isOutBoundAcceptableValue(value) {
    return value >= this.acceptableValue({outBound: true});
  }

  acceptableValue({outBound}) {
    const bestJokerOfferSoFar = this.joker.history.offers
      .reduce((acc, elm) => Math.max(acc, elm.batmanValue), 0);

    const baseAcceptable = () => {
      const progress = this.round / this.maxRounds;
      if (progress >= 0.5 || (outBound && this.round === 0 && this.me === 0)) { // either at the going or we generate the TakeItOrLeaveIt
        return this.config.dynamicAcceptableValue;
      }
      if (progress >= 0.33) {
        return (this.config.maxminAcceptableValue + this.config.dynamicAcceptableValue) / 2;
      }
      return this.config.maxminAcceptableValue;
    };

    return Math.floor(Math.min(this.total, Math.max(baseAcceptable(), bestJokerOfferSoFar)));
  }

  winWinProbHighEnough(prob) {
    return prob > this.config.winwinProbThreshold;
  }

  safetyNet(o) {
    this.log(`before accepting or giving an offer ${JSON.stringify(o)} we run the safetyNet with history length ${this.joker.history.offers.length}`);
    const value = this.calcValue(o, this.values);
    const minOffer = this.getOfferWithMinValueFromJokerHistory();
    const minOfferValue = this.calcValue(minOffer, this.values);
    if (value < minOfferValue) {
      this.log(`hey hey, safety net in action. we have a bit better offer that Joker gave us in the past ${minOffer} with value ${minOfferValue}`);
      return minOffer;
    } else {
      this.log(`going to accept / give offer ${o} with value ${value}`);
      // noinspection UnnecessaryReturnStatementJS
      return;
    }
  }

  calcMaxMinAcceptableValue() {
    return 1 + this.joker.allPossibleValues.reduce((acc, pv) => {
      return acc + pv.prob * pv.maxmin
    }, 0);
  }


  updateDynamicAcceptableValue(acceptable) {
    this.log(`dynamicAcceptableValue from @${this.config.dynamicAcceptableValue.toPrecision(3)} @ to @${acceptable.toPrecision(3)} @`);
    this.config.dynamicAcceptableValue = acceptable;
  }

  updateMaxMinAcceptableValue(maxmin) {
    this.log(`maxminAcceptableValue from @${this.config.maxminAcceptableValue.toPrecision(3)} @ to @${maxmin.toPrecision(3)} @`);
    this.config.maxminAcceptableValue = maxmin;
  }

  updateAcceptable() {
    let before = this.acceptableValue({});
    this.updateDynamicAcceptableValue(this.calcDynamicAcceptableValue());
    this.updateMaxMinAcceptableValue(this.calcMaxMinAcceptableValue());
    this.log(`finalAcceptableValue from @${before.toPrecision(3)} @ to @${this.acceptableValue({}).toPrecision(3)} @`);
  }

  /*
  Foreach offer we can make
   offer.score = 0
   jokerCounts = the inverse of the offer, items we let Joker keep
   // the loop below compute the probability of Joker accepting our offer
   Foreach possible Joker value
      compute Joker's worth for jokerCounts given the current values
      offer.score += jokerValue.prob * jokerAcceptProb[Joker's worth-1]
   // Now multiply the acceptance probability by how much the offer is worth to us
   offer.score *= offer's worth to Batman
Serve the highest scoring offer

   */
  buildCounterOfferByJokerPsych(o, effectiveAcceptedValue) {

    const bindedCalcPysch = calcPsych.bind(this);

    if (effectiveAcceptedValue <= 0) {
      return;
    }
    const counterOffer = bindedCalcPysch(effectiveAcceptedValue);
    if (counterOffer) {
      return counterOffer;
    }
    return this.buildCounterOfferByJokerPsych(o, effectiveAcceptedValue - 1);

    function calcPsych(effectiveValue) {
      const psychTable = this.getJokerAcceptProbDynamic(this.invertOffer(o));

      const possibleOffers = this.allPossibleOffers.filter((po) => po.batmanValue >= effectiveValue)
        .filter((po) => po.offerable);

      const offersWithScore = possibleOffers.map((po) => {
        const jokerCounts = this.invertOffer(po.offer);
        const s = this.joker.allPossibleValues.reduce((acc, pv) => {
          const jokerScore = this.calcValue(jokerCounts, pv.values);
          //return acc + pv.prob * this.getJokerAcceptProb(jokerScore);
          return acc + pv.prob * psychTable[jokerScore];
        }, 0);
        return {...po, score: s * po.batmanValue ** this.config.batmanValueFactor};
      });


      offersWithScore.sort((a, b) => {
        return b.score - a.score;
      });

      if (possibleOffers.length === 0) {
        return;
      }

      this.log(`###\n${JSON.stringify(offersWithScore)}`);
      this.counterOfferRoot = "CO_PREDICT";
      this.log(`going to give ${JSON.stringify(offersWithScore[0].offer)}`);
      return offersWithScore[0].offer;
    }
  }

  getJokerAcceptProbDynamic(_o) {
    let T = [];
    let psych = [];
    for (let i = 0; i <= 10; i++) T[i] = psych[i] = 0;

    this.log('getJokerAcceptProbDynamic');
    this.joker.allPossibleValues.forEach((pv) => {
      const jokerWorth = this.calcValue(_o, pv.values);
      this.log(JSON.stringify(_o) + ':' + JSON.stringify(pv.values) + ':' + jokerWorth);
      T[jokerWorth] += pv.prob;
    }, 0);
    this.log('T' + JSON.stringify(T));

    const computePsych = () => {
      for (let i = 0; i <= 10; i++) {
        for (let j = i; j <= 10; j++) {
          psych[j] += T[i];
        }
        if (i >= 1) {
          psych[i - 1] += T[i] * 0.6;
        }
        if (i >= 2) {
          psych[i - 2] += T[i] * 0.2;
        }
      }
    };
    computePsych();
    this.log('computed psych' + JSON.stringify(psych));
    return psych;
  }

  isAlmostZero(x) {
    return x < 0.000000001;
  }
}

module.exports = Agent;
//new Agent(1, [4, 1, 2], [1, 1, 3], 5, console.log);
