'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me; // 0 if I start
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;

        this.types = 3;
        this.total = 10;
        this.total_items = this.counts[0] + this.counts[1] + this.counts[2];

        this.my_last_offer = 0; // index for all_offers
        this.my_last_sum = 10;
        this.his_offers = [];

        let obj_set = {counts: Array.from(counts), valuations: []};
        this._init_valuations(obj_set, new Array(this.types), 0, 0);

        this.his_valuations = obj_set.valuations;

        // generate all offers
        this.all_offers = [];
        for (let i1 = 0; i1 <= counts[0]; i1++){
            for (let i2 = 0; i2 <= counts[1]; i2++){
                for (let i3 = 0; i3 <= counts[2]; i3++){
                    this.all_offers.push([[i1,i2,i3], i1*values[0]+i2*values[1]+i3*values[2], i1+i2+i3])
                }
            }
        }

        this.all_offers.sort(
            function (b, a) {
              if (a[1] > b[1]) {
                return 1;
              }
              if (a[1] < b[1]) {
                return -1;
              }

              if (a[2] > b[2]){
                return 1;
              }

              if (a[2] < b[2]){
                return -1;
              }

              return 0;
        });
    }

    offer(o){
        this.rounds--;

        let c = this.counts; 
        let r = this.rounds; 
        let a = this.all_offers;
        let v = this.values; 

        let offer_sum = 0;
        let offer_items = 0;
        let my_offer = c;

        if (o){
            for (let i = 0; i < o.length; i++){
                offer_sum += v[i]*o[i];
                offer_items += o[i];
            }
        
            this.his_offers.push([o.slice(), offer_sum, offer_items]);

            // suppose he doesn't offer <6 for him
            let tmp = this.his_valuations.filter(function (val){
                let sum = 0;
                for (let i = 0; i < 3; i++){
                    sum += val[i]*(c[i]-o[i]);
                }
                if (sum<6) return false;
                return true;
            });
            this.his_valuations = tmp;
        }

        let h = this.his_valuations;

        if (offer_sum >= 8) return; 

        let diff = offer_items - (this.total_items - offer_items); 

        if (this.total_items - offer_items == 1 && offer_sum >= 5) return;
        if (diff >= 1 && offer_sum >= 5) return;

        if (diff >= 0 && offer_sum >= 7) return;

        if (this.total_items - offer_items == 1 && offer_sum >= 4 && this.me == 0 && this.rounds == 0) return;
        if (                          diff >= 1 && offer_sum >= 4 && this.me == 0 && this.rounds == 0) return;
        if (this.total_items - offer_items == 1 && offer_sum >= 3 && this.me == 1 && this.rounds == 0) return;
        if (                          diff >= 1 && offer_sum >= 3 && this.me == 1 && this.rounds == 0) return;

        if (this.his_valuations.length == 0){ // he offered <= 5 at some point
            if (offer_sum >= 4) {
                return;
            }  
        }

        let threshold = 5 + r - this.me;

        if (threshold <= offer_sum) return; 

        let best_off = 0; // best offer index 
        let best_av = -1.0;
        for (let i = this.my_last_offer+1; i < a.length; i++){
            if (a[i][1] < threshold) break;
            
            let off = a[i][0];
            let tmp = 0.0
            for (let j = 0; j < h.length; j++){
                let hsum = h[j][0]*(c[0]-off[0]) + h[j][1]*(c[1]-off[1]) + h[j][2]*(c[2]-off[2]); 
                tmp += hsum;
            }
            if (tmp > best_av){
                best_av = tmp;
                best_off = i;
            }  
        }


        if (this.rounds) {
            if (best_off) return this.doMyOffer(best_off);
            return this.doMyOffer(this.my_last_offer);
        }

        if (this.rounds==0) { // any last words?
            if (diff >= 1 && offer_sum >= 3 + this.me) return;
            if (best_off && this.me == 0) return this.doMyOffer(best_off);
        }

        return this.doMyOffer(this.my_last_offer);
    }

    doMyOffer(oi){ // offer index
        this.my_last_offer = oi;
        return this.all_offers[oi][0];
    }

    _init_valuations(obj_set, values, i, total_value){
        let count = obj_set.counts[i];
        let max = (this.total-total_value)/count|0;
        if (i==this.types-1)
        {
            if (total_value+max*count==this.total)
            {
                values[i] = max;
                if (!values.every((v,i) => v == this.values[i])) // skip my valuation
                    obj_set.valuations.push(Array.from(values));
            }
            return;
        }
        for (let j = 0; j<=max; j++)
        {
            values[i] = j;
            this._init_valuations(obj_set, values, i+1, total_value+j*count);
        }
    }
};
