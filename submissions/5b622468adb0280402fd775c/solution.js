'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.maxRounds = max_rounds;
    this.log = log;
    this.rounds = 1;

    this.offeringLimit = 0.6;
    this.lastSpeakingLimit = 0.8;
    this.acceptanceLimit = 0.6;
    this.lastAcceptanceLimit = 0.1;

    this.totalValue = 0;
    this.totalObject = 0;
    this.partnerPreferences = [];
    for (let i = 0; i < counts.length; i++) {
      this.totalValue += counts[i]*values[i];
      this.totalObject += counts[i];
      this.partnerPreferences.push(0);
    }

    this.totalCombinations = this._calculateTotalCombinations.bind(this)();
    this.decreasingOffering = this._calculateDecreasingOffering.bind(this)(this.totalCombinations);
  }

  _calculateTotalCombinations() {
    let totalCombinationsArray = [];

    let outputCombination = (recursiveDepth, combinationInProgress) => {
      for (let objectNumber = 0; objectNumber <= this.counts[recursiveDepth]; objectNumber++) {
        combinationInProgress[recursiveDepth] = objectNumber;
        if (recursiveDepth < this.counts.length - 1) {
          outputCombination(recursiveDepth + 1, combinationInProgress.slice());
        } else {
          totalCombinationsArray.push(combinationInProgress.slice());
        }
      }
    }
    outputCombination(0, []);
    return totalCombinationsArray;
  }

  _calculateDecreasingOffering(totalCombinations) {
    let decreasingOfferingArray = [];
    for (let i = this.totalValue; i >= 0; i--) {
      decreasingOfferingArray.push([]);
    }

    for (let i = 0; i < totalCombinations.length; i++) {
      let ourValue = 0;
      let objectSum = 0;
      for (let j = 0; j < totalCombinations[i].length; j++) {
        objectSum += totalCombinations[i][j];
        let keptObjectValue = totalCombinations[i][j] * this.values[j];
        ourValue += keptObjectValue;
      }
      if (objectSum < this.totalObject && ourValue > 0) {
        decreasingOfferingArray[this.totalValue - ourValue].push(totalCombinations[i]);
      }
    }
    return decreasingOfferingArray;
  }

  offer(offered) {
    let calculateFlooredTreshold = (limit) => {
      let decreasingStep = (this.totalValue - (limit * this.totalValue)) / (this.maxRounds - 1);
      let unflooredTreshold = this.totalValue - (decreasingStep * (this.rounds - 1));
      return Math.floor(unflooredTreshold);
    };

    if (offered) {
      for (let i = 0; i < this.counts.length; i++) {
        let partnerPreferenceByTypeThisRound = (this.counts[i] - offered[i]) / this.counts[i];
        this.partnerPreferences[i] += partnerPreferenceByTypeThisRound;
      }

      let offeredValue = 0;
      for (let i = 0; i < offered.length; i++) {
        offeredValue += this.values[i]*offered[i];
      }

      if (offeredValue === this.totalValue) {
        return;
      }

      let acceptanceTreshold = calculateFlooredTreshold(this.acceptanceLimit);

      if (offeredValue >= acceptanceTreshold) {
        return;
      }

      if (this.rounds === this.maxRounds && this.me === 1) {
        let lastAcceptanceTreshold = calculateFlooredTreshold(this.lastAcceptanceLimit);
        if (offeredValue >= lastAcceptanceTreshold) {
          return;
        }
      }
    }

    let combinationWithMaxObjects = (combinationsArray) => {
      let maxObjects = 0;
      let maxObjectsCombination;
      for (let i = 0; i < combinationsArray.length; i++) {
        let totalObjects = 0;
        for (let j = 0; j < combinationsArray[i].length; j++) {
          totalObjects += this.counts[j] - combinationsArray[i][j];
        }
        if (totalObjects > maxObjects) {
          maxObjects = totalObjects;
          maxObjectsCombination = combinationsArray[i];
        }
      }
      return maxObjectsCombination;
    };

    let veryFirstOffering = () => {
      for (let i = 0; i < this.decreasingOffering.length; i++) {
        if (this.decreasingOffering[i].length > 0) {
          return combinationWithMaxObjects(this.decreasingOffering[i]);
        }
      }
    };

    let maxPreferenceFilter = (combinationsArray) => {
      let totalPreferenceArray = [];
      for (let i = 0; i < combinationsArray.length; i++) {
        let totalPreference = 0;
        for (let j = 0; j < combinationsArray[i].length; j++) {
          totalPreference += ((this.counts[j] - combinationsArray[i][j]) / this.counts[j]) * this.partnerPreferences[j];
        }
        totalPreferenceArray.push(totalPreference);
      }
      let maxTotal = 0;
      let preferedCombinationIndex = 0;
      for (let i = 0; i < totalPreferenceArray.length; i++) {
        if (totalPreferenceArray[i] > maxTotal) {
          maxTotal = totalPreferenceArray[i];
          preferedCombinationIndex = i;
        }
      }
      return combinationsArray[preferedCombinationIndex];
    };

    let tresholdOfferingIndexResolver = (treshold) => {
      let inversedTreshold = this.totalValue - treshold;
      if (this.decreasingOffering[inversedTreshold].length > 0) {
        return this.decreasingOffering[inversedTreshold];
      } else {
        for (let i = 1; i <= this.decreasingOffering.length; i++) {
          let step = Math.round(i / 2);
          let index;
          if (i % 2 === 1) {
            index = inversedTreshold - step;
          } else if (i % 2 === 0) {
            index = inversedTreshold + step;
          }
          if (index >= 0 && index < this.decreasingOffering.length && this.decreasingOffering[index].length > 0) {
            return this.decreasingOffering[index];
          }
        }
      }
    };

    let lastSpeakingOffering = () => {
      let lastSpeakingTreshold = calculateFlooredTreshold(this.lastSpeakingLimit);
      let tresholdCombinations = tresholdOfferingIndexResolver(lastSpeakingTreshold);
      return maxPreferenceFilter(tresholdCombinations);
    };

    let normalOffering = () => {
      let treshold = calculateFlooredTreshold(this.offeringLimit);
      let tresholdCombinations = tresholdOfferingIndexResolver(treshold);
      return maxPreferenceFilter(tresholdCombinations);
    };

    let offering;
    if (this.rounds === 1 && this.me === 0) {
      offering = veryFirstOffering();
    } else if (this.rounds === this.maxRounds && this.me === 0) {
      offering = lastSpeakingOffering();
    } else {
      offering = normalOffering();
    }

    this.rounds++;
    return offering;
  }
};
