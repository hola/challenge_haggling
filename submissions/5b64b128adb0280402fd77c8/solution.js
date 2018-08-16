'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor (me, counts, values, max_rounds, log) {
    let p1 = 0.7;  // total value factor threshold when 1st
    let p2 = 0.3;  // total chance for better offer factor

    this.me = me;  // me is 0 if your turn is first, and 1 if your turn is
                   // second.
    this.counts = counts;  // counts is an array of integers, describing how
                           // many of each type of object there is. This array
                           // is between 2 and 10 elements long.
    this.values = values;  // values is an array of integers the same length as
                           // counts, describing how much every object is worth
                           // to you.
    this.maxRounds = max_rounds;  // max_rounds is the limit on the number of
                                  // rounds in the negotiations; a round is two
                                  // turns, one by each partner.
    this.remRounds = max_rounds;  // number of remaining rounds.
    this.currRound = 0;  // current round.
    this.log = log;  // log is a function which your code can call to output a
                     // message for debugging (console.log won't work).
    this.bestOffers = new Array();  // list of most profitable offers
    this.toOffer = {};  // current offer to send
    this.oppCounts = new Array();  // total number of objects offered by the opponent
    for (let i = 0; i < this.counts.length; i++) {  // initialize oppCounts
     this.oppCounts[i] = 0;
    }
    this.totalValue = 0;  // total possible items value
    for (let i = 0; i < this.counts.length; i++) {
      this.totalValue += this.counts[i] * this.values[i];
    }

    function findAllOffers (counts, values) {
      let allOffers = new Array();
      let p = 0;
      for (let i = 0; i <= counts[0]; i++) {  // 1st type
        for (let j = 0; j <= counts[1]; j++) {  // 2nd type
          for (let k = 0; k <= counts[2]; k++) {  // 3rd type
            let possOffer = {
              'counts': [i, j, k],  // array of counts
              'number': i + j + k,  // total count
              'value': i * values[0] + j * values[1] + k * values[2]  // total value
            };
            allOffers[p] = possOffer;
            p++;
          }
        }
      }
      return allOffers;
    }

    function findBestOffers (array, counts, values) {
      let bestOffers = new Array();
      for (let i = 0; i < array.length; i++) {
        let newNode = array[i];
        if (values[0] == 0 && newNode.counts[0] == counts[0]
        || values[1] == 0 && newNode.counts[1] == counts[1]
        || values[2] == 0 && newNode.counts[2] == counts[2]  // skip offer if for a zero value we keep everything
        || counts[0] + counts[1] + counts[2] == array[i].number  // do not ask everything
        || array[i].value == 0  //  avoid zero offers
        ) {
          // skip
        } else {

          let j = 0
          while (bestOffers[j] != null) {
            if (newNode.value > bestOffers[j].value // new node's value is larger
            || newNode.value == bestOffers[j].value  // or same value with less items
            && newNode.number <= bestOffers[j].number) {
              let tmpNode = bestOffers[j];
              bestOffers[j] = newNode;
              newNode = tmpNode;
            }
            j++;
          }
          bestOffers[j] = newNode;

        }
      }
      return bestOffers;
    }

    function findOffersStats (array, length) {
      let offersStats = new Array();
      for (let i = 0; i <= length; i++) {  // initialize the offersStats
                                           // <= because we may receive 0 offer
                                           // TODO do we need to consider 0?
        let c = {  // initialize new element
          'number': 0,  // number of appearences
          'chance': 0  // chance to get a better offer
        };
        offersStats[i] = c;
      }

      for (let i = 0; i < array.length; i++) {  // first count the occurences of each value
        offersStats[array[i].value].number++;
      }

      for (let i = 0; i < offersStats.length; i++) {  // now calculate the chances
        let sum = 0;
        for (let j = i + 1; j < offersStats.length; j++) {  // now calculate the chances
          sum += offersStats[j].number;
        }
        offersStats[i].chance = sum / array.length;
      }

      return offersStats;
    }

    this.findMax = function (array) {
      let max = 0;
      for (let i = 0; i < array.length; i++) {
        if (array[i] >= array[max]) {
          max = i;
        }
      }
      return max;
    };

    this.findMin = function (array, max, prv) {
      let min = max;
      for (let i = 0; i < array.length; i++) {
        if (array[i] <= array[min] && prv != i) {
          // this.log(`${i} - ${prv}`);
          min = i;
        }
      }
      return min;
    };

    this.findBestForMin = function (array, ref, min) {
      for(let i = 0; i < array.length; i++) {
        if (array[i].counts[min] < ref[min]) {
          this.log(`For ${min + 1} we could offer: ${array[i].counts} | ${array[i].number} | ${array[i].value}`);
          return array[i];
        }
      }
    }

    this.log(`--- item data ---`);
    this.log(` counts | values `);
    this.log(` ${this.counts}  | ${this.values} `);
    this.log(`-----------------`);

    // find all possible offers
    this.allOffers = findAllOffers(this.counts, this.values);
    this.log(`---- possible offers ----`);
    this.log(` counts | number | value `);
    for (let i = 0; i < this.allOffers.length; i++) {
      this.log(`  ${this.allOffers[i].counts} |   ${this.allOffers[i].number}    |   ${this.allOffers[i].value}  `);
    }
    this.log(`-------------------------`);

    // find best possible offers
    this.bestOffers = findBestOffers(this.allOffers, this.counts, this.values);
    this.log(`------ best offers ------`);
    this.log(` counts | number | value `);
    for (let i = 0; i < this.bestOffers.length; i++) {
      this.log(` ${this.bestOffers[i].counts}  |   ${this.bestOffers[i].number}    |   ${this.bestOffers[i].value}  `);
    }
    this.log(`-------------------------`);

    // set value border
    this.valueBorder = this.bestOffers[0].value * p1;

    // set chance border
    this.chanceBorder = p2;

    this.log(`------- borders -------`);
    this.log(`   value   |   chance  `);
    this.log(`     ${this.valueBorder}     |     ${this.chanceBorder}   `);
    this.log(`--------------------`);

    // find all offers' statistics
    this.offersStats = findOffersStats(this.allOffers, this.totalValue)
    this.log(`----- offers statistics -----`);
    this.log(`  offer  |  number |  chance `);
    for (let i = 0; i < this.offersStats.length; i++) {
      this.log(`    ${i}    |    ${this.offersStats[i].number}    | ${this.offersStats[i].chance}`);
    }
    this.log(`-----------------------------`);

  }

  offer (o) {
    this.log(`${this.remRounds} rounds left`);
    this.remRounds--;
    this.currRound++;

    // receive offer
    if (o) {
      let number = 0;
      let value = 0;
      for (let i = 0; i < o.length; i++) {
        number += o[i];
        value += this.values[i] * o[i];  // calculate the total offer valye
        this.oppCounts[i] += o[i]  // count the ammount of offered items for each type
      }

      this.log(`---------- remote offer ----------`);
      this.log(` counts | number | value | chance `);
      this.log(` ${o}  |   ${number}    |   ${value}  | ${this.offersStats[value].chance}`);
      this.log(` -------------------------------- `);
      this.log(` offered so far: ${this.oppCounts}`);
      this.log(`----------------------------------`);

      if (
        this.me == 0  //  we are 1st
        && value >= this.bestOffers[0].value  // the received offer is equal or better than our best possible
      ) {
        return;
      } else if (
          this.me == 1  // we are 2nd
          && (
            value >= this.valueBorder  // the received offer is equal or better than our border
            || this.offersStats[value] <= this.chanceBorder
            || (  // or
              this.remRounds == 0 // it is the last round
              && value > 0  // and it is a non negative offer
            )
          )
      ) {
        return;
      }

    }

    // send offer
    if (this.me == 0 && this.remRounds == 0) {
      this.toOffer.value = 0;
      let prvMin = [-1];
      let max = this.findMax (this.oppCounts);
      if(this.oppCounts[max] == 0) {  // the opponent offered nothing, no need bothering
        this.toOffer = Object.assign({}, this.bestOffers[0]);
      } else {
        let min = this.findMin (this.oppCounts, max, prvMin[prvMin.length - 1]);
        this.log(`According to the remote offers so far ${this.oppCounts} the most probable valuable object type for the opponent is type ${min + 1}`);
        this.toOffer =
        Object.assign({}, this.findBestForMin (this.bestOffers, this.counts, min));
        if (this.toOffer != null) {
          // OK
        } else {
          this.toOffer = Object.assign({}, this.bestOffers[0]);
        }
      }
    } else {
      this.toOffer = Object.assign({}, this.bestOffers[0]);
    }

    this.log(`----- script offer ------`);
    this.log(` counts | number | value `);
    this.log(` ${this.toOffer.counts}  |   ${this.toOffer.number}    |   ${this.toOffer.value}  `);
    this.log(`-------------------------`);

    return this.toOffer.counts;

  }

};
