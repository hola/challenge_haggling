'use strict'; /*jslint node:true*/

module.exports = class HagglesMcGee {
    constructor(me, counts, values, max_rounds, log) {
        this.me = me;
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let j = 0; j < counts.length; j++)
            this.total += counts[j] * values[j];
    }
    offer(offer) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
       

        // ask for everything the first turn
        if (this.me == 0 && this.rounds >= 4) {
            return this.counts;
        }
        if (offer) {

            // make array of all items with value > 0
            let omain = [];
            for (let i = 0; i < this.counts.length; i++) {
                if (this.values[i] > 0) {
                    omain = omain.concat(this.counts.slice(i, (i + 1)));
                }
                else {
                    omain[i] = 0;
                }
            }
                        //calculate total value of offer

                        let sum = 0;

                        for (let i = 0; i < offer.length; i++) {
                            sum += this.values[i] * offer[i];
                        }
            
                        //  if the sum of the value of objects offered, 
                        //  is equal to the total value, accept.
            
                        if (sum >= this.total) {
            
                            return;
            
                        } else {
                        
                            switch (this.rounds + 1) {
                                case 5:
                                    {
                                        return omain;
                                    }
                                case 4:
                                    this.build(omain, 1, 0)
                                    break;
                                case 3:
                                    this.build(omain, 2, 1);
                                    break;
                                case 2:
                                    this.build(omain, 1, 1, 2);
                                    break;
                                case 1:
                                    this.build(omain, 1, 1, 3);
                                    break;
                            }
                            return omain;
                        }
                    }
                }
                build(omain, extraObject, lessVal, altLessVal) {
                    let extraObjectCounter = extraObject;

                    while (extraObjectCounter >= 1) {
                        for (let i = 0; i < omain.length; i++) {
                            if (omain[i] > 0 && this.values[i] <= lessVal) {
                                omain[i] = omain[i] - 1;
                                extraObjectCounter--;
                            }
                            else if ((altLessVal || altLessVal === 0)
                                && omain[i] > 0
                                && this.values[i] <= altLessVal
                                
                            ) {
                                omain[i] = omain[i] - 1;
                                extraObjectCounter--;
                            }
                            else {
                                extraObjectCounter--;
                            }
                        }
                    }
                }
            };































    
    
    
        
