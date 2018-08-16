'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.roundsRemaining = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];
        
        this.minimal = counts.map((count, index) => {
        	if (values[index] > 0) {
        		return count;
        	}
        	return 0;
        });
        this.log(`Counts ${this.counts}`);
        this.log(`Values ${this.values}`);
        this.log(`Minimal ask to achieve total ${this.minimal}: ${this.total}`);
        this.totalItemCount = this.counts.reduce((a, b) => a + b, 0);
        this.totalAskCount = this.minimal.reduce((a, b) => a + b, 0);
        this.isUnreasonableAsk = this.totalItemCount === this.totalAskCount;
        this.log(`Is ask unreasonable ${this.isUnreasonableAsk}`);
        
        this.iHaveTheLastOffer = me === 1;
    }
    offer(o){
    	this.roundsRemaining--;
    	
    	if (o === undefined) {
    		return this.minimal;
    	}
    	
    	const intermediateSums = o.map((count, index) => {
    		return count*this.values[index];
    	});
    	const offerTotal = intermediateSums.reduce((a, b) => a + b, 0);
    	this.log(`Total sum of offer determined to be ${offerTotal}, compared with max of ${this.total}`);
    	
    	if (this.isUnreasonableAsk) {
    		if (offerTotal >= this.total*0.75) {
    			return undefined;
    		}
    	}
    	
    	if (offerTotal >= this.total) {
    		return undefined;
    	}
    	
    	this.log(`Rounds remaining ${this.roundsRemaining} iHaveLastOffer ${this.iHaveTheLastOffer}`);
    	if (this.roundsRemaining === 0 && this.iHaveTheLastOffer) {
    		if (offerTotal >= this.total*0.75) {
    			return undefined;
    		}
    	}
    	
    	return this.minimal;
    }
};
