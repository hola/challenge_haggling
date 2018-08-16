'use strict'; /*jslint node:true*/

// for /l %x in (1,1,100) do node haggle.js --log=test.log --force comics.js example.js -q --types=3

function sum(arr) {
    return arr.reduce((prev, val) => prev + val, 0);
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.step = 0;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        this.mostWanted = this.values.indexOf(Math.max(...this.values));
        this.unwanted = this.getUnwanted(); 

        this.combinations = this.getCombinations();
        this.possiblePrices = this.getPrices(); // match time
        this.priceProbability = this.getProbability();
        this.mediumPrices = this.getMediumPrices();
        this.unwantedPrice = this.calcOutOffer(this.proposeOnlyUnwanted());

        this.minimalAccept = Math.floor(this.unwantedPrice / 2 + this.total / 3);
        this.allOffers = this.generateOffers();
        this.myOffers =  this.generateMyOffers();

        this.confirm = this.generateAcceptableProfit();
    }

    generateMyOffers() {
        const offers = [];
        const best = this.proposeBestOffer();
        const mid = this.proposeMediumOffer(false);
        const unwanted = this.proposeOnlyUnwanted();

        if (this.counts.length === 5) {
            // the best offers agains example.js with 5 types
            const mid2 = this.proposePreMediumOffer();

            offers.push(unwanted);
            offers.push(this.propose1Good());
            offers.push(mid);
            offers.push(mid2);
            if (this.me === 0) {
                offers.push(best);
            } else {
                offers.push(mid2); // this offer will be not responded
            }
        } else {
            const min = this.proposeMinOffer(true);

            offers.push(unwanted);
            offers.push(best);
            offers.push(mid);
            offers.push(min);
            if (this.me === 0) {
                offers.push(this.proposeMinOffer(false));
            } else {
                offers.push(min); // this offer will be not responded
            }
        }

        return offers.sort((a, b) => {
            if (this.calcMy(this.revertOffer(a)) < this.calcMy(this.revertOffer(b))) {
                return 1;
            }

            if (this.calcMy(this.revertOffer(a)) > this.calcMy(this.revertOffer(b))) {
                return -1;
            }

            return 0;
        });
    }

    generateAcceptableProfit() {
        const accept = [];
        this.myOffers.forEach((offer, index) => {
            const profit = this.calcMy(this.revertOffer(offer));

            if (index === 4) {
                accept.push(this.minimalAccept);
            } else {
                accept.push(profit);
            }
        });

        return accept;
    }

    proposePreMediumOffer() {
        const startValue = Math.floor(this.getBestOffer().sum / 2) - 1;

        return this.proposeMediumOffer(true, startValue);
    }

    proposeMediumOffer(best = true, midValue) {
        if (midValue === undefined) {
            midValue = Math.floor(this.getBestOffer().sum / 2);
        }

        if (midValue === this.total) {
            return this.proposeOnlyUnwanted();
        }

        const midls = this.allOffers.filter(obj => obj.myProfit === midValue);

        if (!midls[0]) {
            return this.proposeMediumOffer(best, midValue + 1);
        }

        const hisProfit = best ? 
            Math.max.apply(Math, midls.map(function(o){return o.hisProfit;})) :
            Math.min.apply(Math, midls.map(function(o){return o.hisProfit;}));

        return midls.find(function(o){ return o.hisProfit == hisProfit; }).offer;
    }

    propose1Good() {
        const offer = this.proposeOnlyUnwanted();
        const minPrice = this.values.reduce((prev, val) => val < prev && val !== 0 ? val : prev, Infinity);        
        const minPriceIndex = this.values.indexOf(minPrice);

        if (Number.isFinite(minPrice)) {
            offer[minPriceIndex]++;
        }

        if (this.calcMy(this.revertOffer(offer)) >= this.minimalAccept) {
            return offer;
        }
        
        return this.proposeOnlyUnwanted();
    }

    proposeMinOffer(best = true, minValue = this.minimalAccept) {
        const minimals = this.allOffers.filter(obj => obj.myProfit === minValue);

        if (!minimals[0]) {
            return this.proposeMinOffer(best, minValue + 1);
        }

        const hisProfit = best ? 
            Math.max.apply(Math, minimals.map(function(o){return o.hisProfit;})) :
            Math.min.apply(Math, minimals.map(function(o){return o.hisProfit;}));

        return minimals.find(function(o){ return o.hisProfit == hisProfit; }).offer;
    }

    proposeOnlyUnwanted() {
        return this.counts.map((val, index) => this.unwanted.indexOf(index) === -1 ? 0 : val);
    }

    proposeBestOffer() {
        return this.getBestOffer().offer;
    }

    getBestOffer() {
        const maxSum = Math.max.apply(Math, this.allOffers.map(function(o){return o.sum;}));

        return this.allOffers.find(function(o){ return o.sum == maxSum; });
    }

    generateOffers() {
        return this.addProductToOffers().map(offer => {
            const myProfit = this.calcMy(this.revertOffer(offer));
            const hisProfit = this.calcOutOffer(offer);

            return {
                offer,
                myProfit,
                hisProfit,
                sum: myProfit + hisProfit,
                acceptable: this.hasAllUnwanted(offer) && myProfit >= this.minimalAccept,
            }
        }).filter(obj => obj.acceptable);
    }

    hasAllUnwanted(o) {
        this.unwanted.forEach(unwantedIndex => {
            if (this.counts[unwantedIndex] > o[unwantedIndex]) {
                return false;
            }
        });

        return true;
    }

    revertOffer(o) {
        return o.map((count, index) => this.counts[index] - count);
    }

    addProductToOffers(offers = [[]], index = 0) {
        if (index >= this.counts.length) {
            return offers;
        }

        const newOffers = [];

        offers.forEach(offer => {
            let i = -1;
            while(++i <= this.counts[index]) {
                const newOffer = offer.slice(0);
                newOffer.push(i);
                newOffers.push(newOffer);
            }
        });

        return this.addProductToOffers(newOffers, index + 1);
    }

    calcOutOffer(o) {
        return sum(o.map((count, index) => count * this.mediumPrices[index]));
    }

    getMediumPrices() {
        return this.priceProbability.map(prices => sum(prices.map((price, index) => price * index)));
    }

    getUnwanted() {
        const ret = [];
        this.values.forEach((val, index) => {
            if(val === 0) {
                ret.push(index);
            }
        });
        return ret;
    }

    getProbability() {
        const sums = this.possiblePrices.map(sum);
        return this.possiblePrices.map((prices, index) => {
            return prices.map(count => count / sums[index]);
        })
    }

    getPrices() {
        const prices = [];
        let k = this.counts.length
        while(k--) {
            const product = [];
            product.length = this.total + 1;
            product.fill(0);
            prices.push(product);
        }
        

        this.combinations.forEach(combination => {
            combination.forEach((price, index) => {
                let j = -1;
                while(++j <= this.total) {
                    if (parseInt(price) === j) {
                        prices[index][j]++;
                    }
                }
            });
        });

        return prices;
    }

    getCombinations() {
        const combinations = this.combine();
        const valuesStr = this.values.toString();

        // exlude my combination
        let i = combinations.length;
        while(i--) {
            combinations[i];
            if (combinations[i].toString() === valuesStr) {
                combinations.splice(i, 1);
                break;
            }
        }

        return combinations;
    }

    combine(resultBegin = [], amount = this.total) {
        const maxLength = this.counts.length;

        if (resultBegin.length === maxLength) {
            if (this.calc(this.counts, resultBegin) === this.total) {
                return [resultBegin];
            } else {
                return false;
            }
        }

        const fullResults = [];

        const array = [];
        array.length = maxLength - resultBegin.length;
        array.fill(amount);

        while(sum(array) > 0) {
            for (let i = 0; array.length; i++) {
                if (array[i] !== 0) {
                    const countsIndex = i + resultBegin.length;
                    if (array[i] % this.counts[countsIndex] === 0) {
                        const zeros = [];
                        zeros.length = i;
                        zeros.fill(0);
                        zeros.push(array[i] / this.counts[countsIndex]);
                        const newResult = resultBegin.slice(0).concat(zeros);
                        const rest = amount - array[i];

                        if (rest === 0) {
                            while (newResult.length < maxLength) {
                                newResult.push(0);
                            }
                        }
                        const results = this.combine(newResult, rest);
                        
                        if (results !== false) {
                            fullResults.push(...results);
                        }
                    }

                    array[i]--;
                    
                    break;
                }
            }            
        }

        return fullResults;
    }

    offer(o){
        const iGet = this.calcMy(o);

        if (this.checkOffer(iGet)) {
            return;
        }

        const offer = this.revertOffer(this.myOffers[this.step]);

        this.rounds--;
        this.step++;

        return offer;
    }

    calc(o, prices) {
        return sum(o.map((val, i) => val * prices[i]));
    }

    calcMy(o) {
        if (typeof o !== 'undefined') {
            return this.calc(o, this.values);
        }

        return 0;
    }

    checkOffer(val) {
        return val >= this.confirm[this.step];
    }
};
