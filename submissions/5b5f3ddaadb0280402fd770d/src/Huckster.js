// partner = opponent
module.exports = class Huckster {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.max_rounds = max_rounds;
        this.roundNum = 0;
        this.log = log;
        this.total = 0;
        this.logLevel = 0;
        this.opponentOffers = [];        
        for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
            if (this.logLevel)  this.log(`${i} count = ${counts[i]} value = ${values[i]}`);
        }
        this.bestOpponentOfferRoundNum = 0;
        this.bestOpponentOffer = 0;
        this.orderedValues = [];
        for (let i = 0; i<counts.length; i++) {
            this.orderedValues.push({ 'i' : i, 'v' : values[i]});
        }
        this.orderedValues.sort(function(a,b) {
            return (a.v > b.v) ? 1 : ((b.v > a.v) ? -1 : 0);} );                        
            
        this.giveIndex = 0;
        this.giveCount = 0;
        this.hasValueForOpponent = [];
        this.opponentLessSignificans = [];
        for (let i = 0; i < counts.length; i++) {
            if (this.logLevel) this.log(`Ordered values i = ${this.orderedValues[i].i} V = ${this.orderedValues[i].v}`);             
            this.opponentLessSignificans[i] = { 'i' : i, 'uselessness' : 0 };
            this.hasValueForOpponent[i] = false;
        }
        if (this.logLevel) this.log(`ME ${this.me}`);             
    }
    
    offer(o){
        this.roundNum++;
        this.opponentOffers.push(o);
        if (this.logLevel)  this.log(`round ${this.roundNum}`);
        if (typeof o !== 'undefined') {    
	        this.calculateOpponentLessSignificans(o);
            if (this.logLevel)  this.log(`OpponentLessSignificans`);
            for (var i = 0; i < this.counts.length; i++) {
               if (this.logLevel)  this.log(`${this.opponentLessSignificans[i].i} value = ${this.opponentLessSignificans[i].uselessness}`);
            }
            this.opponentOfferPrice = this.priceOfOffer(o);     
            if (this.logLevel)  this.log(`priceOffer = ${this.opponentOfferPrice}`);
            if (this.opponentOfferPrice >= this.bestOpponentOffer) { // =, because it is better to make later offer            
                this.bestOpponentOfferRoundNum = this.roundNum;
                this.bestOpponentOffer = this.opponentOfferPrice;            
            }
            return this.makeOffer();
        } else {
            return this.makeFirstOffer();
        }
    }

    calculateOpponentLessSignificans(o) {
        for (let i = 0; i < this.counts.length; i++) {
            for (let j = 0; j < this.counts.length; j++) {
                if (this.opponentLessSignificans[j].i === i) {
                    this.opponentLessSignificans[j].uselessness += o[i] * (this.max_rounds - this.roundNum);
                }
            }
            if (o[i] < this.counts[i]) {
                this.hasValueForOpponent[i] = true;
            }
        }
        this.opponentLessSignificans.sort(function(a,b) {
            return (a.uselessness > b.uselessness) ? -1 : ((b.uselessness > a.uselessness) ? 1 : 0);});
    }
 
    makeFirstOffer() {
        var myOffer = [];
        for (var i = 0; i < this.counts.length; i++) {
            if (this.values[i] > 0) {
                myOffer[i] = this.counts[i];
            } else {
                myOffer[i] = 0;
            }               
        }
        return myOffer;
    }
    
    makeOffer() {
        let greedCoeff = 3;

        var myOffer = this.getOfferByGreedCoeff(greedCoeff);        
        var myOfferPrice = this.priceOfOffer(myOffer);
        if (this.logLevel) this.log(`greedCOeff = ${greedCoeff} OfferPrice = ${myOfferPrice}`);                    
        if (myOfferPrice < this.bestOpponentOffer && this.bestOpponentOffer > 0) {
            if (this.logLevel) this.log(`Best opponent better!`);
            let makeHisBest = true;
            if (this.max_rounds - this.roundNum > 1) {
                myOffer = this.getOfferByGreedCoeff(greedCoeff);
                myOfferPrice = this.priceOfOffer(myOffer);
                if (this.logLevel) this.log(`greedCOeff = ${greedCoeff} OfferPrice = ${myOfferPrice}`);                    
                if (myOfferPrice > this.bestOpponentOffer) {
                     makeHisBest = false;
                }
            }  
            if (makeHisBest) {
            	if (this.logLevel) this.log(`Make his best offer`);                    
                myOffer = this.opponentOffers[this.bestOpponentOfferRoundNum - 1];
            }
        }
        if (this.roundNum == this.max_rounds) {
            if (this.me == 0) {
                myOffer = this.getLastOfferPower();
                myOfferPrice = this.priceOfOffer(myOffer);
                if (myOfferPrice > this.bestOpponentOffer) {
                    return myOffer;
                }
                if (this.bestOpponentOffer > this.opponentOfferPrice && this.me == 0) {
                    if (this.logLevel) this.log(`Make his best offer`);        
                    myOffer = this.opponentOffers[this.bestOpponentOfferRoundNum - 1];
                } else if (this.opponentOfferPrice > 0) {
                    return undefined;
                }                
            } else if (this.opponentOfferPrice > 0) {
                return undefined;
            }
        } 
        return myOffer;        
    }


    getOfferByGreedCoeff(greedCoeff) {
        let priceToKeep = Math.round(this.total * (this.max_rounds * greedCoeff - this.roundNum) / (this.max_rounds * greedCoeff));         
        if (this.logLevel) this.log(`Price To Keep = ${priceToKeep}`);
        var myOffer = this.getOfferByMinPrice(priceToKeep);       
        return myOffer;
    }

    getOfferByMinPrice(minPrice) {
        var myOffer = [];
        var summ = 0;
        var opponentLessSignificansWithOurValue = [];
        for (let i = 0; i < this.counts.length; i++) {
           let oLSWOV = { 'i' : this.opponentLessSignificans[i].i, 'uselessness' : this.opponentLessSignificans[i].uselessness * this.values[this.opponentLessSignificans[i].i] / this.total };
           opponentLessSignificansWithOurValue.push(oLSWOV);
        }
        // to get items with bigger values first for more correct set by minPrice
        opponentLessSignificansWithOurValue.sort(function(a,b) {
            return (a.uselessness > b.uselessness) ? -1 : ((b.uselessness > a.uselessness) ? 1 : 0);});

        for (let i = 0; i < this.counts.length; i++) {
            let index = opponentLessSignificansWithOurValue[i].i;
            if (summ < minPrice && this.values[index] > 0) {
                myOffer[index] = 0;  
                for (let j = 0; j < this.counts[index]; j++) {
                   myOffer[index]++;
                   summ += this.values[index];
                   if (summ >= minPrice) break;
                }
            } else {
                myOffer[index] = 0;
            }
        }
        return myOffer;       
    }
        
    priceOfOffer(o) {
        var price = 0;
        for (var i = 0; i < o.length; i++) {
            price += o[i] * this.values[i];
        }
        return price;
    }

    getLastOfferPower() { // give him one less significant for us, but significant for him item
        var myOffer = [];
        let giveToOpponentIndex = this.orderedValues[0].i;
        for (let i = 0; i < this.counts.length; i++) {
            let index = this.orderedValues[i].i;   
            if (this.hasValueForOpponent[index]) {
               giveToOpponentIndex = index;
               break;
            }
        }
        for (let i = 0; i < this.counts.length; i++) {
            if (giveToOpponentIndex == i) {
                 if (this.values[i] > 0) {
                    myOffer[i] = this.counts[i] - 1;
                 } else {
                    myOffer[i] = 0;
                 }
            } else if (this.values[i] > 0) {
                 myOffer[i] = this.counts[i];
            } else {
                myOffer[i] = 0;
            }
        }
        return myOffer;
    }   
}