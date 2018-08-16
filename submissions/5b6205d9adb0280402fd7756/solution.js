'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
		this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
		
		this.my_lost_sum = 0;
		this.round_number = 0;
		this.max_sum = 0;
		
		this.items = [];
		
        for (let i = 0; i < counts.length; i++) {
            this.total += counts[i]*values[i];
		
			for (let j = 1; j <= counts[i]; j++) { //make array of single items, then sort it ascending by price
				this.items.push( {price: values[i], pos: i, count:counts[i]});
			}
		}
		
		this.items.sort(function(a, b) { return a.price - b.price } );
		
		this.log(`Me: ${this.me}`);
		this.log(`${this.items.length} items total`);
		
		for (let i = 0; i < this.items.length; i++) {
			this.log(`pos:${this.items[i].pos} price:${this.items[i].price}`);
		}
		
    }
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        this.round_number++;
		
		let offered_sum = 0;
		
		if (o) {
            let sum = 0;
            let count = 0;
			
			for (let i = 0; i<o.length; i++) {
                sum += this.values[i]*o[i];
				count += o[i];
			}
            
			if (sum >= 8) { 
				return;
			}
			if (sum >= this.total-this.my_lost_sum) {
				this.log(`Accept enemy offer >= my lost sum:${this.my_lost_sum}`);
				return;
			}
			if (this.rounds <= 1 && sum && this.max_sum <= sum - this.rounds) {
				this.log("Enemy probably will not offer more :(");
				//return;
			}
			if (this.max_sum <= sum) {
				this.max_sum = sum;
			}
			if (this.rounds <= 0 && sum >= 1) {
				if (this.me != 0) {
					this.log("Last chance, I have to accept to get at least something :(");
					return;
				}
				this.log(`Enemy keeps items: ${this.items.length-count}`);
				
				if (count >= this.items.length-1) {
					return;
				}
				if (sum >= this.total/2) {
					//??? return;
				}				
			}
			
			offered_sum = sum;
        }
        
		o = this.counts.slice();
		
		let items = this.items;
		let count = 0;
		let junk_count = 0;
		this.my_lost_sum = 0;
		
		for (let i = 0; i < items.length; i++) { //do not be greedy - offer all junk
			if (items[i].price == 0) {
				o[ items[i].pos ]--;
				junk_count++;
				this.log(`Offered junk:${items[i].pos}, Round number: ${this.round_number}`);
			}
			else {
				break;
			}
			if (this.round_number == 1 && i==1) { //leave some junk for second offer
				return o;
			}
			if (this.round_number == 2 && i==2 && items[ items.length-1 ].price >= this.total-1) { 
				return o;
			}
			if (this.round_number == 2 && i==3) { //leave some junk for second offer
				return o;
			}
		}

		if (this.round_number == 1 && items[0].price == 0) {
			return o; //offer only junk at first round
		}
		if (items[ items.length-1 ].price >= this.total) { //only last item is valuable, all other items are junk
			return o; 
		}
		
		let sum = 0;
		
		for (let i = 0; i <= items.length-1; i++) { //offer valuable items one per round exept the last - most valuable one
			if (items[i].count == 1 && !items[i].offered && items[i].price > 0) {
				if (i < items.length-1 || (items[i].price < this.total/2 && junk_count==0) ) { //offer last item only if it not very valuable
					items[i].offered = this.round_number;
					o[ items[i].pos ]--;
					count++;
					sum += items[i].price;
					
					this.log(`Offered single item:${items[i].pos}, Round number: ${this.round_number}`);
					break;
				}
			}
		}

		if (count) {
			this.my_lost_sum = sum;
			this.log(`Lost sum:${this.my_lost_sum}`);
			
			if (this.total-sum <= offered_sum) {
				return;
			}
			
			return o; //offer junk and one other item 
		}
		
		let j=-1;
		let prev=-1;
		
		for (let i = 0; i < items.length; i++) {
			if (items[i].price>=4 && this.rounds>=2) {
				this.log("Do not offer pricy items until last round");
				break;
			}
			if (items[i].price>=4 && this.rounds>=1 && this.me==0) {
				this.log("Do not offer pricy items until last round");
				break;
			}
			if (items[i].price>0 && items[i].price<8) {
				count++;
				o[ items[i].pos ]--;
				
				sum += items[i].price;
				
				prev = j;
				j = i;
				
				this.log(`Offered item:${items[i].pos}, Round number: ${this.round_number}`);
			}
		
			if (i + this.rounds >= items.length-1) {
				break;
			}
			if (items[i].price==1 && items.length>3 && items[3].price==1 && count <= this.round_number) {
				this.log("Offer more cheap items");
				continue;
			}	
			if (count >= this.round_number) {
				break;
			}
		}
		
		if (sum >= this.total) { //offered all items - try give up most valuable item and keep other items
			for (let i = 0; i <= items.length-2; i++) {
				let j = items.length-2 -i;
				
				if (items[j].price <= 0) {
					break;
				}	
				this.log(`Removed item:${items[j].pos}, Round number: ${this.round_number}`);
				o[ items[j].pos ]++;
				sum -= items[j].price;
			}
		}
		else if (sum >= 7 && prev>=0) { //offered too much
			this.log(`Removed item:${items[prev].pos}, Round number: ${this.round_number}`);
			o[ items[prev].pos ]++;
			sum -= items[prev].price;			
		}
		
		this.my_lost_sum = sum;
		this.log(`Lost sum:${this.my_lost_sum}`);
		
		if (this.total-sum <= offered_sum) {
			return;
		}
		
        return o;
    }
};
