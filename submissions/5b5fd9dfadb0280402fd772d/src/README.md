In the first round, if my word is the first, take it to the maximum.
 
In each round, we consider the probability of winning:
    
   Pv = MY_VICTORY_VARIANTS / OPP_ALL_VARIANTS * 100

where
    MY_VICTORY_VARIANTS - is the number of my wins if myValue> = oppValue (from all variants opponent)

    OPP_ALL_VARIANTS - the total number of options from the opponent

Further, if Pv < minPv, then we select the object of minimum cost and take it ourselves.
Then we again count the odds. And so on until we reach the right threshold.
The threshold for the probability of 35% is chosen in the simulation.