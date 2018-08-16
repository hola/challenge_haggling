'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
		this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
		this.count = 0;
        
		for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
			this.count += counts[i];
		}	
    }
    
	offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        let sum = 0;
		
		if (o) {
			let count = 0;
            
			for (let i = 0; i<o.length; i++) {
                sum += this.values[i]*o[i];
				count += o[i];
			}
            //if (sum>=this.total/2) return;
            if (sum >=7 || count >= this.count-1) return; //accept if enemy keeps only one item
			
			if (this.rounds == 0 && this.me != 0 && sum>0) {
				this.log("Accept last proposition");
				return;
			}
        }
        
		o = this.counts.slice();
		
		let count = 0;
        let cheapest_item_pos = -1;
		let min_value = this.total;
		let lost_sum = 0;
		
		for (let i = 0; i < o.length; i++) {
            if (!this.values[i]) {
                count += o[i];
				o[i] = 0;
			}
			else if (o[i] && min_value > this.values[i]) { //find cheapest item with price >0
				min_value = this.values[i];
				cheapest_item_pos = i;
			}
        }
		
		if ( (count == 0 || this.rounds == 0) && cheapest_item_pos >= 0) {
			if (min_value == 1) {
				this.log("Offer all items with price=1");
				lost_sum = o[cheapest_item_pos];
				o[cheapest_item_pos] = 0;
			}
			else {
				this.log("Offer one item with price>1");
				lost_sum = this.values[cheapest_item_pos];
				o[cheapest_item_pos]--;
			}
		}
		
		if (sum >= this.total - lost_sum) {
			return;
		}
			
        return o;
    }
};
