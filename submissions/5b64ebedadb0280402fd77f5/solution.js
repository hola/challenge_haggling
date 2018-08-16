'use strict'; /*jslint node:true*/

module.exports = class Agent {
    /**
     * 
     * @param {integer} me - 0 if we are first, 1 if we are second
     * @param {Array} counts - Array with all items in game (array length == count of items type)
     * @param {Array} values - Array with value for us for each item
     * @param {integer} max_rounds - Max rounds for this game
     * @param {function} log - Function for output log message
     */
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0; // Max values which we can get in game
        for ( let i = 0; i<counts.length; i++ ) {
            this.total += counts[i] * values[i];
        }

        this.current_round = -1;

        this.our_max_value = Math.max(...values); // Max price of one item
        this.our_min_value = this.our_max_value;  // Min price of one item
        for (let i = 0; i<values.length; i++)
            this.our_min_value = ( values[i] < this.our_min_value && values[i] > 0 ) ? values[i] : this.our_min_value;

        this.enemy_values_max = counts.map(x => Math.floor(this.total / x)); // Max values of items for enemy
        this.enemy_want = counts.map(x => 0); // Count of rounds in which enemy asked item for yourself


        this.possible_offers = this.calculate_offers();
        this.expectation = this.calculate_expectation();

        this.incoming_offers = [];


        // Temporary log info.
        /*this.log(`First: ${this.me}.
        Min value: ${this.our_min_value}.
        Expectation: ${this.expectation}.`);

        for (let i=0; i<this.possible_offers.length; i++) {
            this.log(`Possible offers:
            offer - ${this.possible_offers[i].offer}
            value - ${this.possible_offers[i].value}`);
        }*/
    }

    /** Calculate possible offers.
     * 
     * This function calculating variations of offers (for calculating we include only items which cost more than $0 for us)
     * * @return {Array} Array with all possible offers. Each oofer is object with properties:
     *      offer - offer, value - value of this offer.
    */
    calculate_offers () {
        let offers = []; // all possible offers

        // TODO: move offer_total to constructor
        const offer_total = this.counts.map( (count, index) => (!this.values[index]) ? 0 : count); // max offer for us

        for (let i = 0; i<this.counts.length; i++) {
            if (this.values[i]) { // This item cost more than $0 for us
                let offers_temp = [];
                for (let j=1; j<=this.counts[i]; j++) {
                    let offer = {offer: [], value: this.total - this.values[i] * j};
                    offer.offer = offer_total.map( (count, index) => (index == i) ? count-j : count);

                    if (offer.value > 0) {
                        offers_temp.push(offer);

                        for (let k=0; k<offers.length;k++) {
                            let o = Object.assign({}, offers[k]);//offers[k];
                            o.offer = o.offer.map( (count, index) => (index == i) ? offer.offer[index] : count);
                            o.value -= this.values[i] * j;
                            if (o.value > 0)
                                offers_temp.push(o);
                        }
                    }
                }
                offers.push(...offers_temp);
            }
        }
        offers.sort((a,b) => b.value - a.value);
        return offers;
    }

    /** Calculate our expectation for each round.
     * 
     * We will be agree with offer if enemy offer values, which in sum greater or equal our expectation for this round.
     * (All params get from object with *this*)
     * @return {Array} Array with expectation for each round.
    */
    calculate_expectation () {
        let expectation = [];

        // We will be agree in first round with total sum only.
        expectation[0] = this.total;

        if (this.our_min_value == this.total ) { // We have one item which cost total sum
            for (let i = 0; i<this.rounds; i++)
                expectation[i] = this.total;
            return expectation;
        }
        if (this.our_min_value == this.total / 2) { // We have two items with same cost (in sum total value).
            for (let i = 0; i<this.rounds-1; i++)
                expectation[i] = this.total;
            expectation[this.rounds-1] = this.total - this.our_min_value;
            return expectation;
        }

        if (this.our_min_value + this.our_max_value == this.total) { // We have only two variant for offer: get one cheapest item or get one expensive item.
            for (let i = 0; i<this.rounds-2; i++)
                expectation[i] = this.total;
            expectation[this.rounds-2] = this.total - this.our_min_value;
            expectation[this.rounds-1] = this.total - this.our_max_value;
            return expectation;
        }

        // Min value can't be between (total/2) and (total-1), so if we are here min_value < this.total / 2

        for (let i = 0; i<this.rounds; i++)
            expectation[i] = this.total;
        
        let offers_cost = [... new Set(this.possible_offers.map( o => o.value))];
        offers_cost.sort((a,b) => b-a);
        //this.log(`offers_cost - ${offers_cost}`);
        
        /* Calc expectation using median:
            for all rounds except first and last get offers value before median
            for last round get value from offer after median (get median2 from them and than get last value <= median2)
        */

        let beforeMedian = offers_cost.slice(0, Math.floor(offers_cost.length/2) );
        let afterMedian = offers_cost.slice(Math.floor(offers_cost.length/2) );
        /*this.log(`beforeMedian - ${beforeMedian}`);
        this.log(`afterMedian - ${afterMedian}`);*/
        expectation[this.rounds-1] = afterMedian[Math.floor(afterMedian.length/2 - 1)];
        
        // Now we must calculating expectation for round from 2 to max_round-1
        if (beforeMedian.length >= this.rounds-2 ) {
            let step = beforeMedian.length / (this.rounds-2);
            for (let i=1; i<this.rounds-1; i++) {
                expectation[i] = beforeMedian[Math.floor(step*i-1)];
            }
        } else {
            let j = this.rounds-2;
            for (let i=beforeMedian.length-1; i>=0; i--) {
                expectation[j] = beforeMedian[i];
                j--;
            }
        }
 
        return expectation;
    }


    /**
     * Find best offer for current round.
     * Get all possible offers, filter offers by values - remove all offer with values less than expectation
     * Than sort offers by desc of item types which enemy needed using coefficient of enemy_want (including 1/this.counts[j] as correction for items count).
     * Get first offer for enemy which need be best offer for him in this round (if enemy don't lie of course)
     */
    find_offer () {
        let o = this.counts.map( (count, index) => (!this.values[index]) ? 0 : count); // max offer for us

        let offers_for_current_round = [];
        for (let i=0; i<this.possible_offers.length;i++) {
            if (this.possible_offers[i].value >= this.expectation[this.current_round]) {
                let offer = Object.assign({}, this.possible_offers[i]);
                offer.enemy_important = 0;
                for (let j=0; j<offer.offer.length; j++) {
                    if ( this.counts[j] - offer.offer[j] > 0 ) {
                        offer.enemy_important += ( (this.counts[j] - offer.offer[j]) / this.counts[j] ) * this.enemy_want[j] * (1/this.counts[j]);
                    }
                }

                offers_for_current_round.push(offer);
            }
        }

        if (offers_for_current_round.length > 0) {
            offers_for_current_round.sort( (a,b) => b.enemy_important - a.enemy_important );

            // get all variations of best offer for enemy
            offers_for_current_round = offers_for_current_round.filter(x => x.enemy_important == offers_for_current_round[0].enemy_important);
            // than sort them by desc values for us
            offers_for_current_round.sort( (a,b) => b.value - a.value );

            /*for (let i=0; i<offers_for_current_round.length;i++) {
                this.log(`offers_for_current_round - ${offers_for_current_round[i].offer} / ${offers_for_current_round[i].value} / ${offers_for_current_round[i].enemy_important}`);
            }*/

            return offers_for_current_round[0].offer;
        }

        return o;
    }

    offer(o){
//        this.log(`My script.`);
        this.current_round++;

        // FIRST ROUND
        if (!o) {
            // I'am start and try to get offer with total value
            o = this.counts.slice();
            let bZeroCounts = false;
            for (let i = 0; i<o.length; i++)
            {
                if (!this.values[i]) {
                    o[i] = 0;
                    // We try get one more item, may be enemy aggree with offer (possible less than $10)
                    if (!bZeroCounts) {
                        o[i] = 1;
                    }
                    bZeroCounts = true;
                }
            }
            return o;
        } else {
            // calculate coefficient for each items type. Coefficient is ONE if enemy is want all items of this type in this round. Sum coefficient are show us how much this type is important for enemy.
            for (let i = 0; i<o.length; i++) {
                if (this.counts[i] - o[i] > 0) {
                    this.enemy_want[i] += (this.counts[i] - o[i]) / this.counts[i];
                }
            }
            //this.log(`Enemy wants ${this.enemy_want}`);
        }

        // CHECK OFFER. We aggree with offer if Bob get us all sum
        let sum = 0;
        for (let i = 0; i<o.length; i++)
            sum += this.values[i]*o[i];
        if (sum >= this.expectation[this.current_round] ) {
            //this.log(`Accepted by expectation value ${this.expectation[this.current_round]}. Current round - ${this.current_round}.`);
            return;
        }
        if (this.current_round == this.rounds - 1 && this.me == 1 && sum > 0) {
            // We must agree with any offer which cost more than $0 if this is last round and our move is second because we play in opposition of market and get any value is best than get $0.
            //this.log('Agree with all in last round');
            return;
        }

        if (sum > 0) {
            let offer = {offer: o, value: sum};
            this.incoming_offers.push(offer);
        }

        // Max value offer for us
        o = this.counts.map( (count, index) => (!this.values[index]) ? 0 : count);

        // Make offer in FIRST round (we are not first). Make offer with total sum.
        if (this.current_round == 0) {
            return o;
        }
        // END FIRST ROUND
        

        // If we can only one item and his value equal total
        if (this.our_min_value == this.total) {
            return o;
        }
        
        // Pre last round. Find best offer in incoming and send back to enemy.
        if (this.current_round == this.rounds - 1) {
            let max_value = 0;
            let index = -1;
            for (let i=0; i<this.incoming_offers.length;i++) {
                if (this.incoming_offers[i].value > max_value) {
                    max_value = this.incoming_offers[i].value;
                    index = i;
                }
            }
            // calculate him offer. We can request more for yourself if offer contain more than 2 items for enemy and him get us less than 1/3
            if (max_value > 0 && max_value <= (this.total / 3)) {
                let him_offer = this.incoming_offers[index].offer;
                let c = 0;
                let max_values_for_us = 0;
                let max_values_for_us_index = -1;
                for (let i=0; i<him_offer.length; i++) {
                    c += this.counts[i] - him_offer[i];
                    // sort request by values for us and request most expensive (for us) item.
                    if (this.counts[i] - him_offer[i] > 0 && this.values[i] > max_values_for_us ) {
                        max_values_for_us = this.values[i];
                        max_values_for_us_index = i;
                    }
                }
                if (c>=2) {
                    him_offer[max_values_for_us_index]++;
                    return him_offer;
                }
            }
            if (max_value > 0) {
                return this.incoming_offers[index].offer;
            }
        }

        // Find offer which greater or equal with expectaion
        o = this.find_offer();

        return o;

    }
};
