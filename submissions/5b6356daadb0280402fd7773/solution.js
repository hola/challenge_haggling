module.exports = class 
{

        constructor(me, counts, values, max_rounds, log)

        {

            //me — 0, если ваша очередь первая, или 1, если вторая.
            this.me = me;
            //counts — массив целых чисел, содержащий количество объектов каждого типа. Он содержит от 2 до 10 элементов.
            this.counts = counts;
            //values — массив целых чисел такой же длины, что и counts, описывающий ценность объекта каждого из типов для вас.
            this.values = values;
            //max_rounds — число раундов переговоров (каждый раунд состоит из двух реплик).
            this.rounds = max_rounds;
            //log — функция, которую можно вызывать для отладочного вывода (console.log работать не будет).
            this.log = log;
			// define the maximal sum
            this.sum = dotProduct(this.counts, this.values);



            //this.minWeightTreshold = max(Math.ceil(sum / 2), sum - 1);

            //this.minResTreshold = sum;

        }

        //Метод offer должен вернуть undefined, если вы принимаете предложение (кроме случая, когда o равно undefined).

        offer(o)
        {
            this.rounds--;

			// me start round
			if(0 == this.me )
			{
				// special case: very first round - propose the best for me offer
				if(typeof o === "undefined")
				{
					var acceptThresholdScore = Math.ceil(this.sum * 0.9);
					var myOffer = getMyOffer(this.values, null, this.counts, this.sum, acceptThresholdScore);
					return myOffer;
				}
				
				// check if offer can be accepted - used variable threshold according to round index
				var proposedScore = dotProduct(o, this.values);
				// define level of thresholds as function of ...
				var acceptLevel = [0.9, 0.8, 0.7, 0.6];
				var acceptLevelIdx = Math.min(3 - Math.min(this.rounds, 3), 3);
				var acceptThresholdScore = Math.ceil(this.sum * acceptLevel[acceptLevelIdx]);
                // check if order can be accepted
				if (proposedScore >= acceptThresholdScore)
				{
					return;
				}
				
			    // calculate offer for opponent
				acceptLevel = [0.8, 0.7, 0.6, 0.5];
				acceptThresholdScore = Math.ceil(this.sum * acceptLevel[acceptLevelIdx]);
				var myOffer = getMyOffer(this.values, o, this.counts, this.sum, acceptThresholdScore);
				return myOffer;
			}
			else // opponent start round
			{
				var proposedScore = dotProduct(o, this.values);
				// special case: last round
				if(0 == this.rounds)
				{
					if(0 > proposedScore)
					{
						// accept any offer above 0
						return;
					}
					else
					{
						// sorry, too greedy opponent will have zero
						return o;
					}
				}
				
				// check if offer can be accepted
				// define level of thresholds as function of ... how solution is good for me
				var acceptLevel = [0.8, 0.7, 0.6, 0.5];
				var acceptLevelIdx = Math.min(4 - Math.min(this.rounds, 4), 3);
				var acceptThresholdScore = Math.ceil(this.sum * acceptLevel[acceptLevelIdx]);
			    // check if order can be accepted
				if (proposedScore >= acceptThresholdScore)
				{
					return;
				}
			    // calculate offer for opponent
				acceptLevel = [0.7, 0.6, 0.5, 0.4];
				acceptThresholdScore = Math.ceil(this.sum * acceptLevel[acceptLevelIdx]);
				var myOffer = getMyOffer(this.values, o, this.counts, this.sum, acceptThresholdScore);
				return myOffer;
			}

		}
}




            // ========================================================================

            // class c-tor to store statistics per result

            // ========================================================================

            function Stat(solution, mainVal, secondaryVal)

            {

                this.solution = solution;

                this.mainVal = mainVal;

                this.secondaryVal = secondaryVal;

            }



            // ========================================================================

            // custom compare function will be used to sort 'statistics' class objects

            // stored in array

            // ========================================================================

            function compare(a, b)

            {

                if (a.mainVal > b.mainVal) return -1;

                if (a.mainVal < b.mainVal) return 1;

                if (a.secondaryVal > b.secondaryVal) return -1;

                if (a.secondaryVal < b.secondaryVal) return 1;

                return 0;

            }



            // ========================================================================

            // gets array and advances its value according to limits, if limits are 9:

            // 000 -> 100 -> 200 -> ... -> 900 -> 010

            // return true if succeed, otherwise false

            // ========================================================================

            function advanceCounter(inp, limits)

            {

                var sz = inp.length;

                if (sz != limits.length) return null;



                for (var i = 0; i < sz; ++i)

                {

                    if (++inp[i] <= limits[i])

                    {

                        return inp;

                    }

                    inp[i] = 0;

                }

                return null;

            }



            // ========================================================================

            // scalar (dot) product of 2 vectors

            // ========================================================================

            function dotProduct(a, b)

            {

                var sz = a.length;

                if (sz != b.length) return null;

                var sum = 0;

                for (var i = 0; i < sz; ++i)

                {

                    sum += a[i] * b[i];

                }

                return sum;

            }



            // ========================================================================

            // substraction of 2 vectors

            // ========================================================================

            function substract(a, b)

            {

                var sz = a.length;

                if (sz != b.length) return null;

                var res = new Array(sz);

                for (var i = 0; i < sz; ++i)

                {

                    res[i] = a[i] - b[i];

                }

                return res;

            }



            // ========================================================================
            // create all possible combinations of vector whose value at i can be from 0 to limits[i]
            // ========================================================================
            function addAllCombination(limits)

            {

                data = [];

                var sz = limits.length;

                var inp = new Array(sz);

                inp.fill(0);



                while ((inp = advanceCounter(inp, limits)) != null)

                {

                    data.push(inp.slice());

                    //alert(data);                    

                }

                return data;

            }



            // ========================================================================
            // create all combinations of solutions whose values are limited by 'limits'
            // where dot(combination,weights) == sum
            // ========================================================================
            function addAllCombinationWithThreshold(limits, weights, sum)

            {

                var data = [];

                var sz = limits.length;

                var inp = new Array(sz);

                inp.fill(0);

                while ((inp = advanceCounter(inp, limits)) != null)

                {

                    if (sum == dotProduct(inp, weights))

                    {

                        data.push(inp.slice());

                    }

                }

                return data;

            }



            // =================================================================================
            // calculates all possible weights whose dot product between weight and 'quantity'
            // is equal to 'sum'.
            // For example, lets quantity of elements per type, is defined by (3,1,2)
            // Then can be defined limits for desired weights too: (3,10,5). Now will be created all possible
            // weights with values between (0,0,0) and (3,10,5) from which will be selected weights whose
            // dot product with 'quantity' yields 'sum'
            // =================================================================================
            function calcAllPossibleWeights(quantity, sum)

            {

                var sz = quantity.length;

                // find limits per weight

                var limits = new Array(sz);

                for (var i = 0; i < sz; ++i)

                {

                    var val = quantity[i];

                    limits[i] = (val > 0 ? Math.floor(sum / val) : 0);

                }

                return addAllCombinationWithThreshold(limits, quantity, sum);

            }



            // ========================================================================
            // check if at least 1 field in vector is equal to 0 or to limit
            // ========================================================================
            function checkLimits(limits, inp)

            {

                var sz = limits.length;

                if (sz != inp.length)

                {

                    return false;

                }

                for (var i = 0; i < sz; ++i)

                {

                    if (0 == inp[i] || limits[i] == inp[i])

                    {

                        return true;

                    }

                }

                return false;

            }




            // ========================================================================
            // generate all possible solutions, every solution field is limited by limits
            // and at least 1 field should be equal to corresponding limit.
            // minResTreshold <= solution * myWeight <= sum
            // for example myWeight are (3,1,2); quantity are (1,2,3) and sum should be less than 10.
            // returns all possible solutions (x,y,z), where scalar product: (3,1,2)*(x,y,z)<=10
            // 0<=x<=1; 0<=y<=2; 0<=z<=3;
            // ========================================================================
            function getAllSolutions(limits, myWeight, sum, minResTreshold)

            {

                var data = [];

                var sz = limits.length;

                var inp = new Array(sz);

                inp.fill(0);

                while ((inp = advanceCounter(inp, limits)) != null)

                {

                    var res = dotProduct(inp, myWeight);

                    if (sum >= res && res >= minResTreshold && checkLimits(limits, inp))

                    {

                        data.push(inp.slice());

                    }

                }

                return data;

            }



            // =================================================================================
            // returns offer to opponent by selecting most popular solution matching 'minResTreshold'
            // decision will be made using statistics based on opponent mean score when
            // possible solution substituted into all valid weigths and my score per solution
            // =================================================================================
            function getOffer(myWeight, quantity, sum, minResTreshold)

            {

                // get all acceptable for me solutions

                var solutions = getAllSolutions(quantity, myWeight, sum, minResTreshold);

                var nSolutions = solutions.length;

                // get all possible weigths respective to 'quantity' and 'sum'

                var weigths = calcAllPossibleWeights(quantity, sum);

                var nWeights = weigths.length;

                var len = quantity.length;

                // result

                var offer = [];




                for (var s = 0; s < nSolutions; ++s)

                {

                    var mySolution = solutions[s];

                    var opponentSolution = substract(quantity, mySolution);



                    var myScore = dotProduct(mySolution, myWeight);

                    var sum = 0;

                    for (var w = 0; w < nWeights; ++w)

                    {

                        var opponentScore = dotProduct(opponentSolution, weigths[w]);

                        sum += opponentScore;

                    }

                    //alert("mySolution="+mySolution+" opponentSolution="+opponentSolution+" myScore="+myScore+" sum="+sum);

                    offer.push(new Stat(mySolution, myScore, sum));

                }

                offer.sort(compare);

                return offer;

            }




            // =================================================================================
            // calculate all weights giving score more than threshold for proposed solution
            // select any solution according to the weights giving the maximal score for me
            // if there are equal maximal scores for me - select one with maximal
            // =================================================================================
            function getResponse(myWeights, offer, quantity, sum, minWeightTreshold, minResTreshold)

            {

                // calculate score for proposed solution

                var score = dotProduct(offer, myWeights);

                var response = [];



                if (score >= minResTreshold)

                {

                    // good proposition nothing to do

                    return response;

                }



                // get all possible weigths respective to 'quantity' and 'sum'

                var weigths = calcAllPossibleWeights(quantity, sum);

                var nWeights = weigths.length;

                var opponentSolution = substract(quantity, offer);

                // select weigths relevant for opponent

                var acceptWeights = [];

                for (var idx = 0; idx < nWeights; ++idx)

                {

                    var weight = weigths[idx];

                    if (dotProduct(weight, opponentSolution) >= minWeightTreshold)

                    {

                        acceptWeights.push(weight.slice());

                    }

                }

                var nAcceptWeights = acceptWeights.length;

                if (0 == nAcceptWeights)

                {

                    // something wrong ...

                    return response;

                }



                // get all acceptable for me solutions

                var solutions = getAllSolutions(quantity, myWeights, sum, minResTreshold);

                var nSolutions = solutions.length;



                // get any solution giving maximal sum for opponent

                for (var s = 0; s < nSolutions; ++s)

                {

                    var mySolution = solutions[s];

                    var opponentSolution = substract(quantity, mySolution);

                    var myScore = dotProduct(mySolution, myWeights);

                    // calculate sum of scores for opponent per solution

                    var sum = 0;

                    for (var w = 0; w < nAcceptWeights; ++w)

                    {

                        var opponentScore = dotProduct(opponentSolution, acceptWeights[w]);

                        sum += opponentScore;

                    }

                    // fill statistics

                    if (sum > 0)

                    {

                        response.push(new Stat(mySolution, sum, myScore));

                    }

                }

                if (0 == response.length)

                {

                    // probably wrong thresholds for data were selected

                    return response;

                }

                response.sort(compare);

                return response;

            }

            // =================================================================================
            // calculate all solution whose score less or equal to maxScore and sort them by score and by weighted number of elements
            // the number of elements in solution weighted by opponent offer relative to total number of elemenets of specific tpe 
            // =================================================================================
            function getMyOffer(myWeights, offer, quantity, sum, maxScore)
            {
                // calculate weight per type of element
                var sz = quantity.length;
                var maxQuantity = dotProduct(quantity, (new Array(sz)).fill(1));

                var weights = new Array(sz);
                if (null == offer)
                {
                    weights.fill(1);
                }
                else
                {
                    var opponentSolution = substract(quantity, offer);
                    for (var i = 0; i < sz; ++i)
                    {
                        weights[i] = opponentSolution[i] / quantity[i];
                    }
                }
                // calculate all solution with score limited by maxScore
                var response = [];
                var inp = new Array(sz);
                inp.fill(0);
                while ((inp = advanceCounter(inp, quantity)) != null)
                {
                    var score = dotProduct(inp, myWeights);
                    if (maxScore >= score)
                    {
                        response.push(new Stat(inp.slice(), score, maxQuantity - dotProduct(inp, weights)));
                    }
                }

                // check if failed to find solutions - return default one
                if (response.length == 0)
                {
                    // something wrong - return some default solution
                    var o = quantity.slice();
                    for (let i = 0; i < o.length; i++) {
                        if (!myWeights[i])
                            o[i] = 0;
                    }
                    return o.slice();
                }

                // get solution most suitable for opponent
                response.sort(compare);
                //return response;
                return response[0].solution.slice();
            }

