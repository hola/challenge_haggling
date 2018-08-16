Since there are not so much rounds, the most algorithms will try to play to gain as much as possible. In order to make sure that they will get anything, players will need also think about opponent values, since both players must agree with a deal. Both players will try to get Nash equilibrium. So on a first step we will get N/2 element (if n is odd than N/2+1) with maximum values for ourself. This is our first offer and at the same time the maximum offer that we want to. Sum/2 of the entire deal is our minimal value that we can take from the offer.

After every opponent's offer we will modify opponent's priority for each value, so as more deals he perform as more clear we can see what values does he want. Before sending our response, we will modify it by finding maximum value from his priority and see if we can give him this value. If we also want this item we will try to find group of element that can substitute our element. We will perform this operation N/2 times. 

So our offers will be based on opponent priority, so as more we rounds as more clear we can try to get him desirable values.

In the last round we agree with any offer that equal or less of minimal value of the offer that we found in the begging.

To improve, this is a first version of the program:

	Improve the sum of acceptance depend on round and your own priority.
	Improve number substitution on offer depend on opponent priority (right now it is N/2 which in some cases will be less than that)  
