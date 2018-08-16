'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log, minimum = false, minimumAccept = false){
        this.counts = counts;
        this.values = values;
		this.roundsTotal = max_rounds;
        this.roundsLeft = max_rounds;
		this.maxToOffer = 0;
        this.log = log;
        this.total = 0;
        this.minimum = false;
        this.minimumAccept = false;
        for (let i = 0; i<counts.length; i++){
            this.total += counts[i]*values[i];
            if((values[i] < this.minimum || !this.minimum) && values[i] !== 0) this.minimum = values[i];
        }
        this.minimumAccept = (this.minimum < this.total)?this.total - this.minimum:this.total;
    }
    offer(o){
        this.roundsLeft--;
		this.maxToOffer = ((this.roundsTotal - this.roundsLeft) + 1)*2;
        if (o){
            let sum = 0;
            for (let i = 0; i<o.length; i++) sum += this.values[i]*o[i];

            if((this.roundsLeft + 1 == this.roundsTotal && sum == this.total) || (this.roundsLeft + 1 < this.roundsTotal && sum >= this.minimumAccept && this.minimumAccept !== 0) || (this.roundsLeft <= 1 && sum > 0)) return;
        }
        o = this.counts.slice();
        for (let i = 0; i<o.length; i++){
			if(!this.values[i] && this.maxToOffer > 0){
				o[i] = o[i] - this.maxToOffer;
				if(o[i] - this.maxToOffer <= 0){
					this.maxToOffer = this.maxToOffer - o[i];
					o[i] = 0;					
				}else{
					o[i] = o[i] - this.maxToOffer;
					this.maxToOffer = 0;
				}
			}
	        else if(this.roundsLeft <= 1 && !this.values[i]) o[i] = 0;
	        else if(this.roundsLeft <= 1 && o[i] - 1 > 0) o[i] = o[i] - 1;
        }
        return o;
    }
};
