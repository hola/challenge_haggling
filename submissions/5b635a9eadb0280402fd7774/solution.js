'use strict'; /*jslint node:true*/


/*                  A little greedy algorithm
If last offer will make this bot it offer things valued from 0 to 40% valued.
On last offer opponent must accept it if he want to win in long period.

If last offer will make opponent, bot will offer things from 0 to 99% valued.
*/

//curently code isn't beautiful and full of mistakes...

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds; //changing on every round
	this.max_rounds = max_rounds; //always shows maximum rounds number
        this.min = 9999; //minimum value more then zero
        this.min_counter = 0; //number of minimum valued things
	this.last_turn_yours = true; //flags who will do last turn
	this.never_been_offered = []; //things that never been offered for change
	//this.balanced_values = []; //maybe use some balnced values between values for you and your opponent?
	this.opponent_values = []; //values for opponent //need to be changed!!
	this.opponent_values_in_percents = [];
	this.previous_opponent_offer = [];
	this.give_in_persents = []; // number in percents how much be given
        this.log = log;
        this.total = 0;
	this.items_quantity = 0;
	this.items_numbered = [];
	this.allCombinations = [];
	this.step_number = -1;
	this.values_in_percents = [];
        this.opponent_zero_values = [];

	this.step_in_percents = 0;

	//init arrays
        for (let i = 0; i<counts.length; i++)
            this.total += counts[i]*values[i];

	for (let i = 0; i<this.values.length; i++)
            this.never_been_offered[i] = 1;
	    
	for (let i = 0; i<this.values.length; i++)
            this.opponent_values[i] = 1;

	for (let i = 0; i<this.counts.length; i++)
            this.items_quantity += this.counts[i];

	for (let i = 0; i<this.items_quantity; i++)
	    this.items_numbered[i] = i;

	for (let i = 0; i<this.values.length; i++)
	    this.values_in_percents[i] = this.values[i]/(this.total/100);

        //this.log(`${this.items_numbered} -- items numbered values`);
	this.allCombinations = this.getAllCombinations(this.items_numbered);

    }
    offer(o){
        this.rounds--;
	this.step_number++;

	if (o)
        {
	    this.detectOpponentZeroValues(o);

	    this.recalcOpponentPrices(o);
	    this.previous_opponent_offer = o;

	    if(this.checkOfferToAccept(o))
		return;

        }

        //on first time always offer max total value to yourself
        if (this.rounds == (this.max_rounds-1))
	{ 
            this.calculate_minimum_values();

	    if(o)
            {
		this.last_turn_yours = true;
            }
            else
            {
                this.last_turn_yours = false;
            }

	    this.calculateStep();

            o = this.counts.slice();
            for (let i = 0; i<o.length; i++)
            {
                if(!this.values[i])
                    o[i] = 0;
            }

            return o;
	}

        o = this.counts.slice();

	o = this.getOffer(o);

	//this.log(`${o}  - o values`);
        return o;
    }

    detectOpponentZeroValues(o)
    {
	    if(this.rounds==(this.max_rounds-1))
	    {
	        for(let i=0; i<o.length ;i++)
	        {
		    if((o[i]==this.counts[i])&&(this.counts[i])>1)
		    {
			this.opponent_zero_values[i]=1;
			this.opponent_values[i] = 0;
		    }
	        }
	    }
	    else
	    {
                for(let i=0; i<o.length ;i++)
	        {
		    if(o[i]<this.counts[i])
		    {
			this.opponent_zero_values[i]=0;
			this.opponent_values[i] +=1; 
		    }
	        }
	    }
    }

    getOpponentPriceInPercentsByNumber(numb)
    {
	let it = 0;

        for(let i = 0; i<this.counts.length; i++)
	{
	    for(let j = 0; j<this.counts[i]; j++)
	    {
		if(numb == it)
		{
		    return this.opponent_values_in_percents[i];
		}
		it++;
            }
	}
    }

    getYourPriceInPercentsByNumber(numb)
    {
	let it = 0;

        for(let i = 0; i<this.counts.length; i++)
	{
	    for(let j = 0; j<this.counts[i]; j++)
	    {
	        if(numb == it)
		{
		   return this.values_in_percents[i];
		}
		it++;
	    }
	}
	return -999;
    }

    checkOfferToAccept(o)
    {
        let sum = 0;
        for (let i = 0; i<o.length; i++)
            sum += this.values[i]*o[i];

	let percent = sum/(this.total/100);

	if(this.last_turn_yours == true)
        {
	    if((this.rounds <= 4)&&(percent >= 90))
	    {
		return true;
            }
	    if((this.rounds <= 3)&&(percent >= 70))
	    {
		return true;
            }

		
	    if(this.rounds == 1)
            {
		   for(let i =0;i<this.values.length;i++)
		   {
			   if(this.values[i]==0)
			   {
                               if(sum >0)//or this.min
                                   return true;
			   }
			   else
			   {
			       if(sum >this.min)//or this.min
                                   return true;
			   }
		   }
            }

	    if (this.rounds == 0)
            {
		if(sum >0)//or this.min
		{
                    return true;
		}
            }

	}
        else
        {

	    if((this.rounds <= 4)&&(percent >= 90))
	        return true;

	    //maybe ~68%
            if ((this.rounds <=3)&&(percent >= 80))
                return true;

	    if ((this.rounds <=2)&&(percent >= 70))
                return true;

	    if((percent>=100-(this.min/(this.total/100)))&&(sum>0)&&(this.rounds == 0))
	    {
	        return true;
	    }

        }
	return false;
    }

    getOffer(o)
    {
        let comb = [];
	comb = this.calculateForThisTurn();

	for(let i=0;i<o.length;i++)
		o[i]=this.counts[i];

	for(let k=0; k<comb.length; k++)
	{
	    let it = 0;
	    for(let i=0;i<o.length;i++)
	    {
		let counter = 0;
		for(let j=0;j<this.counts[i];j++)
		{
		    if(parseInt(comb[k])==it)
	            {
			    //counter++;
			    if(o[i]>0)
			        o[i]-=1;
		    }
		    it++;
		}
	    }
	}

        return o;
    }

    calculateForThisTurn()
    {
	    let acceptableCombinationsForOpponent = [];
	    let acceptableCombinations = [];
	    let percent = this.step_number*this.step_in_percents;
	    

	    if(percent>99)
		    percent=99;

	    //find all acceptable combination for enemy values
	    for(let i = 0; i<this.allCombinations.length; i++)
	    {
		let value_in_percents = 0;
		if(value_in_percents<=percent)
		{
		    acceptableCombinationsForOpponent.push(this.allCombinations[i]);
		}

	    }

	    if(acceptableCombinationsForOpponent.length == 0)
		    acceptableCombinationsForOpponent = this.allCombinations;

	    //find all acceptable combination for your values
	    for(let i = 0; i<acceptableCombinationsForOpponent.length; i++)
	    {
		    let value_in_percents = 0;
		    value_in_percents = this.getYourPriceInPercentsByCombination(acceptableCombinationsForOpponent[i]);

		    if(value_in_percents<=percent)
			    acceptableCombinations.push(acceptableCombinationsForOpponent[i]);
	    }

	    let maxValue = 0;
	    let yourValue = 0;
	    let combinationWithMaxValue = [];

	    for(let i = 0; i<acceptableCombinations.length; i++)
	    {

		    let value = this.getOpponentPriceInPercentsByCombination(acceptableCombinations[i]);
		    let your_value = this.getYourPriceInPercentsByCombination(acceptableCombinations[i]);

		    if((maxValue<value)&&(your_value < 100))
		    {
		        maxValue = value;
			yourValue = your_value;
			combinationWithMaxValue = acceptableCombinations[i];
		    }
	    }

	    for(let i = 0; i<acceptableCombinations.length; i++)
	    {
                let your_value = this.getYourPriceInPercentsByCombination(acceptableCombinations[i]);
                let value = this.getOpponentPriceInPercentsByCombination(acceptableCombinations[i]);


                if((acceptableCombinations[i].length>combinationWithMaxValue.length)&&(value>=maxValue))
                                combinationWithMaxValue = acceptableCombinations[i];
	    }

	    let sum = 0;
            sum = this.getOpponentPriceInPercentsByCombination(combinationWithMaxValue);
	    if((sum==0)&&(this.rounds==1))
	    {
                this.step_in_percents += 10;
		this.calculateForThisTurn();
	    }

	    return combinationWithMaxValue;
    }

    //get Min price not zero element
    getMinPriceElementForYou()
    {
	    let element_numb = 99999;
	    let min_price = 999999;

	    let it = 0;
	    for(let i = 0; i<this.values.length; i++)
	    {
		for(let j = 0; j<this.counts[i]; j++)
		{
		    if((this.values[i] < min_price)&&(this.values[i]>0))
		    {
		        min_price = this.values[i];

			element_numb = it;
		    }

		    it++;
	        }
	    }
	    return element_numb;
    }

    getYourPriceInPercentsByCombination(comb)
    {

	let price = 0;
	for(let i = 0; i<comb.length; i++)
	{
		let temp_price = this.getYourPriceInPercentsByNumber(comb[i]);

		price += temp_price;
	}

	return price;
    }


    getOpponentPriceInPercentsByCombination(comb)
    {

	let price = 0;

	for(let i = 0; i<comb.length; i++)
	{
		let temp_price = this.getOpponentPriceInPercentsByNumber(comb[i]);

		price+=temp_price;
	}

	return price;
    }

    getCombinations(chars) {
        var result = [];
	var prefix = [];
        var f = function(prefix, chars) {
            for (var i = 0; i < chars.length; i++) {
		var prefix2 = prefix;
		prefix2.push(chars[i]);
		result.push(prefix2);
                f(prefix2, chars.slice(i + 1));
            }
        }
        f(prefix, chars);

        return result;
    }

    getAllCombinations(arr) {

        let i, j, temp
        let result = []
        let arrLen = arr.length
        let power = Math.pow
        let combinations = power(2, arrLen)
  
        for (i = 0; i < combinations;  i++) {
            temp = ''
    
            for (j = 0; j < arrLen; j++) {
                // & is bitwise AND
                if ((i & power(2, j))) {
                    temp += arr[j]
            }
        }
	if(temp!='')	
            result.push(temp)
        }


	for(let i = 0; i<result.length; i++)
	{
		let price = 0;
		for(let j =0; j<result[i].length; j++)
		{

			price+=parseInt(result[i][j]);
		}
	}
        return result
    }

    calculate_minimum_values()
    {
        for (let i = 0; i<this.values.length; i++)
        {

	    if ((this.values[i] <= this.min)&&(this.values[i] > 0))
	    {
                this.min = this.values[i];
	    }
        }

	//calculate quantity of minimum values
	for (let i = 0; i<this.values.length; i++)
        {
            if(this.min == this.values[i])
            {
                this.min_counter++;
            }
        }
	
    }

    calculateStep(){

	if(this.last_turn_yours==true)
	{
	    this.step_in_percents = 100/(this.max_rounds-1);
	}

	if(this.last_turn_yours==false)
	{
            this.step_in_percents = 40/(this.max_rounds-1);
	}
    }

    recalcOpponentPrices(o) {

	    if(!this.compareArrays(o, this.previous_opponent_offer))
	    {

	    	for (let i = 0; i<o.length; i++)
	    	{
    	         	if(o[i]!=0)
		     	    this.never_been_offered[i] = 0;
                }

	        for (let i = 0; i<o.length; i++)
	        {
		    if(this.never_been_offered[i] != 0)
		        this.opponent_values[i] += 1;
                }

	        this.recalcPercentValues()
	    }
	    return;
    }

    recalcPercentValues() {

	    let sum = 0;

	    for (let i = 0; i < this.opponent_values.length; i++)
	    {
		 sum += this.opponent_values[i]*this.counts[i]; 
            }

	    for (let i = 0; i < this.opponent_values.length; i++)
	    {
		this.opponent_values_in_percents[i] = this.opponent_values[i]/(sum/100);
	    }

    }
    
   compareArrays(arr1, arr2) {
	if(arr1.length == arr2.length)
	{
		for(let i=0; i<arr1.length; i++)
		{
                    if(arr1[i] != arr2[i])
		        return false;
		}
	}
	else
	{
            return false;
	}
	    return true;
    } 

};
