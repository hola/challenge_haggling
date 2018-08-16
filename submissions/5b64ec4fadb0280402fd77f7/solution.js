'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.me = me; //me — 0, если ваша очередь первая, или 1, если вторая.
        this.values = values;
        this.rounds = max_rounds;
        this.opponentOffers = [];
        this.myOffers = [];

        this.log = log;
        this.total = 0;
        this.round = 0;
        for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
        }

        let vV = valuesVariants(counts, 0, this.total, [], [], values);
        this.valuesVariants = new Array(vV.length);
        for(let i = 0; i < vV.length; i++) {
            let res = calOptimum(counts, values, vV[i]);
            let score = "";
            for(let i = 0; i < res.rasclad.length; i++) {
                score += res.rasclad[i].score + " " + JSON.stringify(res.rasclad[i].alice);
            }
            this.valuesVariants[i] = {prob: 1/vV.length, prevSum: 0, curSum: 0, variant: vV[i], rasclObj: res};
        }
        if (me == 0) {
            this.rejectProb = [1, 1, 0.9, 0.6, 0.3, 0.1, 0.0808, 0.0925, 0.0454, 0.0057, 0];
            this.strategy = this.attackStrategy;
        } else {
            this.rejectProb = [1, 1, 0.9, 0.77, 0.64, 0.43, 0.0994, 0.0925, 0.0356, 0.0028, 0];
            this.strategy = this.defenceStrategy;
        }
    }


    offer(o){
        this.round++;
        this.rounds--;

        return this.strategy(o);


    };

    attackStrategy(o) {
       if (o) {
            this.opponentOffers.push(o);

            this.opponentValuesProbCalc(o);

            this.valuesVariants.sort((a, b) => b.prob - a.prob);

            let variantsGroupsArr = this.separationGroupsCalc();

             for(let i = 0; i < variantsGroupsArr.length; i++) {
               variantsGroupsArr[i].rejScore = variantsGroupsArr[i].score * (1 - variantsGroupsArr[i].rejectProb);
               variantsGroupsArr[i].totalScore = (variantsGroupsArr[i].score - variantsGroupsArr[i].oppscore + 3) * (1 - variantsGroupsArr[i].rejectProb);
                    if (variantsGroupsArr[i].optimum < 12.1) {
                        variantsGroupsArr[i].totalScore2 = (variantsGroupsArr[i].rejScore - (variantsGroupsArr[i].os*0.2));//* (1 - variantsGroupsArr[i].rejectProb);
                        variantsGroupsArr[i].totalScore2 += variantsGroupsArr[i].total - 9.99 < 0 ? 10 : 0;
                    } else {
                        variantsGroupsArr[i].totalScore2 = (variantsGroupsArr[i].rejScore - (variantsGroupsArr[i].os*0.55));//* (1 - variantsGroupsArr[i].rejectProb);
                    }
                    if (variantsGroupsArr[i].rejectProb > 0.5) {
                        variantsGroupsArr[i].totalScore2 -= 10;
                    }

            }
            variantsGroupsArr.sort((a, b) => (b.totalScore2) - (a.totalScore2 ));

            o = variantsGroupsArr[0].group;
            this.myOffers.push(o);
            return o;
        }

        o = this.counts.slice();
        for (let i = 0; i < o.length; i++) {
            if (this.values[i] == 0) {
                o[i]--;
                break;
            }
        }
        return o;

    };

    defenceStrategy(o) {

             this.opponentOffers.push(o);

             this.opponentValuesProbCalc(o);

             this.valuesVariants.sort((a, b) => b.prob - a.prob);

             let variantsGroupsArr = this.separationGroupsCalc();

             for(let i = 0; i < variantsGroupsArr.length; i++) {
               variantsGroupsArr[i].rejScore = variantsGroupsArr[i].score * (1 - variantsGroupsArr[i].rejectProb);
               variantsGroupsArr[i].totalScore = (variantsGroupsArr[i].score - variantsGroupsArr[i].oppscore + 3) * (1 - variantsGroupsArr[i].rejectProb);
                    if (variantsGroupsArr[i].optimum < 12.1) {
                        variantsGroupsArr[i].totalScore2 = (variantsGroupsArr[i].rejScore - (variantsGroupsArr[i].os*0.3));//* (1 - variantsGroupsArr[i].rejectProb);
                        variantsGroupsArr[i].totalScore2 += variantsGroupsArr[i].total - 9.99 < 0 ? 10 : 0;
                    } else {
                        variantsGroupsArr[i].totalScore2 = (variantsGroupsArr[i].rejScore - (variantsGroupsArr[i].os*0.6));//* (1 - variantsGroupsArr[i].rejectProb);
                    }
            }
            variantsGroupsArr.sort((a, b) => (b.totalScore2) - (a.totalScore2 ));

             if (this.rounds == 0) {
                 let sum = 0;
                 for (let i = 0; i<o.length; i++) {
                     sum += this.values[i]*o[i];
                 }
                 let variantsGroupsKeys = variantsGroupsArr.map((elem) => JSON.stringify(elem.group));
                 let groupKey = variantsGroupsKeys.indexOf(JSON.stringify(o));
                 let porog = 5;
                 if (variantsGroupsArr[groupKey].optimum < 12.1) {
                    porog = 8;
                 } else if (variantsGroupsArr[groupKey].optimum < 15) {
                    porog = 6
                 }
                 if (variantsGroupsArr[groupKey].totalScore > 0 || groupKey == 0 ||
                                    (variantsGroupsArr[groupKey].oppscore - variantsGroupsArr[groupKey].score < porog)) {
                         return;
                 }

             }
             o = variantsGroupsArr[0].group;
             this.myOffers.push(o);
             return o;
    };

    opponentValuesProbCalc(o) {
                var offerItems = o.reduce((a, b) => a + b, 0);

                let fullProb = 0;
                for(let i = 0; i < this.valuesVariants.length; i++) {
                    this.valuesVariants[i].prevSum = this.valuesVariants[i].curSum;
                    this.valuesVariants[i].curSum = 0;
                    let minVal = this.total;
                    let minValNotZero = this.total;
                    for(let itemInd = 0; itemInd < o.length; itemInd++) {
                        this.valuesVariants[i].curSum += o[itemInd]*this.valuesVariants[i].variant[itemInd];
                        if (this.valuesVariants[i].variant[itemInd] < minVal) {
                            minVal = this.valuesVariants[i].variant[itemInd];
                        }
                        if (this.valuesVariants[i].variant[itemInd] < minValNotZero
                                        && this.valuesVariants[i].variant[itemInd] > 0) {
                            minValNotZero = this.valuesVariants[i].variant[itemInd];
                        }
                    }

            if (this.valuesVariants[i].curSum > 5) {
                this.valuesVariants[i].prob *= 0.03;
            }

            if (this.opponentOffers.length == 1) {
                if (this.valuesVariants[i].curSum > minValNotZero + 2 ) {
                    this.valuesVariants[i].prob *= 0.5;
                }
            } else {

            }

                    fullProb += this.valuesVariants[i].prob;

                }
                let check = 0;
                for(let i = 0; i < this.valuesVariants.length; i++) {
                    this.valuesVariants[i].prob /= fullProb;
                    check += this.valuesVariants[i].prob;
                }

    };

    separationGroupsCalc() {
                let variantsGroupsArr = []; // {group, cnt, score, probsum}
                let variantsGroupsKeys = []; // JSON of offer
                for(let variant = 0; variant < this.valuesVariants.length; variant++) {
                    let variantOffers = this.valuesVariants[variant].rasclObj.rasclad;
                    let optimum = this.valuesVariants[variant].rasclObj.optimum;
                    let prob = this.valuesVariants[variant].prob;
                    for(let rasclad = 0; rasclad < variantOffers.length; rasclad++) {
                        let offer = variantOffers[rasclad];
                        let groupKey = variantsGroupsKeys.indexOf(JSON.stringify(offer.alice));
                        if (groupKey < 0) {
                            variantsGroupsKeys.push(JSON.stringify(offer.alice));
                            variantsGroupsArr.push({group: offer.alice, cnt: 1, score: offer.aliceScore,
                                os: (offer.bobScore*(1-this.rejectProb[offer.bobScore])), oppscore: offer.bobScore,
                                rejectProb: this.rejectProb[offer.bobScore]*prob, probsum: prob,
                                prob2: this.rejectProb[offer.bobScore]*prob, total: offer.bobScore+offer.aliceScore,
                                optimum: optimum});
                        } else {
                            variantsGroupsArr[groupKey].cnt++;

                            variantsGroupsArr[groupKey].oppscore = (variantsGroupsArr[groupKey].oppscore * variantsGroupsArr[groupKey].probsum + offer.bobScore * prob)/(variantsGroupsArr[groupKey].probsum + prob);
                            variantsGroupsArr[groupKey].total = (variantsGroupsArr[groupKey].total * variantsGroupsArr[groupKey].probsum + (offer.bobScore + offer.aliceScore) * prob)/(variantsGroupsArr[groupKey].probsum + prob);
                            variantsGroupsArr[groupKey].optimum = (variantsGroupsArr[groupKey].optimum * variantsGroupsArr[groupKey].probsum + optimum * prob)/(variantsGroupsArr[groupKey].probsum + prob);
                            variantsGroupsArr[groupKey].os = (variantsGroupsArr[groupKey].os * variantsGroupsArr[groupKey].probsum + (offer.bobScore*(1-this.rejectProb[offer.bobScore])) * prob)/(variantsGroupsArr[groupKey].probsum + prob);
                            variantsGroupsArr[groupKey].probsum += prob;
                            variantsGroupsArr[groupKey].rejectProb += this.rejectProb[offer.bobScore]*prob;


                        }
                    }
                }
                return variantsGroupsArr;
    };
}


