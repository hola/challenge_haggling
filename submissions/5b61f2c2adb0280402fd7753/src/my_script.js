module.exports = class Agent { //Cinderella strategy
    constructor(me, counts, values, max_rounds, log){
		
		this.me_first=!!me;
        this.counts = counts;
        this.counts_cl = counts.slice(0);// I'm using original counts later so that'd be a bit uncomfy to alter it
        this.values = values;
		this.max_rounds=max_rounds;
        this.round_no = 0;
        this.log = log;
		this.log = e => 0; // Just in case...
		this.best_opp_offer=null;
        this.total = 0;
		this.total_item_count = 0;		
				
		this.min_proposal_total_percentage = 0.55;// just a rough estimation: we suppose, that deals, where we can't get at least 55% are harmful for us in a long run. That's not actually true, yet...
		this.min_autoaccept_total_percentage=0.7;// we assume that any deal with more than 80% profit is good enough. That's not actually true, yet...
		this.last_round_min_percentage=0.5;// the last-round-deal-offer should be at least this high for us to desperately accept. The weak spot of the strategy, however we assume, that most of the strategies will try seek for compromise.
		
        for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
			this.total_item_count += counts[i];
		}
		
		//this.log(JSON.stringify({mintotal_for_props:this.total*0.5}));
		
        this.proposals=this.gen_proposals(this.counts_cl,values,this.total*this.min_proposal_total_percentage); 
		
		while (this.proposals.length<4) {
			this.proposals.unshift(JSON.parse(JSON.stringify(this.proposals[0])));
		}
		
		this.log(JSON.stringify({proposals:this.proposals}));
		this.log(JSON.stringify({counts:counts,values:values}));
		this.log('-----------------------------');
		
    }
    gen_proposals(counts,values,min_total) { 
	
		// Pure stupid bruteforce. At some larger [count] values this will stop fitting into "1 second per step" frame, yet for current parameters its' ok.
		// There surely is a better way to do this
		// All the value calculations could be done on the generation stage, yet...
		
		//TODO: Do something about too deterministic outcomes, when my proposals are something like 2 : one with total of 10 and the second one is with total of 6
		
        let tmp = gen (counts.shift(),counts);
		//this.log(JSON.stringify({before_filter:tmp})); 
		
		tmp = tmp.filter(e=>{  //We are honest: we don't offer deals, that ask for all the items (that's useless against any sensible strategy) and we never ask for zero-cost items 
			let total = 0;
			let total_item_count =0;
			let proposal_contains_zerocost_stuff=false;
			
			for (let i=0;i<e.length;i++) {
				total+=e[i]*values[i];
				total_item_count += e[i];
				if (e[i]>0 && values[i]==0)
					proposal_contains_zerocost_stuff=true;
			}
			//this.log(JSON.stringify({prop:e,total:total,min_tot:min_total}));
			
			if (total>=min_total && !proposal_contains_zerocost_stuff && total_item_count < this.total_item_count)
				return true;
			
			
			return false;
		});
		//this.log(JSON.stringify({after_filter:tmp})); //debugging... got a stupid mistake in the filter function. silly me
		
		let final_proposals=[];
		for (let i=0;i<tmp.length;i++) {
			final_proposals.push({offer:tmp[i], total: tmp[i].reduce(((acc,cur,j)=> acc+=cur*values[j]),0),total_item_count: tmp[i].reduce(((acc,cur,j)=> acc+=cur),0)});
		}
		
		return final_proposals.sort ((a,b)=> {
			if (a.total==b.total) 
				return a.total_item_count<b.total_item_count;
			else
			return a.total<b.total;
		})
		
		
    }
    offer(o){
        this.round_no++;
		this.log('HEAVEN OR HELL... ROUND ' + this.round_no + '!')
        if (o)
        {
			
			
			var sum = 0;
			for (let i = 0; i<o.length; i++)
                sum += this.values[i]*o[i];
			
			this.log(JSON.stringify({opponent_is_offering:{offer:o,total:sum}}));
			
			if (this.best_opp_offer == null || this.best_opp_offer.total<=sum)
				this.best_opp_offer = {offer:o,total:sum};
			
			this.log(JSON.stringify({OPPONENT_BEST_OFFER:this.best_opp_offer}));
			
			if (this.round_no==1) {//we never accept the first deal unless its' a most profitable deal we can offer ourselves
				if (sum >= this.proposals[0].total) {
					this.log('I ACCEPT THE FIRST DEAL CUZ YOU OFFERED ME MY MOST PROFITABLE OFFER OR BETTER');
					return;
				}
				
				this.log('first deal not accepted as not generous enough');
			} else {
				if (sum>=this.total*this.min_autoaccept_total_percentage) { //autoaccept deals with a decent profit 
					this.log('I AUTOACCEPT YOUR DEAL CUZ IT SEEMS GENEROUS ENUFF');
					return;
				}
			}
			
        }
		
		if (this.round_no==this.max_rounds) {//on the last round 
			this.log('LAST ROUND!');
			
			if (this.me_first && this.best_opp_offer.total>=this.total*this.min_proposal_total_percentage) { //offer the opponent his best deal if the deal is at least somewhat acceptable
				this.log('I OFFER YOU YOUR BEST DEAL BACK'); 
				o = this.best_opp_offer.offer;
				// That's pretty strange: some of strategies in the sandbox don't accept back their own deals.
				return o;
			}
			
			if (!this.me_first && sum >=this.total*this.last_round_min_percentage) { //or accept any somewhat worthwile last-deal
				this.log('I ACCEPT YOUR LAST DEAL CUZ ITS PLAUSIBLE ::: more than ' + this.last_round_min_percentage + ' percent profit');
				return; // TODO: the weakest strategy spot... Use the median profit value in conjunction with the fixed one?
			}
			
			this.log('FKU, U HAVENT PROPOSED ANY INTERESTING DEALS AT ALL, ILL OFFER YOU MY STANDART DEAL INSTEAD');
		}
		
		//otherwise just offer smth
		
		
		if (this.proposals[this.round_no-1]) {
			o = this.proposals[this.round_no-1].offer;
			this.log(JSON.stringify({I_M_OFFERING:this.proposals[this.round_no-1]}));
		} else {
			this.log('FKU, IVE RAN OUT OF PROPOSALS, ILL THROW AT YOU MY MOST GENEROUS ONE');
			o = this.proposals[this.proposals.length-1].offer;
			this.log(JSON.stringify({I_M_OFFERING:this.proposals[this.proposals.length-1]}));
		}
		
		return o;
        
    }
};
 
 
 
 
function gen (cur_max,rest_counts) { //best coding practices: helpers outside of the class
            let result = [];
            if (rest_counts.length>0) {
                var tmp = gen(rest_counts.shift(),rest_counts);    
                for (let i=0;i<=cur_max;i++)
                    for (let j = 0;j<tmp.length;j++)
                        result.push( [i].concat(tmp[j]));
            } else {
                for (let i=0;i<=cur_max;i++)
                    result.push(i);
            }
            return result;
        }