'use strict'; /*jslint node:true*/

var AnalyzerEngine = {
                TestOffer: function (counts, values, exceptValues, myValues, offer, myMove, invert) {
                    var enemyAvr = 0;
                    var count = 0;
                    var enemyMax = 0;
                    var enemyMin = 2147483647;
                    var nonZeroCount = 0;
                    var valueArray = new Array(values.length);

                    for (var j = 0; j < values.length; j++) {
                        if (exceptValues.indexOf(j) !== -1) {
                            continue;
                        }

                        var value = AnalyzerEngine.CalculateIncomeForOffer(counts, values[j], offer, true);

                        if (value > 0) {
                            nonZeroCount++;
                        }

                        enemyAvr += value;
                        valueArray[count++] = value;

                        if (value > enemyMax) {
                            enemyMax = value;
                        }

                        if (value < enemyMin) {
                            enemyMin = value;
                        }
                    }

                    if (enemyMin === 2147483647) {
                        enemyMin = 0;
                    }

                    enemyAvr /= count;

                    var enemyMedian = count % 2 === 1 ? valueArray[count >> 1] : (valueArray[count >> 1] + valueArray[(count >> 1) + 1]) * 0.5;

                    var myIncome = AnalyzerEngine.CalculateIncomeForOffer(counts, values[myValues], offer, false);

                    var score = myIncome - enemyAvr;

                    var offerCode = "";
                    for (var i = 0; i < offer.length; i++) {
                        offerCode = (offerCode || "") + offer[i];
                    }

                    return { MyIncome: myIncome, EnemyAverage: enemyAvr, EnemyMedian: enemyMedian, EnemyMin: enemyMin, EnemyMax: enemyMax, Offer: Array.from(offer), OfferCode: offerCode, Options: nonZeroCount, Score: score };
                },
                CalculateIncomeForOffer: function (counts, values, offer, invert) {
                    var value = 0;

                    if (invert) {
                        for (var i = 0; i < offer.length; i++) {
                            value += (counts[i] - offer[i]) * values[i];
                        }
                    } else {
                        for (var i1 = 0; i1 < offer.length; i1++) {
                            value += (offer[i1]) * values[i1];
                        }
                    }

                    return value;
                },
                FindBestOffers: function (counts, values, exceptValues, myValues) {
                    var results = [];
                    AnalyzerEngine.RecursiveFind(counts, values, exceptValues, myValues, new Array(counts.length), 0, results);


                    //results.Sort((x, y) => x.Score == y.Score ? 0 : x.Score > y.Score ? -1 : 1); - that was ok for greed idea, but gives lower overall result

                    // my priority is maximum for me and still good values for my enemy
                    results.sort(function (x, y) {
                            return x.MyIncome + x.EnemyAverage * 0.1 > y.MyIncome + y.EnemyAverage * 0.1 ? -1 : 1;
                        });

                    return results;
                },
                RecursiveFind: function (counts, values, exceptValues, myValues, offer, i, results) {
                    for (var j = 0; j <= counts[i]; j++) {
                        offer[i] = j;

                        if (i !== offer.length - 1) {
                            AnalyzerEngine.RecursiveFind(counts, values, exceptValues, myValues, offer, i + 1, results);
                            continue;
                        }

                        results.push(AnalyzerEngine.TestOffer(counts, values, exceptValues, myValues, offer));
                    }
                }
            }

