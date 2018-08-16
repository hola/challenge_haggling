'use strict'; /*jslint node:true*/

module.exports = class Trader {
    
	constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
		this.max_rounds = max_rounds;
        this.log = log;
        this.total = counts.reduce((acc, val, i) => acc + val * values[i], 0);

		if (this.total)
			this.q = 1/this.total;
		
		this.opp_counts = [];
		this.opp_rates = [];
		this.my_rates = [];

		// First try to grab all valued
		this.greed = this.counts.map((el, i) => (values[i] > 0 ? el : 0));
    }
	
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o) {
			// if it's a last round try to get anything
			if (this.rounds == 0 || this.total == 0) {
				return;
			}			
			// Calculate rates
			o.forEach(function(el, i) {
				this.opp_rates[i] = this.opp_rates[i] || 0;
				this.opp_counts[i] = this.counts[i] - el;
				this.opp_rates[i] = (this.opp_rates[i] + this.opp_counts[i])/(this.max_rounds-this.rounds);
				this.my_rates[i] = this.opp_rates[i]/this.counts[i]*(1 - this.values[i]*this.counts[i]/this.total)
			}, this);
			// try to calculate opposite relative profit
			let opp_subtotal = this.opp_counts.reduce((acc, val, i) => acc + val/Math.max(this.counts[i], 1)*this.total/this.counts.length, 0);
			// my profit
			let my_subtotal = o.reduce((acc, val, i) => acc + val * this.values[i]/this.total, 0);
			// if my profit is higer and there are too less rounds left
			if (this.rounds+1 <= Math.ceil(this.max_rounds/2) && 
				my_subtotal > opp_subtotal) {
				return;
			}	
			// Generating new proposal
			return this.counts.map((el, i) => el - Math.min(el, Math.floor(this.my_rates[i]*this.counts[i])),this);
        }
		else {
			return this.greed;
		}
        return o;
    }
};