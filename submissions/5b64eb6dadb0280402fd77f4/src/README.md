## Implementation of haggling challenge for Hola

The strategy is the following:

1. First, a script finds all possible variants of objects which can be offered. Then it 
calculates cost for each set and stores all such sets under corresponding cost.  
Only sets whose cost is equal or greater than a half of total cost participate in haggling.

2. At each round the script obtains each set under each cost 
(from greater to lower by cost and starting from half amount of objects), 
so the most profitable sets are offered first. All sets are offered only once if number of 
rounds is equal or lower than number of variants, otherwise sets will be offered repeatedly.
If there are more than one set under cost then first sets with least amount of objects 
are offered.

3. During haggling:
    * All opponent's offers are collected.
    * If an opponent offers objects whose total cost is equal or greater than total cost of
    the current round then the script accepts the offer, otherwise the script is making 
    profitable counter-offer. This strategy is used till the final round.
    * If the final round has been reached without an agreement it is better to end up 
    haggling with some profit. 
        * If the script was the one which made the first move then at the final round it must make the 
        final offer. It tries to find the most profitable offer with most objects 
        from ones that were proposed by the opponent 
        during haggling and makes counter-offer using this offer. At this stage an offer is considered 
        as profitable if its cost for the script is equal or greater than a half. The opponent may accept 
        its own offer with high probability. The script may lose this haggling but it could earn at least 
        a half if the opponent accepts. If profitable offer is not found then the script makes next available 
        offer.
        * If the opponent was the one who made the first move then at the final round the script 
        must accept or decline his offer. It calculates cost of offered objects and if it is equal or 
        greater than a half of total cost it accepts the offer. Otherwise, it makes counter-offer which 
        ends haggling with 0/0 scores.
