'use strict'; /*jslint node:true*/

const cFast      = true,
      cRlevelMax = 1;

module.exports = class Agent {
    constructor(me, counts, values, maxRounds, log) {
        this.meFirst    = me === 0;
        this.counts     = counts;
        this.values     = values;
        this.maxRounds  = maxRounds;
        this.round      = maxRounds;
        this.log        = log;
        this.myHistory  = [];
        this.hisHistory = [];
        
        this.syslog = (msg) => {
            this.log("## " + msg);
        };
    };
    
    offer(hisOffer) {
        this.round--;
        if (hisOffer) this.hisHistory.push(hisOffer);
        
        let me = new SubAgent(
            "Davide",
            this.meFirst,
            this.counts,
            this.values,
            this.maxRounds,
            this.round,
            this.myHistory,    
            this.hisHistory,
            this.log
        ),
        
        him = cFast ? null : new SubAgent(
            "Villain",
            ! this.meFirst,
            this.counts,
            me.hisValues,
            this.maxRounds,
            this.round,
            this.hisHistory.map(o => { return table(this.counts, o); }),
            this.myHistory .map(o => { return table(this.counts, o); }),
            this.log
        ),
        
        myOffer = (! this.round && ! this.meFirst) ? null : me.makeOffer();
        
        if (hisOffer) {
            let action = me.evaluateOffer(hisOffer);
            
            if (myOffer) {
                if (areVectorsEqual(myOffer, hisOffer)
                        || valueOfOffer(myOffer, this.values) < valueOfOffer(hisOffer, this.values))
                {
                    action = enumAction.accept;
                }
            }
            
            switch (action) {
                case enumAction.accept:
                    this.syslog("Offer accepted");
                    return;
                    break;
                case enumAction.refuse:
                    this.syslog("Offer refused");
                    break;
                default:
                    assert(false);
                    break;
            };
        }
        
        // make an offer
        if (myOffer) {
            this.syslog("Keep:  " + JSON.stringify(myOffer));
            this.syslog("Offer: " + JSON.stringify(table(this.counts, myOffer)));
            
            this.myHistory.push(myOffer);
            return myOffer;
        } else {
            return Array.from(this.counts);
        }
    };
};

function assert(c) {}  // WONTDO

const enumAction = {
    accept: "accept",
    refuse: "refuse"
};

class SubAgent {
    constructor(name, meFirst, counts, values, maxRounds, round, myHistory, hisHistory, log,
        rlevel = 0, ratMind = false)
    {
        // NOTE: this is not a deep copy
        // keep synched with clone()
        
        this.name       = name,
        this.meFirst    = meFirst;
        this.counts     = counts;
        this.values     = values;
        this.maxRounds  = maxRounds;
        this.round      = round;
        this.myHistory  = myHistory;
        this.hisHistory = hisHistory;
        this.extLog     = log;
        this.rlevel     = rlevel;
        this.introvert  = false;
        this.desperate  = false;
        this.ratMind    = ratMind;
        
        // 1-st
        this.isFirstRound   = this.round + 1 == this.maxRounds;
        this.isMyLastOffer  = (this.round == 0 && this.meFirst) || (this.round == 1 && ! this.meFirst);
        this.isHisLastOffer = this.round == 0;
        this.maxValue       = valueOfOffer(this.counts, this.values);
        this.allValues      = generateValues(this.counts, this.maxValue),
        
        // 2-nd
        this.hisValues      = this.speculateHisValues();
        
        // 3-rd
        this.heReasonable   = this.isHimReasonable();
        this.heClement      = this.isHimClement();
        this.heKamikaze     = this.isHimKamikaze();
        this.heIntegralist  = this.isHimIntegralist();
        this.heExplorer     = this.isHimExplorer();
        
        this.log("I estimate his values as", JSON.stringify(this.hisValues));
        this.log("His offer history is",     JSON.stringify(this.hisHistory));
        this.log("His behavior:",            (this.heReasonable    ? "reasonable"
                                             : (this.heKamikaze    ? "kamikaze"      : "unreasonable"))
                                             + (this.heIntegralist ? ", integralist" : "")                             
                                             + (this.heClement     ? ", clement"     : "")
                                             + (this.heExplorer    ? ", explorer"    : ""));
    };
    
