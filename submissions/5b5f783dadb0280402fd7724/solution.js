'use strict'; /*jslint node:true*/

function avgShares(a,c){//calcs shares using c(ounts) then averages array of proposalsGot
	var res = [];
	for(var i = 0; i < c.length; i++){
		var share = 0;
		for(var j = 0; j < a.length; j++)share += c[i]-a[j].o[i];
		res.push(share / (c[i] * a.length))
	}
	//return res;
	return norm(res);
}

function norm(a){
	var sr = a.reduce((b,v)=>b+v);
	if(sr)return a.map((v)=>v/sr);
	else return a;
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
			this.me = me;
			this.counts = counts;
			this.values = values;
			this.rounds = max_rounds;
			this.max_rounds = max_rounds;
			this.total = this.evaluate(counts);
			this.partnerValues = [];
			this.proposalsGot = [];
			this.madeProposals = [];
			this.itemsCount = counts.reduce((a,v) => a+v);
			this.initSupposedValue = this.total / this.itemsCount;
			for (var i = 0; i < counts.length; i++){
				this.partnerValues[i] = this.initSupposedValue;
			}
			this.partnerWants = [];
			
    }
		prepBestOffer(){
			var o = this.counts.map((a,i)=>this.values[i]?a:0);
			var changed = 1;
			while(changed){
				changed = 0;
				var maxDifferenceIndex = -1;
				for(var i = 0; i < o.length; i++){
					if(o[i] && ((maxDifferenceIndex == -1) ||
						(this.partnerValues[i] - this.values[i] >
						this.partnerValues[maxDifferenceIndex] - this.values[maxDifferenceIndex]))){
						maxDifferenceIndex = i;
					}
				}
				if(this.partnerValues[maxDifferenceIndex] > this.values[maxDifferenceIndex] && o[maxDifferenceIndex]){
					o[maxDifferenceIndex] -= (o[maxDifferenceIndex] <=2)?1:2;
					changed = 1;
				}
				if(this.madeProposals.indexOf(JSON.stringify(o))==-1)break;
			}
			return o;
		}
		adjustOffer(o,wanted){
			var ourValue = this.evaluate(o);
			while(ourValue < wanted * this.total){
				var minDifferenceIndex = -1;
				for(var i = 0; i < o.length; i++){
					if(this.values[i] && o[i] < this.counts[i] && ((minDifferenceIndex == -1) ||
						(this.partnerValues[i] - this.values[i] <
						this.partnerValues[minDifferenceIndex] - this.values[minDifferenceIndex]))){
						minDifferenceIndex = i;
					}
				}
				if(minDifferenceIndex >= 0){
					o[minDifferenceIndex]++;
					ourValue += this.values[minDifferenceIndex];
				}
			}
			return o;
		}
		mutateOffer(o,wanted){
			var ourValue = this.evaluate(o);
			var wantedValue = wanted * this.total;
			for(var i = 0; i < o.length; i++){
				if(o[i] < this.counts[i] && this.values[i]){
					ourValue += this.values[i];
					o[i]++;
				}
				if(ourValue >= wantedValue && this.madeProposals.indexOf(JSON.stringify(o))==-1)break;
				else ourValue -= this.values[i];
			}
			return o;
		}
		rebateOffer(wanted){//move toward partner
			var o = this.madeProposals.length ? JSON.parse(this.madeProposals[0]):this.counts.map((a,i)=>this.values[i]?a:0);
			var ourValue = this.evaluate(o);
			var wantedValue = wanted * this.total;
			for(var i = 0; i < this.madeProposals.length; i++){
				var ow = JSON.parse(this.madeProposals[i]);
				var ov = this.evaluate(ow);
				if(ov < ourValue && ov > wantedValue){
					o = ow;
					ourValue = ov;
				}
			}
			var bestGotProposalIndex = 0;
			for(var i = 1; i < this.proposalsGot.length; i++){
				if(this.proposalsGot[i].v >= this.proposalsGot[bestGotProposalIndex].v)bestGotProposalIndex = i;
			}
			var bo = this.proposalsGot[bestGotProposalIndex].o;
			if(this.evaluate(bo) >= wantedValue)return bo;
			for(var i = 0; i < o.length; i++){
				for(var j = 1; o[i] - j >= bo[i] && ourValue - j * this.values[i] >= wantedValue; j++){
					o[i]-=j;
					if(this.madeProposals.indexOf(JSON.stringify(o))>-1)o[i]+=j;
					else {
						ourValue -= j*this.values[i];
						break;
					}
				}
			}
			if(this.madeProposals.indexOf(JSON.stringify(o))>-1){
				o = this.counts.map((a,i)=>this.values[i]?a:0);
				ourValue = this.evaluate(o);
				for(var i = 0; i < o.length; i++){
					for(var j = 1; o[i] >=j && ourValue - j * this.values[i] >= wantedValue; j++){
						o[i]-=j;
						if(this.madeProposals.indexOf(JSON.stringify(o))>-1)o[i]+=j;
						else {
							ourValue -= j*this.values[i];
							break;
						}
					}
				}				
			}
			return o;
		}
		evaluate(o,v){
			v = v || this.values;
			var r = 0;
			for(var i = 0; i < o.length; i++){
				r += o[i]*v[i];
			}
			return r;
		}
    offer(o){
			var offeredValue = 0;
			if(o){
				offeredValue = this.evaluate(o) / this.total;
				if (offeredValue >= 0.8)
					 return;
				
				this.proposalsGot.push({o:o,v:offeredValue});
				this.partnerWants = avgShares(this.proposalsGot,this.counts);
				
				for (var i = 0; i < o.length; i++){//extract info from offers
					this.partnerValues[i] = this.total * this.partnerWants[i] / this.counts[i];
				}
				for (var i = 0; i < 0*o.length; i++){//adjust for possible bias on "free" items
					if(this.partnerValues[i] && this.values[i] == 0 && this.rounds != this.max_rounds){
						//partner request for this item must already count in our zero value for it
						
						var valIncrement = Math.max(0,this.partnerValues[i]-1) * this.counts[i];
						this.partnerValues[i] = 1;//suppose partner has minimal value for this item
						//distribute this valIncrement across all non-free items
						var notfreeItems = 0;
						
						for(var j = 0; j < o.length; j++){
							if(j != i && this.values[j])notfreeItems+=this.counts[j];
						}
						
						valIncrement /= notfreeItems;
						
						for(var j = 0; j < o.length; j++){
							if(j != i && this.values[j])this.partnerValues[j] += valIncrement;
						}							
					}
				}
			}
			
			if(this.rounds == this.max_rounds){//initial offer
				var lowestValueIndex = 0;
				var nonZeroCount = this.counts.length;
				o = this.counts.slice();
				for (var i = 0; i<o.length; i++){
					if (!this.values[i]){
						o[i] = 0;
						nonZeroCount--;
						if(lowestValueIndex == i)lowestValueIndex++;
					}else	if(this.values[i]/this.counts[i] <= this.values[lowestValueIndex]/this.counts[lowestValueIndex])
						lowestValueIndex = i;
				}
				if(lowestValueIndex < o.length && nonZeroCount > 1 &&
					this.counts[lowestValueIndex] > 1 && this.partnerValues[lowestValueIndex] &&
					this.values.indexOf(this.values[lowestValueIndex]) == lowestValueIndex)
					o[lowestValueIndex] = this.counts[lowestValueIndex] - 1;
			}else if((this.rounds - this.me) == 1){//last chance to offer or to accept non-ultimate offer
				if(this.me){//accept or offer something acceptable
					if(offeredValue >= 0.6)return;
					var bestGotProposalIndex = 0;
					for(var i = 1; i < this.proposalsGot.length - 1; i++){
						if(this.proposalsGot[i].v >= this.proposalsGot[bestGotProposalIndex].v)bestGotProposalIndex = i;
					}
					if(this.proposalsGot[bestGotProposalIndex].v >= 0.6)o = this.proposalsGot[bestGotProposalIndex].o;
					else{
						//create our offer, take at least 0.5
						o = this.mutateOffer(o,0.5);
						if(this.evaluate(o)/this.total < this.proposalsGot[bestGotProposalIndex].v)o = this.proposalsGot[bestGotProposalIndex].o;
					}
				}else{//make an ultimatum offer
					for (var i = 0; i < o.length; i++){
						var fairShare = (this.values[i] + this.partnerValues[i])?this.values[i] / (this.values[i] + this.partnerValues[i]):0;
						o[i] = Math.round(this.counts[i] * fairShare);
					}
				}
			}else if(this.rounds == 1 && this.me){//got ultimatum
				if(offeredValue >= 0.4)return;
				o = this.counts.slice();//reject abusing offers
			}else{
				o = this.prepBestOffer();
				if(this.madeProposals.indexOf(JSON.stringify(o))>-1){
					o = this.rebateOffer(0.6);
				}
			}
			if(offeredValue*this.total>=this.evaluate(o))return;
			this.madeProposals.push(JSON.stringify(o));
			this.rounds--;
			return o;
    }
};