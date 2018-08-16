'use strict'; /*jslint node:true*/

module.exports = class Agent {

  constructor (me, counts, values, max_rounds, log) {
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.log = log;
    this.me = me;
    this.total_counts = 0;
    this.total_values = 0;
    for (let i = 0; i < counts.length; i++)
    {
      this.total_values += counts[i] * values[i];
      this.total_counts += counts[i];
    }
    // The history of received offers:
    this.offers = [[],[],[],[],[]];
    // The value thresholds for accepting offers (upper when playing first, lower when playing second):
    this.upper_threshold1 = 9;
    this.upper_threshold2 = 8;
    this.upper_threshold = (Math.random() < 0.5) ? this.upper_threshold1 : this.upper_threshold2; // Choose the acceptance threshold.
    this.lower_threshold1 = 8;
    this.lower_threshold2 = 8;
    this.lower_threshold = (Math.random() < 0.5) ? this.lower_threshold1 : this.lower_threshold2; // Choose the acceptance threshold.
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
    // Initializing a flag used for offering items of positive value:
    this.flag_given = 3;
  }

  offer (o) {
    //this.log(`${this.rounds} rounds left, threshold-85-80-sharing2 turn`);
    this.rounds--;

    if (this.me == 0) // If I play first:
    {
      if (o) // If there is an incoming offer (any round except for the 1st one):
      {
        this.offers[4-this.rounds] = o; // Record the incoming offer for later usage.

        let offered_value = 0;
        for (let i = 0; i < o.length; i++)
          offered_value += this.values[i] * o[i]; // Calculate the value offered to me.

        if (offered_value >= this.upper_threshold) // If the value offered is above the chosen threshold...
          return; // ... then accept the incoming offer...
      }

      o = this.counts.slice(); // or else... initialize a counter-offer (keep everything).

      // Give away all objects of zero value:
      for (let i = 0; i < 3; i++)
        if (this.values[i] == 0)
          o[i] = 0;

      // Form the offer depending on the current round:
      switch(this.rounds)
        {
          case 4:
            break;
          case 3:
            break;
          case 2:
            break;
          case 1: // Give one item of the type with the smallest positive value.
            break;
          default: // Give two items of the smallest positive value.
            if (this.values[this.sorted_types[0]] > 0 && this.counts[this.sorted_types[0]] > 0)
              {
                o[this.sorted_types[0]] -= 1;
                //this.flag_given = 0;
                break;
              }
            if (this.values[this.sorted_types[1]] > 0 && this.counts[this.sorted_types[1]] > 0)
              {
                o[this.sorted_types[1]] -= 1;
                //this.flag_given = 1;
                break;
              }
            if (this.values[this.sorted_types[2]] > 0 && this.counts[this.sorted_types[2]] > 0)
              {
                o[this.sorted_types[2]] -= 1;
                //this.flag_given = 2;
                break;
              }
            break;
        }
      return o; // ... or else make a counter-offer.
    }
    else // If I play second (there is always an incoming offer in that case):
    {
      this.offers[4-this.rounds] = o; // Record the incoming offer for later usage.

      let offered_value = 0;
      for (let i = 0; i < o.length; i++)
        offered_value += this.values[i] * o[i]; // Calculate the value offered to me.

      if (offered_value > this.lower_threshold || (offered_value > 0 && this.rounds == 0)) // If the value offered is above the chosen threshold or if it is simply positive but the round is the last one...
        return; // ... then accept the incoming offer...

      o = this.counts.slice();

      // Give away all objects of zero value:
      for (let i = 0; i < o.length; i++)
        if (this.values[i] == 0)
          o[i] = 0;

      // Form the offer depending on the current round:
      switch(this.rounds)
        {
          case 4:
            break;
          case 3:
            break;
          case 2:
            break;
          case 1:
            if (this.values[this.sorted_types[0]] > 0 && this.counts[this.sorted_types[0]] > 0)
              {
                o[this.sorted_types[0]] -= 1;
                this.flag_given = 0;
                break;
              }
            else if (this.values[this.sorted_types[1]] > 0 && this.counts[this.sorted_types[1]] > 0)
              {
                o[this.sorted_types[1]] -= 1;
                this.flag_given = 1;
                break;
              }
            else if (this.values[this.sorted_types[2]] > 0 && this.counts[this.sorted_types[2]] > 0)
              {
                o[this.sorted_types[2]] -= 1;
                this.flag_given = 2;
                break;
              }
            break;
          default:
            if (this.total_counts <= 2)
              {
                if (this.values[this.sorted_types[0]] > 0 && this.counts[this.sorted_types[0]] > 0)
                  {
                    o[this.sorted_types[0]] -= 1;
                    break;
                  }
                else if (this.values[this.sorted_types[1]] > 0 && this.counts[this.sorted_types[1]] > 0)
                  {
                    o[this.sorted_types[1]] -= 1;
                    break;
                  }
                else if (this.values[this.sorted_types[2]] > 0 && this.counts[this.sorted_types[2]] > 0)
                  {
                    o[this.sorted_types[2]] -= 1;
                    break;
                  }
              }
            else
              {
                if (this.flag_given == 0)
                  {
                    if (this.counts[this.sorted_types[0]] > 1)
                      {
                        o[this.sorted_types[0]] -= 2;
                        break;
                      }
                    else if (this.counts[this.sorted_types[1]] > 0)
                      {
                        o[this.sorted_types[0]] -= 1; 
                        o[this.sorted_types[1]] -= 1;
                        break;                        
                      }
                    else if (this.counts[this.sorted_types[2]] > 0)
                      {
                        o[this.sorted_types[0]] -= 1; 
                        o[this.sorted_types[2]] -= 1;
                        break;                        
                      }
                  }
                else if (this.flag_given == 1)
                  {
                    if (this.counts[this.sorted_types[1]] > 1)
                      {
                        o[this.sorted_types[1]] -= 2;
                        break;
                      }
                    else if (this.counts[this.sorted_types[2]] > 0)
                      {
                        o[this.sorted_types[1]] -= 1; 
                        o[this.sorted_types[2]] -= 1;
                        break;                        
                      }
                  }
                else if (this.flag_given == 2)
                  {
                    if (this.counts[this.sorted_types[2]] > 1)
                      {
                        o[this.sorted_types[1]] -= 2;
                        break;
                      }
                  }
              }
            break;
        }
      return o; // ... or else make a counter-offer.
    }
  }
  
};