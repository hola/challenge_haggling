'use strict';
const estErrorMultiplier = 0.6;
const IS_LOG_ENABLED = false;
function valueCounts(agent, counts) {
    return agent.items.reduce((sum, { value }, i) => sum + counts[i] * value, 0);
}
function makeOfferOfUndesirables(agent, noValueOfferCount) {
    agent.noValueOfferCount = noValueOfferCount;
    agent.log(`I will offer ${noValueOfferCount}/${agent.totalNoValueCount} undesirables`);
    let offeredCountSum = 0;
    return agent.items.map(({ count, value }) => {
        if (value) {
            return count;
        }
        let offeredCount = 0;
        if (offeredCountSum < noValueOfferCount) {
            offeredCount = Math.min(noValueOfferCount - offeredCountSum, count);
        }
        offeredCountSum += offeredCount;
        return count - offeredCount;
    });
}
class Agent {
    constructor(isNotFirst, counts, values, rounds, log) {
        this.noValueOfferCount = 0;
        this.log = IS_LOG_ENABLED ? log : () => { };
        const isFirst = this.isFirst = !isNotFirst;
        this.rounds = rounds;
        this.roundsLeft = rounds;
        this.roundsToHold = 0;
        this.roundsTillFold = Math.floor(rounds * 0.2) + (isFirst ? 1 : 0);
        this.roundsTillPanic = Math.floor(rounds * 0.4) + (isFirst ? 1 : 0);
        const turns = this.turns = rounds * 2;
        const items = this.items = [];
        let totalValue = 0;
        let totalCount = 0;
        let totalNoValueCount = 0;
        const holdRequestCounts = this.holdRequestCounts = [];
        for (let i = 0; i < counts.length; i++) {
            const count = counts[i];
            const value = values[i];
            const subTotalValue = count * value;
            holdRequestCounts.push(count);
            items.push({
                count,
                value,
                subTotalValue,
            });
            if (!value) {
                totalNoValueCount += count;
            }
            totalCount += count;
            totalValue += subTotalValue;
        }
        this.prevRequestCounts = holdRequestCounts;
        this.prevRequestValue = totalValue;
        this.opponentInfo = {
            requestHistory: [],
            foldReqHistory: [],
            timesHeld: 0,
            timesHeldAfterFold: 0,
            hasFolded: false,
            isStubborn: true,
            subTotalReqCounts: items.map(() => 0),
            totalReqCount: 0,
            importanceScores: items.map(({ count }) => count / totalCount),
        };
        this.isAllValued = !totalNoValueCount;
        this.totalNoValueCount = totalNoValueCount;
        this.totalValue = totalValue;
        this.totalCount = totalCount;
        this.stubbornAcceptableOfferValue = totalValue / 2;
        this.lowestReqValue = totalValue * 0.7;
    }
    offer(offeredCounts) {
        this.roundsLeft--;
        const { rounds, turns, roundsLeft, isFirst, prevRequestCounts } = this;
        const round = rounds - roundsLeft;
        const turn = (round * 2) - (isFirst ? 1 : 0);
        const turnsLeft = (roundsLeft * 2) + (isFirst ? 1 : 0);
        this.log(`round ${round}`);
        this.log(`${roundsLeft} rounds left`);
        this.log(`turn ${turn}`);
        this.log(`${turnsLeft} turns left`);
        if (!offeredCounts) {
            this.log('I am holding on first offer');
            return this.holdRequestCounts;
        }
        if (prevRequestCounts &&
            prevRequestCounts.every((c, i) => c === offeredCounts[i])) {
            this.log('Accepting offer matching last request');
            return;
        }
        const { opponentInfo, totalNoValueCount, totalCount, totalValue, items, prevOfferedCounts, } = this;
        const offerValue = valueCounts(this, offeredCounts);
        if (!turnsLeft && offerValue) {
            this.log('I accept anything of value on very last turn');
            return;
        }
        if (round >= this.roundsTillFold && offerValue === totalValue) {
            this.log(`I accept any offer of total value when past round ${this.roundsTillFold - 1}`);
            return;
        }
        this.log('offerValue: ' + offerValue);
        const opRequestedCounts = items.map(({ count }, i) => count - offeredCounts[i]);
        let requestCounts;
        opponentInfo.requestHistory.push(opRequestedCounts);
        if (prevOfferedCounts &&
            opponentInfo.isStubborn &&
            offeredCounts.some((c, i) => c !== prevOfferedCounts[i])) {
            opponentInfo.isStubborn = false;
        }
        this.prevOfferedCounts = offeredCounts;
        if (offeredCounts.every((c) => c === 0)) {
            opponentInfo.timesHeld++;
            if (opponentInfo.hasFolded) {
                this.log('Opponent is holding after folding');
                opponentInfo.timesHeldAfterFold++;
            }
            else {
                this.log('Opponent is holding');
                const { noValueOfferCount } = this;
                if (round < this.roundsToHold) {
                    this.log('I will hold');
                    requestCounts = this.holdRequestCounts;
                }
                else if (totalNoValueCount && noValueOfferCount < totalNoValueCount) {
                    if (round < this.roundsTillFold) {
                        requestCounts = makeOfferOfUndesirables(this, noValueOfferCount + 1);
                    }
                    else if (round < this.roundsTillPanic) {
                        requestCounts = makeOfferOfUndesirables(this, totalNoValueCount);
                    }
                }
            }
        }
        else {
            opponentInfo.hasFolded = true;
            opponentInfo.foldReqHistory.push(opRequestedCounts);
        }
        let totalReqCount = 0;
        const opSubTotalCounts = opponentInfo.subTotalReqCounts.map((count, i) => {
            const subTotalCount = count + opRequestedCounts[i];
            totalReqCount += subTotalCount;
            return subTotalCount;
        });
        opponentInfo.subTotalReqCounts = opSubTotalCounts;
        opponentInfo.totalReqCount = totalReqCount;
        opponentInfo.importanceScores = items.map(({ count }, i) => opSubTotalCounts[i] / count);
        this.log('opponentInfo: ' + JSON.stringify(opponentInfo));
        if (!requestCounts) {
            const importanceScores = opponentInfo.importanceScores;
            const importantIndexedItems = [];
            let importantTotalValue = 0;
            let importantCounts = 0;
            let noValueImportantCount = 0;
            opSubTotalCounts.forEach((reqCount, i) => {
                const { count, value, subTotalValue } = items[i];
                if (reqCount) {
                    const subTotalImportance = reqCount / totalReqCount;
                    const importance = reqCount / count;
                    const estOpSubTotalValue = importance * totalValue * estErrorMultiplier;
                    const estOpValue = estOpSubTotalValue / count;
                    const tradability = estOpValue / value;
                    importantIndexedItems.push({
                        index: i,
                        importance,
                        subTotalImportance,
                        estOpValue,
                        estOpSubTotalValue,
                        tradability,
                        value,
                        count,
                        subTotalValue,
                    });
                    importantCounts += count;
                    importantTotalValue += subTotalValue;
                    if (!value && importanceScores[i] > 0.3 * rounds) {
                        noValueImportantCount += count;
                    }
                }
            });
            this.log('itv: ' + importantTotalValue);
            this.log('ic: ' + importantCounts);
            this.log('nvic: ' + noValueImportantCount);
            if (round < this.roundsTillFold && this.noValueOfferCount >= noValueImportantCount) {
                this.log('Fold early');
                this.roundsTillFold = round;
            }
            if (!roundsLeft) {
                importantIndexedItems.sort((a, b) => a.tradability > b.tradability ? -1 :
                    a.tradability < b.tradability ? 1 :
                        0);
                if (opponentInfo.isStubborn) {
                    const { stubbornAcceptableOfferValue } = this;
                    const offerCountsMap = new Map();
                    let estimatedOppositionTotalValue = 0;
                    let reqTotalValue = totalValue;
                    for (const item of importantIndexedItems) {
                        const { index, count, estOpValue, value, } = item;
                        let estOfferOpValue = estimatedOppositionTotalValue;
                        let offerCount = 0;
                        let possibleReqTotalValue = reqTotalValue;
                        while (estOfferOpValue < stubbornAcceptableOfferValue &&
                            offerCount < count &&
                            possibleReqTotalValue - value > 0) {
                            offerCount++;
                            estOfferOpValue += estOpValue;
                            possibleReqTotalValue -= value;
                        }
                        offerCountsMap.set(index, offerCount);
                        estimatedOppositionTotalValue = estOfferOpValue;
                        reqTotalValue = possibleReqTotalValue;
                        if (estOfferOpValue >= stubbornAcceptableOfferValue) {
                            break;
                        }
                    }
                    requestCounts = items.map(({ value, count }, i) => {
                        if (!value) {
                            return 0;
                        }
                        const offerCount = offerCountsMap.get(i) || 0;
                        return count - offerCount;
                    });
                }
                else if (noValueImportantCount > 0) {
                    requestCounts = makeOfferOfUndesirables(this, this.totalNoValueCount);
                }
                else {
                    let itemToOffer = importantIndexedItems[0];
                    for (const item of importantIndexedItems) {
                        if (item.value && item.tradability > itemToOffer.tradability) {
                            itemToOffer = item;
                        }
                    }
                    requestCounts = items.map(({ count, value }, i) => !value ?
                        0 :
                        itemToOffer.index === i ?
                            count - 1 :
                            count);
                }
            }
            else if (round < this.roundsTillFold) {
                this.log('I wont fold yet');
                requestCounts = makeOfferOfUndesirables(this, this.noValueOfferCount + 1);
            }
            else {
                this.log('Make calculated offer');
                importantIndexedItems.sort((a, b) => a.tradability > b.tradability ? -1 :
                    a.tradability < b.tradability ? 1 :
                        0);
                const { lowestReqValue, } = this;
                const lowReqValueDelta = totalValue - lowestReqValue;
                const reqValue = lowestReqValue + ((roundsLeft / (rounds - 1)) * lowReqValueDelta);
                const offerCountsMap = new Map();
                let estimatedOppositionTotalValue = 0;
                let reqTotalValue = totalValue;
                for (const item of importantIndexedItems) {
                    const { index, count, estOpValue, value, } = item;
                    let estOfferOpValue = estimatedOppositionTotalValue;
                    let offerCount = 0;
                    let possibleReqTotalValue = reqTotalValue;
                    while (offerCount < count &&
                        possibleReqTotalValue - value > reqValue) {
                        offerCount++;
                        estOfferOpValue += estOpValue;
                        possibleReqTotalValue -= value;
                    }
                    offerCountsMap.set(index, offerCount);
                    estimatedOppositionTotalValue = estOfferOpValue;
                    reqTotalValue = possibleReqTotalValue;
                }
                requestCounts = items.map(({ value, count }, i) => {
                    if (!value) {
                        return 0;
                    }
                    const offerCount = offerCountsMap.get(i) || 0;
                    return count - offerCount;
                });
            }
        }
        if (requestCounts) {
            const requestValue = valueCounts(this, requestCounts);
            this.log('requestValue: ' + requestValue);
            this.log('requestCounts: ' + JSON.stringify(requestCounts));
            if (offerValue > requestValue && !roundsLeft) {
                this.log('Accepting offer, value is higher than request value, and it is last round');
                return;
            }
            this.prevRequestCounts = requestCounts;
            this.prevRequestValue = requestValue;
            return requestCounts;
        }
    }
}
module.exports = Agent;
//# sourceMappingURL=main-v6.js.map