'use strict'; /*jslint node:true*/


/* Thank you, Hola, for the challenge! It was fun. */
module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;
        this.my_values = values;
        this.max_rounds = max_rounds;
        this.log = log;

        this.total = this._dot(counts, values);
        this.min_allowable_win = Math.floor(this.total / 2);
        this.my_min_allowable_win = this.total;

        this.cround = 0; // Current round.

        // The probability that partner accepts offer with corresponding win.
        this.agreement_p = this._gen_agreement_p(this.total, this.min_allowable_win);

        // All possible parnter's valuations.
        this.valuations = Array(0);      
        this._gen_valuations(Array(this.counts.length), 0, 0);

        this.my_possible_offers = Array(0);

        this.partners_offered_offers = Array(0);
        this.my_offered_offers = Array(0);

        this.all_possible_offers = Array(0);
        this._gen_all_possible_offers(Array(0), 0);
        if( this.all_possible_offers.length == 0 ){
            throw "I didn't generate any possible offers.";
        }
    }

    _get_max_my_win(partners_values){
        let max_win = 0;
        for(let i = 0; i < this.all_possible_offers.length; ++i){
            let offer = this.all_possible_offers[i];
            let my_win = this._dot(this.my_values, offer);
            let partners_win = this.total - this._dot(partners_values, offer);
            if( (partners_win >= this.min_allowable_win) && (max_win < my_win) ){
                max_win = my_win;
            }
        }
        return max_win;
    }

    _calc_my_min_allowable_win(){
        // It will be expected value of my maximum win.
        let ev = 0;
        for(let i = 0; i < this.valuations.length; ++i){
            let values = this.valuations[i];
            ev += values.p * this._get_max_my_win(values);
        }
        this.my_min_allowable_win = Math.floor(ev + 0.5);
        if( this.my_min_allowable_win == 0){
            this.my_min_allowable_win = 1;
        }
    }

    _gen_all_possible_offers(a, n){
        if(n == this.my_values.length){
            this.all_possible_offers.push(a.slice());
            return;
        }
        for(let i = 0; i <= this.counts[n]; ++i){
            a[n] = i;
            this._gen_all_possible_offers(a, n + 1);
        }
    }

    _gen_my_possible_offers(delete_old_offers){
        this.my_possible_offers = Array(0);
        for(let i = 0; i < this.all_possible_offers.length; ++i){
            let offer = this.all_possible_offers[i];
            let is_valid = true;

            if( this._dot(this.my_values, offer) <  this.my_min_allowable_win){
                continue;
            }

            if( delete_old_offers && this.my_offered_offers ){
                for(let j = 0; j < this.my_offered_offers.length; ++j){
                    if( this._is_more_expensive(this.my_offered_offers[j], offer) ){
                        is_valid = false;
                        break;
                    }
                }
            }

            if( is_valid ){
                this.my_possible_offers.push(offer.slice());
            }
        }
    }

    _sort_my_possible_offers(){
        for(let i = 0; i < this.my_possible_offers.length; ++i){
            let pa = 0; // Probability of agreement. 
            let offer = this.my_possible_offers[i]; 
            let my_win = this._dot(this.my_values, offer)

            for(let j = 0; j < this.valuations.length; ++j){
                let valuation = this.valuations[j];                
                let parners_win = this.total - this._dot(valuation, offer);
                pa += this.agreement_p[parners_win] * valuation.p;
            }

            // Expected value of my win.
            this.my_possible_offers[i].evw = pa * my_win;
        }
        this.my_possible_offers.sort(function(a, b){return a.evw - b.evw});
    }

    _gen_agreement_p(n, k){
        let tmpa = Array(n);
        for(let i = 0; i <= n; ++i){
            tmpa[i] = this._binomial(n, i) * Math.pow(k/n, i) * Math.pow(1-k/n, n-i);
        }

        let agreement_p = Array(n);
        let pr = 0;
        for(let i = 0; i <= n; ++i){
            agreement_p[i] = pr + tmpa[i];
            pr = agreement_p[i];
        }
        return agreement_p;
    }

    _gen_valuations(values, i, total_value){
        let count = this.counts[i];
        let max = (this.total-total_value)/count|0;
        if(i == this.counts.length-1){
            if(total_value + max*count == this.total){
                values[i] = max;
                let tmp = Array.from(values);
                if(!this._cmp(tmp, this.my_values)){
                    // Always my and partner's valuations are different!
                    tmp.p = 1; // Probability of valuation. Should be normalized.
                    this.valuations.push(tmp);
                }
            }
            return;
        }
        for (let j = 0; j <= max; ++j){
            values[i] = j;
            this._gen_valuations(values, i+1, total_value+j*count);
        }
    }

    _calc_valuations_p(my_offer, partners_offer){
        if(my_offer){
            for(let i = 0; i < this.valuations.length; ++i){
                let parners_win = this.total - this._dot(this.valuations[i], my_offer)
                this.valuations[i].p *= (1 - this.agreement_p[parners_win]);
            }
        }

        if(partners_offer){
            for(let i = 0; i < this.valuations.length; ++i){
                let parners_win = this.total - this._dot(this.valuations[i], partners_offer)
                this.valuations[i].p *= this.agreement_p[parners_win];
            }
        }

        // Normalizing the probabilities.
        let norm = 0;
        for(let i = 0; i < this.valuations.length; ++i){
            norm += Math.abs(this.valuations[i].p);
        }
        if(norm != 0){
            for(let i = 0; i < this.valuations.length; ++i){
                this.valuations[i].p /= norm;
            }
        }
        
    }

    _cmp(a, b){
        for(let i = 0; i < a.length; ++i){
            if(a[i] != b[i]){
                return false;
            }
        }
        return true;
    }

    _binomial(n, k){
        let b = 1;
        for(let i = 1; i <= k; ++i){
            b = b * (n + 1 - i) / i;
        }
        return b;
    }

    _dot(a, b){
        if(a.length != b.length){
            throw "Wrong vectors' dimensions in dot product."
        };

        let sum = 0;
        for(let i = 0; i < a.length; ++i){
            sum += a[i] * b[i];
        }
        return sum;
    }

    // Partially ordered set.
    _is_more_expensive(a, b){
        if(a.length != b.length){
            throw "Wrong vectors' dimensions in partial order function."
        };

        for(let i = 0; i < a.length; ++i){
            if(a[i] > b[i]){
                return false;
            }
        }
        return true;
    }

    offer(partners_offer){
        this._calc_valuations_p(undefined, partners_offer);
        this._calc_my_min_allowable_win();

        ++this.cround;
        this.log(`${this.cround} round. Current my minimal allowable win: ${this.my_min_allowable_win}.`);

        if( partners_offer && (this._dot(this.my_values, partners_offer) >= this.my_min_allowable_win) ){
            return;
        }

        this._gen_my_possible_offers(true);
        if( this.my_possible_offers.length == 0 ){
            this.log("No more offers.");
            this._gen_my_possible_offers(false);
        }
        this.log(`Possible offers: ${this.my_possible_offers.length}.`);    
        this._sort_my_possible_offers();

        let my_offer = this.my_possible_offers.pop();
        this._calc_valuations_p(my_offer, undefined);

        this.my_offered_offers.push(my_offer.slice());
        // Unused.
        if( partners_offer ){
            this.partners_offered_offers.push(partners_offer.slice());
        } 

        return my_offer;
    }
};
