There is no any machine learning, deep learning and other modern things here. It's an old school naive strategy. Here it is:

1. If I get a suggestion with the max value, I agree;
2. I form an ARRAY containing all the possible sets of the items in decreasing order;
3. Also I keep the best set suggested by the opponent;
4. During a round I suggest a new set from the ARRAY, and during the next round I suggest the next set and so on;
5. From round 1 to round 4, if I am suggested a better set than I'm going to suggest, I agree;
6. If my next suggestion worse than the best opponent's one, I suggest this best opponent's set;
7. If the opponent is not going to haggle (suggest the same set all the time), I do the same thing;
6. In the last round, if I suggest a set, I return the best set suggested by the opponent from the first 4 round. In the other case, I just agree on any suggestion.

So the strategy is kind of "try to get the best set for yourself, if it's not possible, agree with everything".