    clone() {
        // NOTE: this is a deep copy
        // keep synched with constructor
        
        let c = {
            name:           this.name,
            meFirst:        this.meFirst,
            counts:         this.counts.slice(),
            values:         this.values.slice(),
            maxRounds:      this.maxRounds,
            round:          this.round,
            myHistory:      this.myHistory.slice(),
            hisHistory:     this.hisHistory.slice(),
            extLog:         this.extLog,
            rlevel:         this.rlevel,
            introvert:      this.introvert,
            desperate:      this.desperate,
            ratMind:        this.ratMind,
           
            isFirstRound:   this.isFirstRound,
            isMyLastOffer:  this.isMyLastOffer,
            isHisLastOffer: this.isHisLastOffer,
            maxValue:       this.maxValue,
            allValues:      this.allValues,
           
            hisValues:      this.hisValues.slice(),
           
            heReasonable:   this.heReasonable,
            heClement:      this.heClement,
            heKamikaze:     this.heKamikaze,
            heIntegralist:  this.heIntegralist,
            heExplorer:     this.heExplorer,
            
            // methods
            log:                    this.log,
            evaluateOffer:          this.evaluateOffer,
            makeOffer:              this.makeOffer,
            speculateHisValues:     this.speculateHisValues,
            isHimReasonable:        this.isHimReasonable,
            isHimClement:           this.isHimClement,
            isHimKamikaze:          this.isHimKamikaze,
            isHimIntegralist:       this.isHimIntegralist,
            isHimExplorer:          this.isHimExplorer,
            computeMyOfferMaxDelta: this.computeMyOfferMaxDelta,
            computeMyOfferMaxValue: this.computeMyOfferMaxValue
        };
        
        return c;
    };
    
    log(msg, arg) {
        const tab0 = 9,
              tab1 = 30;
        let   str;
        
        if (this.rlevel) return;
        
        str = this.name + ":" + " ".repeat(tab0 - this.name.length) + msg;
        if (arg !== undefined) str += " ".repeat(tab1 - msg.length) + arg;
        
        this.extLog(str);
    };
    
    // evaluate offer
    // return enumAction
    evaluateOffer(o) {
        let action = enumAction.refuse;
        
        if (o) {
            let meFirst = this.meFirst,
                round   = this.round,
                myVal   = valueOfOffer(o, this.values),
                val     = this.maxValue,
                r       = this.heReasonable;
            
            /* Rationale: only a minority of opponents squeeze hard their last offer;
             * exploiting them won't gift significant score to the enemy leaderboard */
            
            // accept
            if (round > 3) {
                if (myVal > 0.75 * val) action = enumAction.accept;
            } else if (round > 2) {
                if (myVal > 0.65 * val) action = enumAction.accept;
            } else if (round > 1) {
                if (myVal > 0.65 * val) action = enumAction.accept;
            } else if (round > 0) {
                if (myVal > 0.65 * val) action = enumAction.accept;
            }
            if (round == 1 && ! meFirst && myVal > (r ? 0.65 : 0.45) * val) action = enumAction.accept;
            if (round == 0 && ! meFirst && myVal > 0.15 * val)              action = enumAction.accept;
            if (round == 0 &&   meFirst && myVal > (r ? 0.65 : 0.55) * val) action = enumAction.accept;
        }
        
        this.log("Primary evaluation", action);
        return action;
    };
        
    // make offer
    // return offer obj
    makeOffer() {
        let myOffer;
        
        myOffer = this.computeMyOfferMaxValue();
        
        return myOffer;
    };

