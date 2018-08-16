'use strict'; /*jslint node:true*/

function genAllOffers(c, v){//actually *almost* all
	var r = [];
	var tv = x(c,v);
	var ti = c.reduce((a,i)=>a+i);
	var o = c.map((a,i)=>v[i]?a:0);
	var itemsMax = o.reduce((a,i)=>a*=(i+1),1);
	for(var i = 0; i < itemsMax; i++){
		var o1 = o.slice();
		var div = i;
		for(var j = 0; j < o.length; j++){
			var divisor = 1;
			for(var k =j+1;k<o.length;k++)divisor*=(o[k]+1);
			o1[j] = (div / divisor) | 0;
			div = div % divisor;
		}
		r.push({o:o1,v:x(o1,v),c:o1.reduce((a,i)=>a+i)});
	}
	return r.filter((a)=>(a.v>=0.4*tv && a.c < ti)).sort((a,b)=>b.v==a.v ? a.c-b.c : b.v-a.v);
}
function dist(a, b, c, v){//distance between a(our offer) & b(opponent offer) with respect to the c(ounts) and v(alues)
	var d = 0;
	//consider distance = 0 if we offer more than opponent wants
	//consider distance = 0 if we have zero value for it (we can give it all)
	for(var i = 0; i < a.length; i++)d += v[i] ? (Math.max(0,a[i]-b[i])/c[i]) : 0;
	return d;
}
function x(a, b){//scalar mul a[]*b[]
	var s = 0;
	if(!a.length || !b.length || a.length != b.length)return s;
	for(var i = 0; i < a.length; i++)s += a[i] * b[i];
	return s;
}

function scanForMaxValOffer(a, b){//compare .v
	return (b === undefined) || a.v >= b.v;
}

function scanForMinValOffer(a, b){//compare .v
	return (b === undefined) || a.v <= b.v;
}

function scanForSameOffer(a, b){//compare .o
	if(!a.o || !b || !b.o)return false;
	for(var i in a.o)if(a.o[i] != b.o[i])return false;
	return true;
}

function scanArray(a, scanFunction, scanValue){//return index in array or -1
	var res = -1;
	var noScanValue = scanValue ? 0 : 1;//keep scanValue unchanged if receieved it from caller
	for(var i in a){
		if(scanFunction(a[i], scanValue)){
			res = i;
			if(noScanValue)scanValue = a[i];
		}
	}
	return res;
}

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
			this.me = me;
			this.counts = counts;
			this.values = values;
			this.allOffers = genAllOffers(counts, values);
			this.rounds = max_rounds;
			this.max_rounds = max_rounds;
			this.total = x(counts, values);
			this.toUsOffers = [];//{o:offer[],v:valueAsShareOfTotal}
			this.ourOffers = [];//{o:offer[],v:valueAsShareOfTotal}
    }
		makeOffer(harder){//0 to 1, 0 - soft, 1 - hard
			if(this.toUsOffers.length == 0){
				return this.allOffers[0].o.slice();//our best with reasonabe rebate
			}
			
			this.allOffers.sort((a,b)=>b.d!=a.d ? a.d-b.d : b.v-a.v);
			var bo = [];
			var lastV = this.allOffers[0].v;
			var lastD = this.allOffers[0].d;
			this.allOffers.forEach((a)=>{
				if(a.d != lastD){
					lastV = a.v;
					lastD = a.d;
					bo.push(a);
				}else if(a.v == lastV)bo.push(a)
			});
			bo.sort((a,b)=>b.v==a.v ? a.d-b.d : b.v-a.v);
			var thresholdV = harder * this.total;
			
			for(var i = 0; i < bo.length; i++){//first try to make unique offer
				if(bo[i].v >= thresholdV && scanArray(this.ourOffers, scanForSameOffer, bo[i]) == -1)return bo[i].o.slice();
			}
			
			for(var i = 0; i < bo.length; i++){//fall back to the old offers
				if(bo[i].v >= thresholdV)return bo[i].o.slice();
			}
			
			return bo[0].o.slice();
		}

    offer(o){
			var offeredByOpponent = 0;
			var bestToUsOfferIndex = -1;
			if(o){
				offeredByOpponent = x(o, this.values) / this.total;
				if (offeredByOpponent == 1)return;//got maximum - nice!!!
				
				this.toUsOffers.push({o:o,v:offeredByOpponent});
				
				bestToUsOfferIndex = scanArray(this.toUsOffers,scanForMaxValOffer);
				var worstOurOfferIndex = scanArray(this.ourOffers,scanForMinValOffer);
				
				if(worstOurOfferIndex > -1 && this.ourOffers[worstOurOfferIndex].v <= offeredByOpponent)return;//got not less than wanted
				
				//recalc distances to the best received offer
				this.allOffers.forEach((a)=>a.d = dist(a.o,this.toUsOffers[bestToUsOfferIndex].o,this.counts,this.values));
			}
			
			if((this.rounds - this.me) == 1){//last offer possibility
				if(this.me){//we can accept or make offer that still matters
					if(offeredByOpponent >= 0.6)return;
					o = this.makeOffer(0.5);
				}else{//our final offer
					o = this.makeOffer(0.4);
				}
			}else if(this.rounds == 1 && this.me){//got final offer: accept or reject
				if(offeredByOpponent >= 0.4)return;
				o = this.counts.slice();//reject
			}else{//routine trade
				o = this.makeOffer(0.8);
			}
			
			var weOfferVal = x(o, this.values) / this.total;
			if(offeredByOpponent >= weOfferVal)return;
			if(bestToUsOfferIndex > -1 && this.toUsOffers[bestToUsOfferIndex].v >= weOfferVal){//better use opponent version
				o = this.toUsOffers[bestToUsOfferIndex].o;
				weOfferVal = this.toUsOffers[bestToUsOfferIndex].v;
			}
			this.ourOffers.push({o:o.slice(),v:weOfferVal});
			this.rounds--;
			return o;
    }
};