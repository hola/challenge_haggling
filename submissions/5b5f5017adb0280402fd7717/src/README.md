# Variables
    this.counts		 	- Counts
    this.values		 	- My values
    this.total_rounds	 	- Total number of rounds
    this.left_rounds	 	- Number of remaining rounds
    this.log			- Log
    this.total		 	- Maximal reward (total reward)
    this.last_reward	 	- Last reward
    this.me			- Flag who start first (0 - I start first, 1 - oponent start first)
    this.oponent_optimal	- Optimal offers
    this.optimal_wins		- My wins in cases of optimal offers
    this.last_offer		- My last offer
    this.special_offer		- Array with offer of special cases


# Methods
	detect_optimal_offers(w1, w2, w3) - Function to detect all optimal possible offers (offers which maximazes sum of my win and opponent win) by predicted opponent values.
	detect_optimal_offer_by_values(a1, a2, a3, u1, u2, u3, x1, x2, x3) - Function to detect optimal offer (offer which maximazes sum of my win and opponent win) by counts, my values and predicted opponent values.
	find_value(array, value) - Function to check if values set exist in the array of values sets
	specials(w1, w2, w3) - Function to check special cases by predicted opponent values.


# Assumptions
	- Most of people want items only which have some value to them.
	- Some people in first offer can ask for everything and after ask for what them really want.


# Algorithm
	1. When opponent offer first time we exept that he want items only which have some value to them.
	2. Call the function detect_optimal_offers(w1, w2, w3) with flags w1,w2,w3 which indicate if opponent want some item or not (1 - want, 0 - no want).
	3. Function detect_optimal_offers() detect all possible optimal offers by detecting firstly all possible offers and after recognizing only optimal offers by function detect_optimal_offers(w1, w2, w3). In most of times some optimal offer same for different values of opponent and number of optimal offers no so big for special counts (under 5 offers), its good for as because we are can try all.
	4. When we have opptimal offers we are offer firstly the most profitable offer to as.
	5. If opponent dont accept we are offer next most profitable offer to as and we are continue until remind only one offer.
	6. If opponent in the second offer change his offer and this offer include less types of items we are detect new optimal offers.
	7. If we are get offer from opponent with 70% of maximal profit or more than last as offer profit we are accept.
	8. In special case when opponent want only one type of items and count of this type is 2 we are give to opponent only one from two items. (opponent value is 5 in this case)
	9. In the last round, if we are have last word and our profit is more than 0, we are accept.