    // return: arrays of values
    speculateHisValues() {
        const meFirst    = this.meFirst,
              counts     = this.counts,
              maxValue   = this.maxValue,
              allValues  = this.allValues,
              myValues   = this.values,
              maxRounds  = this.maxRounds,
              round      = this.round,
              myHistory  = this.myHistory,
              hisHistory = this.hisHistory,
              rlevel     = this.rlevel;
        
        let values          = [],
            valuesMaxProfit = [],
            valuesHeldValue = [],
            valuesRatThesis = [],
            myDesires       = [],
            hisDesires      = [],
            isHistoryGreedy = true;

        function redistribute(valuesSame) {
            let cnts   = [],
                values = [];
            
            // reset cnts
            for (let i = 0; i <= counts.length; ++i)
                cnts[i] = 0;
            
            shuffleArray(valuesSame);
            
            for (let i = 0; i < valuesSame.length; ++i) {
                let cnt = 0;
                
                for (let v of valuesSame[i]) if (v) ++cnt;
                ++cnts[cnt];
            }
            
            for (let i = 0; i < valuesSame.length; ++i) {
                let cnt = 0;
                
                for (let v of valuesSame[i]) if (v) ++cnt;
                if (cnts[cnt] == Math.max(...cnts))
                    values = valuesSame[i];
            }
            
            return values;
        }
        
        if (hisHistory.length) {
            for (let o of hisHistory) {
                if (! isOfferGreedy(counts, o, true))
                    isHistoryGreedy = false;
            }
        }

        if (hisHistory.length) {
            // "held value" speculator
            {
                let dr         = directRound(round, maxRounds),
                    thsHold    = expectedEnemyThs(maxRounds).slice(0, dr + 1),
                    valuesSame = [];
            
                // extend hisDesires to include the inferred value of my offers he refused
                for (let i = 0; i < myHistory.length || i < hisHistory.length; ++i) {
                    let a = myHistory [i] ?               myHistory [i]  : table(counts, hisHistory[i]),
                        b = hisHistory[i] ? table(counts, hisHistory[i]) : myHistory [i];
                    
                    hisDesires[i] = matrixAvgVectors([a, b]);
                }
                
                let unitValueMax = matrixMaxElement(allValues),
                    thsMaxI = 0,
                    depth,
                    distMin  = null,
                    dist;
                
                // compute max ths index
                for (let i = 0; i < thsHold.length; ++i) {
                    if (thsHold[i] * maxValue >= unitValueMax) thsMaxI = i;
                    else break;
                }
                
                depth = Math.min(thsMaxI, hisDesires.length - 1);
                
                for (let i = 0; i < allValues.length; ++i) {
                    let valuesEstim = counts.map(() => 0.0);
                    
                    for (let j = 0; j <= depth; ++j) {
                        let keep        = hisDesires[j],
                            give        = table(counts, hisDesires[j]),
                            kSum        = keep.reduce((a, c) => a + c),
                            gSum        = give.reduce((a, c) => a + c);
                        
                        for (let k = 0; k < counts.length; ++k) {
                            valuesEstim[k] += thsHold[j] * maxValue / kSum;
                        }
                    }
                    
                    valuesEstim = valuesEstim.map(c => c / (depth + 1));
                    dist = vectorDistance(valuesEstim, allValues[i]);
                    
                    if (dist < distMin || distMin === null) {
                        distMin = dist;
                        valuesSame = [];
                    }
                    if (dist == distMin) {
                        valuesSame.push(allValues[i]);
                    }
                }
                
                valuesHeldValue = redistribute(valuesSame);
            }
            
            // maximize profit speculator
            {
                let _valueMax = 0,
                    valuesSame = [];
                
                myDesires  = matrixAvgVectors(myHistory);
                hisDesires = table(counts, matrixAvgVectors(hisHistory));
                
                // further extend hisDesires to include the inferred value of my offers he refused
                if (myDesires.length) {
                    hisDesires = matrixAvgVectors([ myDesires, hisDesires ]);
                }
                
                for (let i = 0; i < allValues.length; ++i) {
                    let value = valueOfOffer(hisDesires, allValues[i]);

                    if (value > _valueMax) {
                        _valueMax = value;
                        valuesSame = [];
                    }
                    if (value == _valueMax) {
                        valuesSame.push(allValues[i]);
                    }
                }
                
                valuesMaxProfit = redistribute(valuesSame);
            }
            
            // generate in vitrium test specimen  (rat's thesis speculator)
            if (rlevel < cRlevelMax) {
                let hypotheses  = [];
                
                for (let hypothesis of allValues) {  // 'of' preserves ordinality
                    let distance,
                        ratOffer   = [],
                        ratHistory = [];
                    
                    for (let i = 0; i < hisHistory.length; ++i) {
                        let rat = new SubAgent(
                            "Squeaky",
                            ! meFirst,
                            counts,
                            hypothesis,
                            maxRounds,
                            round,
                            i           ? hisHistory.slice(0, i)          .map(o => table(this.counts, o)) : [],
                            i + meFirst ? myHistory .slice(0, i + meFirst).map(o => table(this.counts, o)) : [],
                            this.log,
                            rlevel + 1,
                            false
                        );
                
                        ratOffer = table(counts, rat.computeMyOfferMaxValue());
                        ratHistory.push(ratOffer);
                    }
                    
                    //distance = vectorDistance(arrayAvgVectors(ratHistory), arrayAvgVectors(hisHistory));
                    //distance = matrixDistance(hisHistory, ratHistory);
                    distance = matrixDistanceSections(hisHistory, ratHistory, 3);
                    hypotheses.push({ "distance": distance, "hypothesis": hypothesis });
                }
                
                {
                    let distances  = hypotheses.map(c => c.distance),
                        min        = Math.min(...distances),
                        max        = Math.max(...distances),
                        weights,
                        weightsSum;
                        
                    if (min != max) {
                        weights    = distances.map(c => (max - c) / (max - min));
                        weightsSum = weights.reduce((a, c) => a + c);
                        weights    = weights.map(c => c / weightsSum);
                    } else {
                        weights = distances.map(() => 1.0 / distances.length);
                    }
                    
                    valuesRatThesis = matrixAvgVectors(hypotheses.map(c => c.hypothesis), weights);
                }
            }
            
            this.log("(spec) held value",   JSON.stringify(valuesHeldValue));
            this.log("(spec) max profit",   JSON.stringify(valuesMaxProfit));
            this.log("(spec) rat's thesis", JSON.stringify(valuesRatThesis));
            if (rlevel < cRlevelMax)
                 values = matrixAvgVectors([ valuesHeldValue, valuesMaxProfit, valuesRatThesis ], [ 0.10, 0.20, 0.70 ]);
            else values = matrixAvgVectors([ valuesHeldValue, valuesMaxProfit ],                  [ 0.30, 0.70 ]);
        } else {
            values = matrixAvgVectors(allValues);
            this.log("(spec) scholastic",   JSON.stringify(values));
        }
        
        /* If 'values' was computed rather than chosen from list, it may have non-integer numbers. */
        // pick closest integer permutation from list
        values = matrixClosestVec(allValues, values);
        
        return values;
    };

