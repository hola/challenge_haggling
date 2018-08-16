'use strict'; /*jslint node:true*/

module.exports = class Agent {
	constructor(me, counts, values, max_rounds, log){
		this.counts = counts;
		this.values = values;
		this.rounds = max_rounds;
		this.log = log;
		this.total = this.mulVectors(counts,values);
		this.me = me;
		this.isTest = this.total == 10 && counts.length == 3 && counts.reduce((s,e)=>s+e) == 6;
		if(this.isTest){
			this.bits = [2,2,2];//provide tables for encodeOffer decodeOffer
			this.bits.forEach((e,i,a)=>a[i]=[0,1,2,2,3][this.counts[i]]);
			this.offsetsBit = [this.bits[2]+this.bits[1],this.bits[2],0];
			this.expValues = [,,[,,1.67],[,3.79,1.71,0.93],[,3.76,,,0.62]][counts.reduce((s,e)=>Math.max(s,e))];//define expected values
			this.estValues = this.counts.map((a)=>this.expValues[a]);
			this.wins = [];
			this.oppOffers = [];
			this.ourOffers = [];
			for(let i = (1<<this.bits.reduce((s,e)=>s+e))-1; i >= 0; i--){
				let o = this.decodeOffer(i);
				if(o)this.wins[i] = this.mulVectors(o,values);
			}
		}
	}
	mulVectors(v1,v2){return v1.reduce((s,e,i)=>s+e*v2[i],0)}
	validateOffer(o){for(let i = 0; i < 3; i++)if(o[i]>this.counts[i] || o[i] < 0)return false;return true}
	encodeOffer(o){return o.reduce((s,e,i)=>s+(e<<this.offsetsBit[i]),0)}
	decodeOffer(c){//returns undefined if invalid code
		var o = [0,0,0];
		o.forEach((e,i,a)=>a[i]=(c>>this.offsetsBit[i]) & ((1<<this.bits[i])-1));
		if(this.validateOffer(o))return o;
	}
	deltaOffer(o1, o2){
		let o = this.decodeOffer(o2);
		return this.decodeOffer(o1).reduce((s,e,i)=>s+this.estValues[i]*Math.max(0,e-o[i]),0);
	}
	offer(o){
		this.rounds--;
		if(this.isTest){
			var offerCode = -1;
			if(o){
				offerCode = this.encodeOffer(o);
				if(this.ourOffers.map((e)=>this.wins[e]).reduce((s,e)=>Math.min(s,e),10)<=this.wins[offerCode])return;
				if(this.wins[offerCode]>=4 && this.me && this.rounds==0)return;
				
				if(this.oppOffers.indexOf(offerCode) == -1)this.oppOffers.push(offerCode);
				if(this.oppOffers.length == 1){//use first offer to detect opponents zero valued items
					for(let i = 0; i < o.length; i++){
						var distrK = 1;
						if(o[i] == this.counts[i]){
							distrK = (this.estValues[i] * this.counts[i] == 10)?1:(10 / (10 - this.estValues[i] * this.counts[i]));
							this.estValues[i] = 0;
						}
						this.estValues.forEach((e,j,a)=>a[j] = e * distrK);
					}
				}
			}
			let field = [];
			for(let i in this.wins){
				if(!this.oppOffers.length)field.push({code:i,win:this.wins[i],delta:this.deltaOffer(i,0),o:this.decodeOffer(i)});
				for(let j in this.oppOffers){
					field.push({code:i,win:this.wins[i],delta:this.deltaOffer(i,this.oppOffers[j]),o:this.decodeOffer(i)});
				}
			}
			var wdK = this.rounds-this.me>0?((this.me)?7:8):4;
			field.sort((a,b)=>(a.delta-b.delta) + 0.01*(b.win - a.win));
			let betterField = field.filter((e,i,a)=>{
				let maxWin = 0;
				for(let j=0; j<i; j++)maxWin = Math.max(maxWin,a[j].win);
				return e.win>maxWin && e.win > wdK;
			}).sort((a,b)=>b.win - a.win + 0.01*(a.delta-b.delta)).filter((e,i,a)=>{
				let minDelta = 100;
				for(let j=0; j<i; j++)minDelta = Math.min(minDelta,a[j].delta);
				return e.delta<=minDelta;
			});
			
			let c = betterField[0].code;
			betterField = betterField.filter((e)=>this.ourOffers.indexOf(e.code)==-1);
			c = betterField.length?betterField[0].code:c;
			
			if(offerCode >= 0 && this.wins[offerCode] >= this.wins[c])return;//accept offer if it's not worse than we gonna make
			this.ourOffers.push(c);
			return this.decodeOffer(c);
		}else{
			if(o){
				let sum = this.mulVectors(o,this.values);
				if (sum >= this.total * 0.6)return;
			}
			o = this.counts.map((e,i)=>this.values[i]?e:0);
			return o;
		}
	}
};