function valuesVariants(counts, groupIndex, val_stck, valArr, valVariantsArr, exclude) {
    let groups = counts.length;
    if (groupIndex < groups - 1) {
        for(let vg = 0; (vg * counts[groupIndex]) <= val_stck; vg++) {
            valArr[groupIndex] = vg;
            valVariantsArr = valuesVariants(counts, groupIndex+1, val_stck - vg * counts[groupIndex], valArr, valVariantsArr, exclude);
            if (counts[groupIndex] == 0 ) {
                break;
            }
        }
    } else {
        if ( val_stck == 0 || val_stck % counts[groupIndex] == 0  ) {
          let value_variant = new Array(groups);
          valArr[groupIndex] = val_stck==0 ? 0 : val_stck / counts[groupIndex];
          for(let i = 0; i < groups; i++) {
             value_variant[i] = valArr[i];
          }
          if (JSON.stringify(value_variant) != JSON.stringify(exclude)) {
             valVariantsArr.push(value_variant);
          }
        }
    }
    return valVariantsArr;
}

function calOptimum(cntVar, aValVar, bValVar) {
       let totalItems = cntVar.reduce((a, b) => a + b, 0);
       let rascladArr = [];
       let checkArr = [];
       let optimum = 0;
       let optimumGoodCnt = 0;
       let optimumNum = -1;
       for(let i=0; i < (2**totalItems); i++) {
                let BobSum = 0;
                let AliceSum = 0;
                let items = cntVar.slice();
                let bobsItems = cntVar.slice();
                let aliceItems = cntVar.slice();
                let itemIndex = 0;
                for(let k=0; k < totalItems; k++) {
                    if (items[itemIndex] == 0) {
                       itemIndex++;
                    }
                    items[itemIndex]--;
                    let whom = (i >>> k) & 1; // persons[whom]
                    if (whom == 0) {
                    // Bob's item
                      aliceItems[itemIndex]--;
                      BobSum += bValVar[itemIndex];
                    } else {
                    // Alice's item
                      bobsItems[itemIndex]--;
                      AliceSum += aValVar[itemIndex];
                    }
                }
                if (optimum < (BobSum + AliceSum) && BobSum > 1 && AliceSum > 1) {
                  optimum = BobSum + AliceSum;
                  optimumNum = i;
                }
                if (checkArr.indexOf(JSON.stringify(aliceItems)) < 0) {
                 checkArr.push(JSON.stringify(aliceItems));
                 rascladArr.push({bob: bobsItems, alice: aliceItems, aliceScore: AliceSum, bobScore: BobSum, score:` ${AliceSum}:${BobSum}`});
                }
      }
      rascladArr.sort((a, b) => b.alicescore - a.alicescore);
      return {optimum: optimum, rasclad: rascladArr};
}

function unsetVal(array, val) {
  for (var key in array) {
      if (JSON.stringify(array[key]) == JSON.stringify(val)) {
          array.splice(key, 1);
      }
  }
  return array;
}