module.exports = class AnalyzerPlayer {
	    constructor(me, counts, values, max_rounds, log){
                this.m_noOffer = false;
                this.AcceptThreshold = 0.85;
                this.RejectThreshold = 0.75;
                this.MinEnemyIncomeThreshold = 0.30;
                this.LastOfferThreshold = 0.25;
                this.MinOfferThreshold = 0.15;
                var $t;
                this.m_counts = counts;
                this.m_values = values;
                this.m_rounds = max_rounds * 2;
                this.m_log = log;

                this.m_maxIncome = 0;
                var count = 0;

                for (var i = 0; i < counts.length; i++) {
                    this.m_maxIncome += this.m_counts[i] * values[i];
                    count += this.m_counts[i];
                }

                var generator = new Generator(this.m_counts.length, 1, count, this.m_maxIncome);

                var currentSet = -1;
                var currentValues = -1;

                for (var i1 = 0; i1 < generator.Combinations.length; i1++) {
                    if (this.m_counts.join(',') === generator.Combinations[i1].Item1.join(',')) {
                        currentSet = i1;

                        for (var j = 0; j < generator.Combinations[i1].Item2.length; j++) {
                            if (($t = generator.Combinations[i1].Item2)[j].join(',') === this.m_values.join(',')) {
                                currentValues = j;
                                break;
                            }
                        }

                        break;
                    }
                }

                if (currentSet === -1 || currentValues === -1) {
                    throw new Error("Data and values not found in generated sets!");
                }

                this.m_allValues = generator.Combinations[currentSet].Item2;
                this.m_myValuesIndex = currentValues;

                this.m_rejectedOffers = [];
                this.m_excludedValues = [];
                this.m_excludedValues.push(currentValues);

                this.m_offers = AnalyzerEngine.FindBestOffers(this.m_counts, this.m_allValues, this.m_excludedValues, this.m_myValuesIndex);

                this.m_log(`${JSON.stringify(this.AcceptThreshold)}, ${JSON.stringify(this.RejectThreshold)}`);

            }
            offer (o) {
                if (o != null) {
                    this.m_rounds--;

                    var accept = this.CheckOffer(o, this.m_rounds);

                    if (accept) {
                        this.m_log(`${JSON.stringify(o.join(","))}`);

                        return null;
                    }
                }

                this.m_rounds--;

                if (this.m_rounds === 0) {
                    return this.m_counts;
                }

                var offer = this.MakeOffer(this.m_rounds);

                this.m_log(`${JSON.stringify(this.m_rounds)}, ${JSON.stringify(offer)}`);

                // don't forget to clone at this point, otherwise local offer could be garbled!
                return Array.from(offer.Offer);
            }
            CheckOffer (offer, turnsLeft) {
                // enemy would not offer me the items that could give him 9+ score, so let's remove them from the offer table
                {
                    var changed = false;
                    for (var i = 0; i < this.m_allValues.length; i++) {
                        if (this.m_excludedValues.indexOf(i) !== -1) {
                            continue;
                        }

                        // enemy income for his offer (inverted counts)
                        var income = AnalyzerEngine.CalculateIncomeForOffer(this.m_counts, this.m_allValues[i], offer, false);

                        if (income >= this.m_maxIncome * this.RejectThreshold) {
                            this.m_excludedValues.push(i);
                            changed = true;
                        }

                        // enemy income for items left to enemy
                        var invIncome = AnalyzerEngine.CalculateIncomeForOffer(this.m_counts, this.m_allValues[i], offer, true);

                        if (invIncome < this.m_maxIncome * this.MinEnemyIncomeThreshold) {
                            this.m_excludedValues.push(i);
                            changed = true;
                        }

                    }

                    if (changed) {
                        this.m_offers = AnalyzerEngine.FindBestOffers(this.m_counts, this.m_allValues, this.m_excludedValues, this.m_myValuesIndex);

                    }
                }

                var holder = AnalyzerEngine.TestOffer(this.m_counts, this.m_allValues, this.m_excludedValues, this.m_myValuesIndex, offer);

                if (holder == null) {
                    this.m_log("!!!!Empty offer!!!!");
                    return false;
                }

                this.m_log(`${JSON.stringify(turnsLeft)}, ${JSON.stringify(holder)}`);

                if (holder.MyIncome >= this.m_maxIncome * this.AcceptThreshold) {
                    return true;
                }

                if (turnsLeft <= 1 && holder.MyIncome > 0) {
                    this.m_log("I surrender! Give me at least " + holder.MyIncome);
                    return true;
                }

                if (!this.ValidOffer(holder, true)) {
                    return false;
                }

                if (this.m_lastOffer != null && holder.MyIncome >= this.m_lastOffer.MyIncome) {
                    return true;
                }

                return false;
            }
            ValidOffer (offer, enemyOffers) {
                if (offer.MyIncome === 0 || offer.EnemyAverage <= 0 || offer.EnemyMedian <= 0) {
                    return false;
                }

                if (!enemyOffers) {
                    if (offer.EnemyAverage < this.m_maxIncome * this.MinOfferThreshold) {
                        return false;
                    }

                    if (this.m_rejectedOffers.indexOf(offer.OfferCode) !== -1) {
                        return false;
                    }
                }

                return offer.MyIncome > 0;
            }
            MakeOffer (turnsLeft) {
                var selectedOffer = null;

                for (var i = 0; i < this.m_offers.length; i++) {
                    if (this.ValidOffer(this.m_offers[i], false)) {
                        selectedOffer = this.m_offers[i];
                        break;
                    }
                }

                if (this.m_greed) {
                    if (selectedOffer == null) {
                        selectedOffer = this.m_lastOffer;
                    }
                } else {
                    if (turnsLeft <= 2) {
                        this.m_log("Making last offer!");

                        selectedOffer = null;

                        for (var i1 = 0; i1 < this.m_offers.length; i1++) {
                            if (this.m_offers[i1].EnemyMedian > 0 && this.m_offers[i1].EnemyAverage >= this.m_maxIncome * this.LastOfferThreshold && this.m_offers[i1].MyIncome > 0) {
                                return this.m_offers[i1];
                            }
                        }
                    }

                    if (selectedOffer == null) {
                        this.m_log("No meaninful offers left!");

                        for (var i2 = 0; i2 < this.m_offers.length; i2++) {
                            if (this.m_offers[i2].EnemyMedian > 0 && this.m_offers[i2].EnemyAverage >= this.MinOfferThreshold * this.m_maxIncome && this.m_offers[i2].MyIncome > 0 && !this.m_rejectedOffers.indexOf(this.m_offers[i2].OfferCode) !== -1) {
                                selectedOffer = this.m_offers[i2];
                                break;
                            }
                        }

                        if (selectedOffer == null) {
                            this.m_log("No offers left and no relaxed found!");
                            selectedOffer = this.m_lastOffer;
                        }
                    }
                }
                this.m_rejectedOffers.push(selectedOffer.OfferCode);

                this.m_lastOffer = selectedOffer;

                // if enemy rejected my offer, that means that his total for this offer never reached 9 or 10
                var changed = false;
                for (var i3 = 0; i3 < this.m_allValues.length; i3++) {
                    if (this.m_excludedValues.indexOf(i3) !== -1) {
                        continue;
                    }

                    var income = AnalyzerEngine.CalculateIncomeForOffer(this.m_counts, this.m_allValues[i3], this.m_lastOffer.Offer, true);

                    if (income >= this.m_maxIncome * this.RejectThreshold) {
                        this.m_excludedValues.push(i3);
                        changed = true;
                    }
                }

                if (changed) {
                    this.m_offers = AnalyzerEngine.FindBestOffers(this.m_counts, this.m_allValues, this.m_excludedValues, this.m_myValuesIndex);

                }

                return selectedOffer;
            }
        }


