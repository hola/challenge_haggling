'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.max_rounds = max_rounds;
    this.log = log;

    this.rounds = 1;
    this.target_offer = this.counts.slice();

    // Calculate target offer, total value, 
    // weigths in counts and values
    this.total = 0;
    this.ordered_values = [];
    
    for (let i = 0; i < counts.length; i++) {
      if (this.values[i] == 0)
        this.target_offer[i] = 0;
      
      this.total += counts[i] * values[i];
      
      //this.log(`-> index_i ${i}  value ${values[i]}`);
      if (this.values[i] > 0) {
        let j;
        for (j = 0; j < this.ordered_values.length; j++)
          if (this.values[i] < this.ordered_values[j].value)
            break;

        if (j < this.ordered_values.length) {
          this.ordered_values[j+1] = this.ordered_values[j];
          this.ordered_values[j] = {"index": i, "value": this.values[i], "tried": false};
        } else {
          this.ordered_values[j] = {"index": i, "value": this.values[i], "tried": false};
        }
      }
    }
    
    this.last_offersum = 0;
    this.last_offer = this.target_offer;
  }

  offer(o) {
    this.log(`${this.rounds} round (${this.max_rounds})`);
    
    let new_o = this.last_offer;

    if (this.rounds == 1)
      new_o = this.target_offer;
    else {
      if (o) {
        let sum = 0;
        for (let i = 0; i < o.length; i++) {
          sum += this.values[i] * o[i];
           
          //this.log(`-> index ${i}  count ${o[i]}  value ${this.values[i]}`);
        }
        //this.log(`-> sum ${sum}   last_offersum ${this.last_offersum}`);
        
        if (sum == this.total || sum >= this.last_offersum)
          return undefined;
        
        // Last counter-offer, accept whatever: something better than nothing
        if (sum > 0 && this.rounds == this.max_rounds && this.me == 1) {
          if (sum >= this.total / 2) // 50% accept last round
            return undefined;
        }

        // If reaching last quarter of rounds and value higher than 80% => accept
        if (this.rounds >= this.max_rounds*0.8 && (sum >= this.total*0.8 || sum >= this.last_offersum*0.9))
          return undefined;
        
        for (let j = 0; j < this.ordered_values.length; j++) {
          let i = this.ordered_values[j].index;
          //this.log(`-> index ${this.ordered_values[j].index}  value ${this.ordered_values[j].value}`)
          //this.log(`-> o_i ${o[i]}  last_offer ${this.last_offer[i]}`)
          
          // If I don't get what I requested
          // Offers less than requested
          
          // break
          let p = (this.max_rounds - this.rounds <= 2 ? 25 : 20);
          
          if (o[i] == 0 && this.target_offer[i] > 0) {
            // this.log(`-> 1`);
            // Quiere todo.
            if ( !this.ordered_values[j].tried && 100.0*this.counts[i]*this.values[i]/this.total <= p )
            {
              // this.log(`-> 1.1`);
              new_o[i] = 0;
              this.ordered_values[j].tried = true;
              break;
            } else {
              // this.log(`-> 1.2`);
              new_o[i] = this.counts[i];
            }
          } else if (o[i] < this.last_offer[i]) {
            // this.log(`-> 2`);
            // Me ofrece algo inferior a la última petición
            if ( 100.0*this.counts[i]*this.values[i]/this.total <= p )
            {
              // this.log(`-> 2.1`);
              new_o[i] = o[i] - 1;
              this.ordered_values[j].tried = new_o[i]==0;
              break;
            }
          }
        }
      }
    }

    // this.log(`-> New offer`);
    let sum = 0;
    for (let i = 0; i < new_o.length; i++) {
      sum += this.values[i] * new_o[i];
      // this.log(`-> index ${i}  count ${new_o[i]}  value ${this.values[i]}`);
    }
    // this.log(`-> sum ${sum}`);
    
    this.rounds++;
    this.last_offer = new_o;
    this.last_offersum = sum;
    
    return new_o;
  }
};