    isHimReasonable() {
        const counts         = this.counts,
              myValues       = this.values,
              hisValues      = this.hisValues,
              hisHistory     = this.hisHistory,
              isMyLastOffer  = this.isMyLastOffer,
              isHisLastOffer = this.isHisLastOffer,
              meFirst        = this.meFirst,
              maxRounds      = this.maxRounds;
        
        let maxValue = valueOfOffer(counts, myValues);

        function allEqual() {
            for (let i = 1; i < hisHistory.length; ++i) {
                if (! deepEqual(hisHistory[i], hisHistory[i - 1])) return false;
            }

            return true;
        }

        if (! hisHistory.length) return false;
        if (hisHistory.every(o => valueOfOffer(o, myValues) < 0.45 * maxValue)) return false;
        
        if (isMyLastOffer || isHisLastOffer) {
            if (allEqual()) return false;

            if (isOfferGreedy(counts, hisHistory[hisHistory.length - 1], true)) {
                return false;
            } else {
                return true;
            }
        } else {
            if (! allEqual()) return true;
        }

        return false;
    };
    
    isHimClement() {
        const counts     = this.counts,
              hisHistory = this.hisHistory;
        
        let clemency    = 0,
            robinValues = counts.map(() => 1),
            valueMax    = 0,
            valueNow;
            
        
        for (let i = 0; i < hisHistory.length; ++i) {
            valueNow = valueOfOffer(hisHistory[i], robinValues);
            
            if (valueNow > valueMax) {
                valueMax = valueNow;
                ++clemency;
            }
        }
        
        return clemency >= 3;
    };
    
    // if he seeks the highest profit regardless of his dire fate
    /* synopsis: kamikazes will lose the war; they don't expose enough entropy to permit speculation
     *           and help us help them.
     */
    isHimKamikaze() {
        const values     = this.values,
              myHistory  = this.myHistory,
              hisHistory = this.hisHistory,
              maxValue   = this.maxValue;
        
        // assume he is unable to speculate my values so soon
        if (myHistory.length < 2) return false;
        if (! hisHistory.length)  return false;
        
        for (let o of hisHistory)
            if (valueOfOffer(o, values) > 0.25 * maxValue) return false;
        
        return true;
    };

    isHimIntegralist() {
        const hisHistory  = this.hisHistory;
        let   integralist = true;
        
        if (! hisHistory.length) return false;
        
        for (let h of hisHistory) {
            if (vectorDistance(h, h.map(() => 0)) != 0) integralist = false;
        }
        
        return integralist;
    };

    isHimExplorer() {
        const hisHistory = this.hisHistory;
        
        let h  = Array.from(hisHistory),
            re = 0;
        
        if (! h.length) return false;
        
        for (let i = 0; i < h.length; ++i) {
            if (repetitionsInHistory(h[i], h) > 1) {
                h.splice(i, 1);
                ++re;
                --i;
            }
        }
        
        return re / hisHistory.length < 0.25;
    };