var Generator = class {
            constructor (types, min_obj, max_obj, total) {
                this.m_types = types;
                this.m_minObj = min_obj;
                this.m_maxObj = max_obj;
                this.m_total = total;
                this.Combinations = [];
                this.InitSets(new Array(types), 0, 0);

                if (this.Combinations.length === 0) {
                    throw new Error("Constraints cannot be satisfied");
                }
            }
            InitSets (counts, i, total_count) {
                var min = Math.max(1, this.m_minObj - total_count - this.m_types + i + 1);
                var max = this.m_maxObj - total_count - this.m_types + i + 1;
                for (var j = min; j <= max; j++) {
                    counts[i] = j;
                    if (i < this.m_types - 1) {
                        this.InitSets(counts, i + 1, total_count + j);
                    } else {
                        var obj_set = { Item1: counts, Item2: [] };

                        this.InitValues(obj_set, new Array(this.m_types), 0, 0);
                        if (obj_set.Item2.length >= 2) {
                            this.Combinations.push({ Item1: Array.from(counts), Item2: obj_set.Item2 });
                        }
                    }
                }
            }
            InitValues (obj_set, values, i, total_value) {
                var $t;
                var count = ($t = obj_set.Item1)[i];
                var max = (this.m_total - total_value) / count | 0;
                if (i === this.m_types - 1) {
                    if (total_value + max * count === this.m_total) {
                        values[i] = max;
                        obj_set.Item2.push(Array.from(values));
                    }
                    return;
                }
                for (var j = 0; j <= max; j++) {
                    values[i] = j;
                    this.InitValues(obj_set, values, i + 1, total_value + j * count);
                }
            }
        }
