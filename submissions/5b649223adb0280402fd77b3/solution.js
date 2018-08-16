'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor (me, counts, values, max_rounds, log) {
    let p1 = 0.7;
    let p2 = 0.3;

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
    this.allOffers = new Array();  // list of all possible offers
    this.bestOffers = new Array();  // list of most profitable offers
    this.toOffer = {};  // current offer to send

    this.totalValue = 0;  // total possible items value
    for (let i = 0; i < this.counts.length; i++) {
      this.totalValue += this.counts[i] * this.values[i];
    }

    function addNodeAt (array, node, index, bound) {
      if (array[index] != null) {
        if (node.value >= array[index].value // new node's value is larger
        || node.value == array[index].value  // or same value with less items
        && node.number < array[index].number) {
          while (index < bound) {
            if (array[index] != null) {
              let tmp = array[index];
              array[index] = node;
              node = tmp;
              index++;
            } else {
              array[index] = node;
              index = bound;  // break;
            }
          }
        }
      } else {
        array[index] = node;
        index = bound;  // break;
      }
      return index;
    };

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

    function findBestOffers (array, counts, values, border, bound) {
      let bestOffers = new Array();
      for (let i = 0; i < array.length; i++) {
        if (values[0] == 0 && array[i].counts[0] != 0
        || values[1] == 0 && array[i].counts[1] != 0
        || values[2] == 0 && array[i].counts[2] != 0  // skip offer if for a zero value there is a non zero count
        || counts[0] + counts[1] + counts[2]
        == array[i].number  // do not ask everything
        || array[i].value < border  // compare with minimum acceptable offer value
        ) {
          // skip
        } else {
          for (let j = 0; j < bound; j++) { // compare with list of best offers
            j = addNodeAt(bestOffers, array[i], j, bound);
          }
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

    this.log(`--- item data ---`);
    this.log(` counts | values `);
    this.log(` ${this.counts}  | ${this.values} `);
    this.log(`-----------------`);

    // set value border
    this.valueBorder = this.totalValue * p1;

    // set chance border
    this.chanceBorder = p2;

    this.log(`------- borders -------`);
    this.log(`   value   |   chance  `);
    this.log(`     ${this.valueBorder}     |     ${this.chanceBorder}   `);
    this.log(`--------------------`);

    // find all possible offers
    this.allOffers = findAllOffers(this.counts, this.values);

    // find best possible offers
    this.bestOffers = findBestOffers(this.allOffers, this.counts, this.values, this.valueBorder, this.maxRounds);

    this.log(`---- possible offers ----`);
    this.log(` counts | number | value `);
    for (let i = 0; i < this.allOffers.length; i++) {
      this.log(`  ${this.allOffers[i].counts} |   ${this.allOffers[i].number}    |   ${this.allOffers[i].value}  `);
    }
    this.log(`-------------------------`);

    // no best offer found
    while (this.bestOffers.length == 0) {
      this.log(`no best offer found, lowering border to ${this.valueBorder - 1} and searching again...`);
      this.valueBorder --;
      this.bestOffers = findBestOffers(this.allOffers, this.counts, this.values, this.valueBorder, this.maxRounds);
    }

    this.log(`------ best offers ------`);
    this.log(` counts | number | value `);
    for (let i = 0; i < this.bestOffers.length; i++) {
      this.log(` ${this.bestOffers[i].counts}  |   ${this.bestOffers[i].number}    |   ${this.bestOffers[i].value}  `);
    }
    this.log(`-------------------------`);

    // if not enough best offers, "stretch" the existing ones
    if (this.bestOffers.length != this.maxRounds) {
      this.log(`------- stretching ------`);
      if (this.bestOffers.length == 1) {  // only one best offer
        for (let i = 1; i < this.maxRounds; i++) {
          this.bestOffers[i] = this.bestOffers[0];
        }
      } else {
        addNodeAt(this.bestOffers, this.bestOffers[0], 0, this.maxRounds);  // add 1st best node
        if (this.bestOffers.length != this.maxRounds) {
          addNodeAt(this.bestOffers, this.bestOffers[2], 2, this.maxRounds); // add 2nd best node
        }
        if (this.bestOffers.length != this.maxRounds) {
          addNodeAt(this.bestOffers, this.bestOffers[0], 0, this.maxRounds);  // add 1st best node
        }
      }
      this.log(`-------------------------`);
      this.log(`------ best offers ------`);
      this.log(` counts | number | value `);
      for (let i = 0; i < this.maxRounds; i++) {
        if (this.bestOffers[i] != null) {
          this.log(` ${this.bestOffers[i].counts}  |   ${this.bestOffers[i].number}    |   ${this.bestOffers[i].value}  `);
        }
      }
      this.log(`-------------------------`);
    }

    this.offersStats = findOffersStats(this.allOffers, this.totalValue)

    this.log(`----- offers statistics -----`);
    this.log(`  offer  |  number |  chance `);
    for (let i = 0; i < this.offersStats.length; i++) {
      this.log(`    ${i}    |    ${this.offersStats[i].number}    | ${this.offersStats[i].chance}`);
    }
    this.log(`-------------------------`);

  }

  offer (o) {
    this.log(`${this.remRounds} rounds left`);
    this.remRounds--;
    this.currRound++;

    if(this.bestOffers[this.currRound - 1] != null
    && this.bestOffers[this.currRound - 1].value != 0) {
    // avoid zero value offers
      this.toOffer = this.bestOffers[this.currRound - 1];
    }

    // receive offer
    if (o) {
      let number = 0;
      let value = 0;
      for (let i = 0; i < o.length; i++) {
        number += o[i];
        value += this.values[i] * o[i];
      }

      this.log(`-------- remote offer -----------`);
      this.log(` counts | number | value | chance`);
      this.log(` ${o}  |   ${number}    |   ${value}  | ${this.offersStats[value].chance}`);
      this.log(`-------------------------`);

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

    this.log(`----- script offer ------`);
    this.log(` counts | number | value `);
    this.log(` ${this.toOffer.counts}  |   ${this.toOffer.number}    |   ${this.toOffer.value}  `);
    this.log(`-------------------------`);

    return this.toOffer.counts;
  }

};