    // offer of mine which maximizes delta between my and his profit
    // return: my offer: [1, 2] || null
    computeMyOfferMaxDelta(hisValues) {
        const counts   = this.counts,
              myValues = this.values;
        
        let possibleOffers = generateOffers(counts),
            bestOffer = null,
            maxValue = valueOfOffer(counts, myValues),
            deltaMax = 0;

        for (let o of possibleOffers) {
            let myValue  = valueOfOffer(o, myValues),
                hisValue = valueOfOffer(table(counts, o), hisValues),
                delta    = myValue - hisValue;

            if (delta >= deltaMax && ((hisValue >= 0.5 * maxValue) || ! bestOffer)) {
                deltaMax = delta;
                bestOffer = o;
            }
        }

        return bestOffer;
    };

    // offer of mine which maximizes my profit
    // return: my offer: [1, 2]
    computeMyOfferMaxValue() {
        let meFirst          = this.meFirst,
            counts           = this.counts,
            maxValue         = this.maxValue,
            allValues        = this.allValues,
            myValues         = this.values,
            hisValues        = this.hisValues,
            myHistory        = this.myHistory,
            isHimReasonable  = this.heReasonable,
            isHimClement     = this.heClement,
            isHimKamikaze    = this.heKamikaze,
            isHimIntegralist = this.heIntegralist,
            isHimExplorer    = this.heExplorer,
            isMyLastOffer    = this.isMyLastOffer,
            round            = this.round,
            rlevel           = this.rlevel,
            introvert        = this.introvert,
            desperate        = this.desperate,
            ratMind          = this.ratMind,
            that             = this;
        
        let possibleOffers = generateOffers(counts),
            bestOffer      = null,
            nOffersLeft    = round - ! meFirst,
            didScramble    = false,
            didIntrovert   = false,
            didDesperate   = false,
            rate;
    
        function isSufficient(offer, indulge = false) {
            let myRate;
            
            if (round >= 0)     myRate = meFirst ? 0.65 : 0.55;
            if (round >  1)     myRate = meFirst ? 0.65 : 0.55;
            if (round >  2)     myRate = 0.65;
            if (round >  3)     myRate = 0.65;
            if (isMyLastOffer) {
                if (round == 0) myRate = isHimKamikaze   ? 0.15 : (0.35 - 0.10 * (desperate || indulge));
                else            myRate = isHimReasonable ? 0.45 - 0.10 * indulge : 0.25;
            }
            
            return offer && Math.max(...table(counts, offer))
                    && valueOfOffer(offer, myValues) > 0.99 * myRate * maxValue;  // float tolerance
        }
        
        function postProcessOffer(offer, indulge = false) {
            if (! offer) return offer;
            
            let offerStuff = Array.from(offer),
                offerPert  = Array.from(offer);
            
            // stuff offer with junk
            /*if (isMyLastOffer && (isHimKamikaze || ! isHimReasonable)) {
                for (let i = 0; i < offer.length; ++i) {
                    if (! myValues[i] && offer[i]) --offerStuff[i];
                }
            }*/
            
            // perturbate speculation
            if (isMyLastOffer) {
                let mask     = table(counts, offer).map(c => !! c),
                    perts    = perturbationsOfValues(hisValues, allValues, mask, 0.25 * maxValue),
                    hisValue = valueOfOffer(table(counts, offer), hisValues),
                    bonusMap = offer.map(() => 0);
                
                that.log("Perturbations", JSON.stringify(perts));
                
                for (let pert of perts) {
                    if (valueOfOffer(table(counts, offer), pert) > 0.99 * rate * maxValue) continue;
                    
                    for (let i = 0; i < pert.length; ++i) {
                        let bonus = Array.from(offer);
                        
                        if (! offer[i]) continue;
                        if (myValues[i] > 0.15 * maxValue) continue;
                        if (! pert[i] || pert[i] >= hisValues[i]) continue;
                        --bonus[i];
                        if (isSufficient(bonus, indulge)) ++bonusMap[i];
                    }
                }
                
                if (Math.max(...bonusMap) > 0.2 * perts.length) --offerPert[vectorMaxElementI(bonusMap)];
            }
            
            that.log("(post) offer original", JSON.stringify(offer));
            //that.log("(post) offer stuff",    JSON.stringify(offerStuff));
            that.log("(post) offer pert",     JSON.stringify(offerPert));
            return offerStuff.map((c, i) => Math.min(c, offerPert[i]));
        }
        
        // hisValues couldn't be speculated yet, scramble assumption to proceed and avoid stall
        if (! hisValues.length) {
            if (allValues.length)
                hisValues = allValues[Math.floor(Math.random() * allValues.length)];  // reassign local reference
        }
        
        // set rate
        rate = 0.35;
        if (round > 0) rate = 0.35;
        if (round > 1) rate = 0.35;
        if (round > 2) rate = 0.25;
        if (round > 3) rate = 0.25;
        if (isMyLastOffer) {
            let ce = isHimClement || isHimExplorer;
            
            if (round == 0)    rate = isHimReasonable ? (isHimExplorer ? 0.25 : 0.35)
                                                      : (0.45 - 0.10 * (ce && ! isHimKamikaze));
            else               rate = (isHimReasonable ? 0.35 : 0.45) + 0.10 * isHimKamikaze;
            if (isHimKamikaze) rate = 0.65 - 0.20 * ce;  // exploit his doctrine
        }

        this.log("Computed offer rate", rate);

        // attribute value to offers
        for (let o of possibleOffers) {
            o.myValue  = valueOfOffer(o, myValues);
            o.hisValue = valueOfOffer(table(counts, o), hisValues);
        }

        // sort offers best to worst
        possibleOffers.sort((a, b) => {
            if (a.myValue >  b.myValue) return -1;  // a first
            if (a.myValue <  b.myValue) return 1;   // b first

            if (a.hisValue <  b.hisValue) return -1;
            if (a.hisValue >  b.hisValue) return 1;
            return 0;
        });

        function scramble(rate, indulge = false) {
            let bestMyValue = 0,
                bestOffers = [],
                goodOffers = [];

            bestOffer = null;
            
            // maximize my value
            for (let o of possibleOffers) {
                if (o.myValue >= bestMyValue && (o.hisValue >= rate * maxValue) && isSufficient(o, indulge)) {
                    if (o.myValue == bestMyValue) bestOffers.push(o);
                    else                          bestOffers = [ o ];

                    bestMyValue = o.myValue;
                }
                
                if (o.hisValue >= rate * maxValue && isSufficient(o, indulge)) {
                    goodOffers.push(o);
                }
            }
            
            // try to not repeat offers to explore his reaction
            if (bestOffers.length) {
                for (let o of bestOffers) {
                    o.repetitions = repetitionsInHistory(o, myHistory);
                }
                
                bestOffers.sort((a, b) => { return a.repetitions - b.repetitions; });
                bestOffer = bestOffers[0];
            }
            
            // try harder to avoid early repetitions
            if ((nOffersLeft > 1 || isHimIntegralist) && bestOffer && repetitionsInHistory(bestOffer, myHistory)) {
                for (let go of goodOffers) {
                    if (repetitionsInHistory(go, myHistory) == 0) {
                        bestOffer = go;
                        break;
                    }
                }
            }
        }
        
        scramble(rate);
        
        if (! ratMind && ! bestOffer && isMyLastOffer) {
            this.log("Cannot satisfy current rate, will indulge");
            scramble(rate, true);
            if (isSufficient(bestOffer, true)) return postProcessOffer(bestOffer, true);
        }
        
        if (isSufficient(bestOffer)) this.log("Generated offer satisfies current rate");
        else                         this.log("Generated offer fails current rate, will scramble");

        /* Check if no offer is deemed desirable to him at this rate.
         * My estimation of the value he receives may be incorrect, scramble an offer deemed unworthy to him
         * to allow observation of his reaction on next turn. */
        for (let n = 0; n < 100; ++n) {
            if (isSufficient(bestOffer)) break;
            didScramble = true;
            if (round == 0 && isMyLastOffer) scramble(rate * (1 - n / 100.0));
            else                             scramble(rate * Math.random());
        }
        
        // failsafe: try further by ignoring my estimation of his values
        if (! isSufficient(bestOffer) && ! introvert && ! desperate) {
            this.log("Unable to make a good offer, I try Introvert Search");
            
            let nItems      = counts.reduce((a, c) => a + c),
                robinValues = counts.map(() => maxValue / nItems),
                myself      = this.clone();
        
            didIntrovert = true;
        
            myself.name      = "Yourself";
            myself.hisValues = robinValues;
            myself.rlevel    = rlevel + 1;
            myself.introvert = true;
            
            bestOffer = myself.computeMyOfferMaxValue();
        }
        
        // failsafe: final desperate search
        if (! ratMind
                && ! introvert && ! desperate
                && (! bestOffer
                ||  ( isMyLastOffer && round == 0
                      && repetitionsInHistory(bestOffer, myHistory) > 0
                      && valueOfOffer(table(counts, bestOffer), hisValues) < 0.25 * maxValue
                    )
                )
            )
        {
            this.log("Offer impasse, I try Desperate Search");
            
            let myself = this.clone();
        
            didDesperate = true;
            
            myself.name      = "Odysseus";
            myself.rlevel    = rlevel + 1;
            myself.desperate = true;
            
            bestOffer = myself.computeMyOfferMaxValue();
        }
        
        // fail hard
        if (! isSufficient(bestOffer)) {
            this.log("Unable to make a good offer, I give up");
            bestOffer = Array.from(counts);

            // offer nothing
            for (let i = 0; i < bestOffer.length; ++i) {
                bestOffer[i] = counts[i];
            }
        }
        
        bestOffer = postProcessOffer(bestOffer);
        
        return bestOffer;
    };
}
    
