"use strict";
var Main = (function () {
    function Main(me, counts, values, max_rounds, log) {
        this.roundCount = 0;
        this.profitOppLimit = 0.7;
        this.profitMyLimit = 0.9;
        this.counts = counts;
        this.max_rounds = max_rounds;
        this.myValues = values;
        this._logFunc = log;
        this.isMyFirstMove = me === 0;
        this.log('first move', this.isMyFirstMove ? 'me' : 'opp');
        this.log('items count', counts);
        this.log('max rounds', max_rounds);
        this.log('worthes for me', values);
        this.summaryWorth = Main.getWorth(counts, values);
        this.log('summary worth', this.summaryWorth);
        this.allValuesTable = this.calculateValuesTable(counts, 10);
        this.log('available worthes', this.allValuesTable);
        this.possibleOppValues = this.allValuesTable;
    }
    Main.prototype.offer = function (myCounts) {
        this.roundCount++;
        // determine how much we want, depends of current round and whose move was first
        var roundPercentage = this.roundCount / this.max_rounds;
        if (roundPercentage == 1) {
            this.profitMyLimit = this.isMyFirstMove ? 0.6 : 0.2;
        }
        else if (roundPercentage > 0.6) {
            this.profitMyLimit = 0.7;
        }
        else if (roundPercentage > 0.2) {
            this.profitMyLimit = 0.8;
        }
        var oppCounts = myCounts ? this.getReversedCount(myCounts) : null;
        this.log('opp made offer', {
            myCounts: myCounts,
            oppCounts: oppCounts,
            roundCount: this.roundCount,
            roundPercentage: roundPercentage,
            profit_my_limit: this.profitMyLimit
        });
        if (myCounts) {
            var myWorst = Main.getWorth(myCounts, this.myValues);
            // I received what I want, cheers
            if (myWorst / this.summaryWorth >= this.profitMyLimit) {
                return;
            }
            if (myCounts.length !== this.counts.length) {
                // offer out of bounds
                return this.counts;
            }
            // calculate possible opponent worths, suppose that he wants at least 70%
            var currentWorstData = [];
            for (var i = 0; i < this.allValuesTable.length; i++) {
                var currWorth = Main.getWorth(oppCounts, this.allValuesTable[i]);
                currentWorstData.push({
                    oppWorst: currWorth,
                    myWorst: myWorst,
                    values: this.allValuesTable[i]
                });
            }
            var newPossibleOppWorstData = this.getPossibleOppWorstData(currentWorstData);
            while (!newPossibleOppWorstData.length && this.profitOppLimit >= 0.5) {
                this.profitOppLimit -= 0.1;
                newPossibleOppWorstData = this.getPossibleOppWorstData(currentWorstData);
            }
            this.possibleOppValues = newPossibleOppWorstData.map(function (x) { return x.values; });
            this.log('possibleOppValues', this.possibleOppValues);
        }
        // calculate available propositions, they depend from how may I want in current round and from possible oppenent worths
        var opp_limit_for_proposition = 0.7;
        var proposition = undefined;
        var availablePropositions = this.calculateAllCounts(this.counts);
        while (opp_limit_for_proposition >= 0.0 && !proposition) {
            proposition = this.findProposition(this.profitMyLimit, opp_limit_for_proposition, this.possibleOppValues, availablePropositions);
            opp_limit_for_proposition -= 0.1;
        }
        if (proposition) {
            return proposition;
        }
        else {
            opp_limit_for_proposition = 0.7;
            while (opp_limit_for_proposition >= 0.0 && !proposition) {
                proposition = this.findProposition(this.profitMyLimit, opp_limit_for_proposition, this.allValuesTable, availablePropositions);
                opp_limit_for_proposition -= 0.1;
            }
            if (proposition) {
                return proposition;
            }
        }
        // we cant find acceptable offer, use example.js peace of code
        var o = this.counts.slice();
        for (var i = 0; i < o.length; i++) {
            if (!this.myValues[i])
                o[i] = 0;
        }
        return this.counts;
    };
    Main.prototype.getPossibleOppWorstData = function (currentWorstData) {
        var _this = this;
        var possibleOppWorstData = currentWorstData.filter(function (x) { return x.oppWorst / _this.summaryWorth >= _this.profitOppLimit; });
        var newPossibleOppWorstData = [];
        var _loop_1 = function (i) {
            var exists = this_1.possibleOppValues.filter(function (x) { return JSON.stringify(x) === JSON.stringify(possibleOppWorstData[i].values); }).length;
            if (exists) {
                newPossibleOppWorstData.push(possibleOppWorstData[i]);
            }
        };
        var this_1 = this;
        for (var i = 0; i < possibleOppWorstData.length; i++) {
            _loop_1(i);
        }
        return newPossibleOppWorstData;
    };
    Main.prototype.getReversedCount = function (counts) {
        var res = [];
        for (var i = 0; i < counts.length; i++) {
            res.push(this.counts[i] - counts[i]);
        }
        return res;
    };
    Main.prototype.findProposition = function (my_limit, opp_limit, possibleOppValues, availablePropositions) {
        if (opp_limit <= 0.001) {
            opp_limit = 0;
        }
        if (!possibleOppValues.length) {
            return null;
        }
        // here we should find item counts, which will cost >= my_limit for me and >= opp_limit for opponent
        var acceptablePropositionsData = [];
        for (var i = 0; i < availablePropositions.length; i++) {
            var myCount = availablePropositions[i];
            var myWorst = Main.getWorth(myCount, this.myValues);
            var bestOppWorst = 0;
            var isAcceptable = myWorst / this.summaryWorth >= my_limit;
            /*
                        this.log('', {
                            myWorst: myWorst,
                            myCount: myCount,
                            summaryWorth: this.summaryWorth,
                            my_limit: my_limit,
                            opp_limit: opp_limit,
                            isAcceptable: isAcceptable
                        });
            */
            var j = 0;
            while (isAcceptable && j < possibleOppValues.length) {
                var oppValue = possibleOppValues[j];
                var oppCount = this.getReversedCount(myCount);
                var oppWorst = Main.getWorth(oppCount, oppValue);
                if (oppWorst > bestOppWorst) {
                    bestOppWorst = oppWorst;
                }
                isAcceptable = (oppWorst / this.summaryWorth >= opp_limit);
                j++;
            }
            if (isAcceptable) {
                acceptablePropositionsData.push({
                    myCount: myCount,
                    myWorst: myWorst,
                    bestOppWorst: bestOppWorst
                });
            }
        }
        var acceptablePropositionIdx = Math.floor(Math.random() * acceptablePropositionsData.length);
        if (acceptablePropositionsData.length) {
            this.log('propositions', {
                acceptablePropositions: acceptablePropositionsData,
                my_limit: my_limit,
                opp_limit: opp_limit,
                acceptablePropositionIdx: acceptablePropositionIdx
            });
        }
        return acceptablePropositionsData.length ? acceptablePropositionsData[acceptablePropositionIdx].myCount : null;
    };
    Main.getWorth = function (counts, values) {
        var worth = 0;
        for (var i = 0; i < values.length; i++) {
            worth += counts[i] * values[i];
        }
        return worth;
    };
    ;
    Main.prototype.log = function (title, obj, show) {
        /*
                if (!show )
                    return;
        */
        /*
                const str = title + ': ' + JSON.stringify(obj);
                this._logFunc(str);
        */
    };
    Main.prototype.calculateValuesTable = function (itemsCountData, summaryWorth) {
        var results = [];
        calculateResult(0, 0, null, function (r) { return results.push(r); });
        function calculateResult(idx, prevSummaryWorth, currentResult, onNewResult) {
            if (!currentResult) {
                currentResult = [];
            }
            if (idx < itemsCountData.length) {
                var currentItemWorth = 0;
                while (currentItemWorth * itemsCountData[idx] + prevSummaryWorth <= summaryWorth) {
                    currentResult[idx] = currentItemWorth;
                    calculateResult(idx + 1, currentItemWorth * itemsCountData[idx] + prevSummaryWorth, currentResult, onNewResult);
                    currentItemWorth++;
                }
            }
            else {
                if (prevSummaryWorth === summaryWorth) {
                    onNewResult(currentResult.slice());
                }
            }
        }
        return results;
    };
    Main.prototype.calculateAllCounts = function (itemsCountData) {
        var results = [];
        var offerAllWithZeroWorth = this.roundCount >= this.max_rounds / 2;
        var self = this;
        calculateResult(0, undefined, function (r) { return results.push(r); });
        function calculateResult(idx, currentResult, onNewResult) {
            if (!currentResult) {
                currentResult = [];
            }
            if (idx < itemsCountData.length) {
                var upperCnt = offerAllWithZeroWorth && self.myValues[idx] === 0 ? 0 : itemsCountData[idx];
                for (var cnt = 0; cnt <= upperCnt; cnt++) {
                    currentResult[idx] = cnt;
                    calculateResult(idx + 1, currentResult, onNewResult);
                }
            }
            else {
                onNewResult(currentResult.slice());
            }
        }
        return results;
    };
    return Main;
}());
module.exports = Main;
