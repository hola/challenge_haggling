'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log){
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.rounds = max_rounds;
    this.cRound = 0;
    this.log = log;
    this.typeCnt = counts.length;
    this.total = 0;
    for (let i = 0; i < this.typeCnt; ++i)
      this.total += this.counts[i] * this.values[i];
  }


  /**
   * Trade
   *
   * @param  {array} objects - things for me
   * @return {number} response to an opponent
   */
  offer(objects){
    		
    // my first word?
    if (!objects){

      objects = new Array(this.typeCnt);  

      // recruit ourselves to the maximum
      for (let i = 0; i < this.typeCnt; ++i){
        if (this.values[i] > 0) objects[i] = this.counts[i];
        else objects[i] = 0;
      }
	}
	else{
	
	  // how many objects did your opponent keep
      let oppObjects = new Array(this.typeCnt);
      for (let i = 0; i < this.typeCnt; ++i)
        oppObjects[i] = this.counts[i] - objects[i];
	
	  let minProb = 20;  // set probability of my winning
		
      // round last?
      if (this.cRound == this.rounds - 1)
        minProb = 15;	 	 
	  
	  // probability of my winning
	  objects = this.probabilityCycle(objects, oppObjects, minProb) ? undefined : objects;
    }
    	
	++this.cRound;
	return objects;
  }


  /**
   * Сalculation of probability of my winning
   *
   * @param {array} myObjects - my's things
   * @param {array} oppObjects - opponent's things
   * @param {number} minProb - the minimum probability for which I agree
   * @return {number} response to an opponent
   */
  probabilityCycle(myObjects, oppObjects, minProb){

    let ret = true;  
    while (true){

      // all variants of the sums of the opponent's winnings
      let allVarOpp = this.allVariantOpp(oppObjects);

      // my winnings
      let myValue = 0;
      for (let i = 0; i < this.typeCnt; ++i)
        myValue += myObjects[i] * this.values[i];

      // probability of my winning
      let Pm = 0.;
      for (let i = 0; i < allVarOpp.length; ++i)
        if (myValue >= allVarOpp[i]) Pm += 1.;

      Pm = Pm * 100. / allVarOpp.length;

      if (Pm > minProb){
        break; // I agree
      }
      else{
        ret = false; 

        // thing min value of the remaining
        let minVal = this.total, inx = 0;
        for (let i = 0; i < this.typeCnt; ++i){
          if ((oppObjects[i] > 0) && (this.values[i] < minVal) && (this.values[i] > 0)){
            minVal = this.values[i];
            inx = i;
          }
        }

        // delete from your opponent and add yourself
        oppObjects[inx] -= 1;
        myObjects[inx] += 1;
      } 
    }

    return ret;
  }


  /**
   * All variants of the sums of the opponent's winnings
   *
   * @param {array} oppObjects - opponent's things
   * @return {array} variants of the sums of the opponent's
   */
  allVariantOpp(oppObjects){

    function summ(cSum, objCnt, total, values, iVl, outSumm){

      for (let v = 0; v < values[iVl]; ++v){

        if ((iVl + 1) < objCnt.length)
          summ(cSum + v * objCnt[iVl], objCnt, total, values, iVl + 1, outSumm);
        else{
          var val = cSum + v * objCnt[iVl];
          if (val <= total)
            outSumm.push(val);
        }
      }  
    };

    // number of variants of the price of each type
    let values = new Array(this.typeCnt);
    for (let i = 0; i < this.typeCnt; ++i)
      values[i] = Math.floor(this.total / this.counts[i]);

    // Consider an opponent's winnings for all possible options
    let resSumm = [];
    summ(0, oppObjects, this.total, values, 0, resSumm);

    return resSumm;
  } 
 
 
};