// return: all valid permutations of proposable offers
function generateOffers(counts) {
    let allOffers = [];
    
    (function _(offer, i) {
        if (i == counts.length) {
            allOffers.push(Array.from(offer));
            return;
        }
        
        for (let j = 0; j <= counts[i]; ++j) {
            offer[i] = j;
            _(offer, i + 1);
        }
    })(new Array(counts.length), 0);
    
    return allOffers;
}

// return: all valid permutations of values
function generateValues(counts, maxValue) {
    let allValues = [];
    
    (function _(counts, values, i, totalValue) {
        let count = counts[i];
        let max = (maxValue - totalValue) / count | 0;
        
        if (i == counts.length - 1) {
            if (totalValue + max * count == maxValue) {
                values[i] = max;
                allValues.push(Array.from(values));
            }
            return;
        }
        
        for (let j = 0; j <= max; ++j) {
            values[i] = j;
            _(counts, values, i + 1, totalValue + j * count);
        }
    })(counts, new Array(counts.length), 0, 0);
    
    return allValues;
}

function valueOfOffer(offer, values) {
    let v = 0;
    
    for (let i = 0; i < offer.length; ++i)
        v += offer[i] * values[i];
    
    return v;
}

// return: array of elements not included in offer
function table(counts, offer) {
    let t = new Array(counts.length);

    for (let i = 0; i < counts.length; ++i) {
        t[i] = counts[i] - offer[i];
    }

    return t;
}

