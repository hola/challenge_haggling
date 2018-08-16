'use strict'; /*jslint node:true*/

module.exports = class Agent {

  constructor (me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.values_norm = [0,0,0];
    this.rounds = max_rounds;
    this.log = log;
    this.me = me;
    this.total_counts = 0;
    this.total_values = 0;
    for (let i = 0; i < counts.length; i++)
    {
      this.total_values += counts[i] * values[i];
      this.total_counts += counts[i];
      this.values_norm[i] = this.values[i] / 10;
    }

    // The history of received offers:
    this.offers_sums = [0,0,0];  // Keeps the sum of items offered to me per type.
    this.offers_sums_norm = [1,1,1]; // Keeps a normalized predicted value that the opponent has for each type. 
    this.offers_pred = [0,0,0]; // Keeps an overall estimated value for me (but taking into account the opponent's predicted preference).

    // The value thresholds for accepting offers (upper when playing first, lower when playing second):
    this.thres1 = 8;
    this.thres2 = 8;
    this.thresMax = (Math.random() < 0.5) ? this.thres1 : this.thres2; // Acceptance threshold when playing first.
    this.thres3 = 8;
    this.thres4 = 7;
    this.thresMin = (Math.random() < 0.4) ? this.thres3 : this.thres4; // Acceptance threshold when playing second.

    // Sorting the item types in order of ascending value:
    if (this.values[0] <= this.values[1] && this.values[1] <= this.values[2])
        this.sorted_types = [0,1,2];
    else if (this.values[0] <= this.values[2] && this.values[2] <= this.values[1])
        this.sorted_types = [0,2,1];
    else if (this.values[1] <= this.values[0] && this.values[0] <= this.values[2])
        this.sorted_types = [1,0,2];
    else if (this.values[1] <= this.values[2] && this.values[2] <= this.values[0])
        this.sorted_types = [1,2,0];
    else if (this.values[2] <= this.values[0] && this.values[0] <= this.values[1])
        this.sorted_types = [2,0,1];
    else if(this.values[2] <= this.values[1] && this.values[1] <= this.values[0])
        this.sorted_types = [2,1,0];
  }

  offer (o) {
    this.rounds--; // Lower the round counter.

    if (this.me == 0) // If I play first:
    {
      if (o) // If there is an incoming offer (any round except for the 1st one):
      {
        for (let i = 0; i < o.length; i++)
          {
            this.offers_sums[i] += o[i]; // Increase the count of items offered to me.
            if (this.counts[i] > 0)
              this.offers_sums_norm[i] = ((this.counts[i] * (5-this.rounds)) - this.offers_sums[i]) / (this.counts[i] * (5-this.rounds)) ; // Normalize it
          }

        var offered_value = 0;
        for (let i = 0; i < o.length; i++)
          offered_value += this.values[i] * o[i]; // Calculate the value offered to me.

        if (offered_value >= this.thresMax) // If the value offered is above the chosen threshold...
          return; // ... then accept the incoming offer...
      }

      o = this.counts.slice(); // or else... initialize a counter-offer (keep everything).

      // Give away all objects of zero value:
      for (let i = 0; i < o.length; i++)
        if (this.values[i] == 0)
          o[i] = 0;

      // Form the offer depending on the current round. Only (potentially) offer more in the last round:
      switch(this.rounds)
        {
          case 4:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 3:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 2:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 1: // Give one item of the type with the smallest positive value.
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          default: // Give two items of the smallest positive value.
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            for (let i = 0; i < o.length; i++)
                this.offers_pred[i] = this.values_norm[i] / this.offers_sums_norm[i];
            //this.log(`Offer count sums so far: ${this.offers_pred}`);
            for (let i = 0; i < o.length; i++)
              if (this.offers_pred[this.sorted_types[i]] < 0.2 && o[this.sorted_types[i]] > 0)
              {
                o[this.sorted_types[i]] -= 1;
               break;
              }
            break;
        }
      return o; // ... or else make a counter-offer.
    }
    else // If I play second (there is always an incoming offer in that case):
    {
        var offered_value = 0;
        for (let i = 0; i < o.length; i++)
          offered_value += this.values[i] * o[i]; // Calculate the value offered to me.

      if (offered_value > this.thresMin || (offered_value > 0 && this.rounds == 0)) // If the value offered is above the chosen threshold or if it is simply positive but the round is the last one...
        return; // ... then accept the incoming offer...

      o = this.counts.slice();

      // Give away all objects of zero value:
      for (let i = 0; i < o.length; i++)
        if (this.values[i] == 0)
          o[i] = 0;

      // Form the offer depending on the current round. Only (potentially) offer more in the last round:
      switch(this.rounds)
        {
          case 4:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 3:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 2:
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          case 1: // Give one item of the type with the smallest positive value.
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            break;
          default: // Give two items of the smallest positive value.
            //this.log(`Offer count sums so far: ${this.offers_sums}`);
            //this.log(`Opponent normalized value prediction so far: ${this.offers_sums_norm}`);
            //this.log(`My normalized values: ${this.values_norm}`);
            for (let i = 0; i < o.length; i++)
                this.offers_pred[i] = this.values_norm[i] / this.offers_sums_norm[i];
            //this.log(`Offer count sums so far: ${this.offers_pred}`);
            for (let i = 0; i < o.length; i++)
              if (this.offers_pred[this.sorted_types[i]] < 0.5 && o[this.sorted_types[i]] > 0)
              {
                o[this.sorted_types[i]] -= 1;
                break;
              }
            break;
        }
      return o; // ... or else make a counter-offer.
    }
  }
  
};