function directRound(round, maxRounds) {
    return maxRounds - round - 1;
}

// don't mind rounding to integer
function expectedEnemyThs(maxRounds) {
    switch (maxRounds) {
        case 3:
            return [0.80, 0.65, 0.40];
            break;
        case 4:
            return [0.80, 0.70, 0.65, 0.40];
            break;
        case 5:
            return [0.80, 0.70, 0.65, 0.55, 0.40];
            break;
        case 6:
            return [0.80, 0.70, 0.70, 0.65, 0.55, 0.40];
            break;
        case 7:
            return [0.80, 0.75, 0.70, 0.70, 0.65, 0.55, 0.40];
            break;
        default:
            return new Array(maxRounds).fill(0).map((c, i) => 0.8 - 0.4 * i / Math.max(1.0, maxRounds - 1.0));
            break;
    }
}

function isOfferGreedy(counts, offer, toGive = true) {
    for (let i = 0; i < counts.length; ++i) {
        if (  toGive && offer[i] > 0)         return false;
        if (! toGive && offer[i] < counts[i]) return false;
    }

    return true;
}

function areVectorsEqual(a, b) {
    if (! a || ! b)           return false;
    if (a.length != b.length) return false;
    
    for (let i = 0; i < a.length; ++i)
        if (a[i] != b[i]) return false;
    
    return true;
}

function perturbationsOfValues(values, allValues, mask, magnitude) {
    let perts = [];
    
    for (let i = 0; i < values.length; ++i) {
        if (! mask[i] || ! values[i]) continue;
        
        for (let j = 0; j < allValues.length; ++j) {
            if (Math.abs(allValues[j][i] - values[i]) > magnitude) continue;
            if (perts.some(c => areVectorsEqual(c, allValues[j]))) continue;
            if (values.some((c, i) => Math.abs(c - allValues[j][i]) > magnitude)) continue;
            perts.push(allValues[j]);
        }
    }
    
    return perts;
}

function repetitionsInHistory(offer, history) {
    let n = 0;
    
    for (let h of history) {
        let eq = true;
        
        for (let i = 0; i < h.length; ++i) {
            if (offer[i] != h[i]) eq = false;
        }
        
        if (eq) ++n;
    }
    
    return n;
}

// average of vectors in array
// return: avg vector
function matrixAvgVectors(matrix, weights = null) {
    let avg = [];

    for (let i = 0; i < matrix.length; ++i) {
        let w   = (weights ? weights[i] : 1.0 / matrix.length),
            vec = matrix[i];
        
        for (let j = 0; j < vec.length; ++j) {
            if (typeof avg[j] !== "number") avg[j] = 0;
            avg[j] += w * vec[j];
        }
    }

    return avg;
}

// shuffle in place
function shuffleArray(a) {
  let i = a.length,
      tmp,
      rndIndex;

  // while there remain elements to shuffle
  while (0 !== i) {
    // pick a remaining element
    rndIndex = Math.floor(Math.random() * i);
    --i;

    // swap it with the current element
    tmp = a[i];
    a[i] = a[rndIndex];
    a[rndIndex] = tmp;
  }
}

function vectorDistance(a, b) {
    let distance = 0;
    
    for (let i = 0; i < a.length; ++i)
        distance += Math.abs(a[i] - b[i]);
    
    return distance;
}

function vectorSum(a, b) {
    return a.map((c, i) => c + b[i]);
}

function vectorMaxElementI(v) {
    if (! v.length) return -1;
    else            return v.reduce((iMax, c, i, arr) => c > arr[iMax] ? i : iMax, 0);
}

function matrixDistance(aMatrix, bMatrix) {
    let distance = 0;
    
    for (let i = 0; i < aMatrix.length; ++i)
        distance += vectorDistance(aMatrix[i], bMatrix[i]);
    
    return distance;
}

function matrixDistanceSections(aMatrix, bMatrix, sections = 1) {
    let step     = Math.max(1, Math.ceil(aMatrix.length / sections)),
        distance = 0;

    for (let s = 0; s < sections; ++s) {
        let begin = s * step,
            end   = Math.min(aMatrix.length, begin + step),
            a     = aMatrix.slice(begin, end),
            b     = bMatrix.slice(begin, end);
        
        if (begin > aMatrix.length - 1) break;
        distance += vectorDistance(matrixAvgVectors(a), matrixAvgVectors(b));
    }
    
    return distance;
}

function matrixClosestVec(matrix, vec) {
    let vecClosest  = [],
        distanceMin = null,
        distance;
    
    for (let mVec of matrix) {
        distance = vectorDistance(vec, mVec);
        
        if (distanceMin === null || distance < distanceMin) {
            distanceMin = distance;
            vecClosest  = mVec;
        }
    }
    
    return vecClosest;
}

function matrixMaxElement(matrix) {
    let max = null;
    
    for (let vec of matrix) {
        if (max === null || Math.max(...vec) > max)
            max = Math.max(...vec);
    }
    
    return max;
}

// adapted from npm package 'deep-equal'
function deepEqual(actual, expected, opts) {
    let pSlice = Array.prototype.slice;
    
    function objectKeys(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    };
    
    function isArguments(object) {
        return Object.prototype.toString.call(object) == '[object Arguments]';
    };
    
    function isUndefinedOrNull(value) {
        return value === null || value === undefined;
    }
    
    function isBuffer(x) {
        if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
        if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
            return false;
        }
        if (x.length > 0 && typeof x[0] !== 'number') return false;
        return true;
    }
    
    function objEquiv(a, b, opts) {
        let i, key, ka, kb;
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
        // an identical 'prototype' property.
        if (a.prototype !== b.prototype) return false;
        //~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.
        if (isArguments(a)) {
            if (!isArguments(b)) {
                return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return deepEqual(a, b, opts);
        }
        if (isBuffer(a)) {
            if (!isBuffer(b)) {
                return false;
            }
            if (a.length !== b.length) return false;
            for (i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
        try {
            ka = objectKeys(a);
            kb = objectKeys(b);
        } catch (e) {  //happens when one is a string literal and the other isn't
            return false;
        }
        // having the same number of owned properties (keys incorporates
        // hasOwnProperty)
        if (ka.length != kb.length) {
            return false;
        }
        //the same set of keys (although not necessarily the same order),
        ka.sort();
        kb.sort();
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i]) {
                return false;
            }
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!deepEqual(a[key], b[key], opts)) {
                return false;
            }
        }
        return typeof a === typeof b;
    }
    
    return (() => {
        if (!opts) opts = {};
        
        if (actual === expected) {
            return true;
            
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();
            
        } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
            return opts.strict ? actual === expected : actual == expected;
            
        } else {
            return objEquiv(actual, expected, opts);
        }
    })();
}
