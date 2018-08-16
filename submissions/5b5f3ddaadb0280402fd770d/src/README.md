First of all, a little list of main concepts:
================================

1. We don’t need to bluff or deceive our partner, we need to show the most truthful information about our values through our offers.
2. We need to rely on partner offers and our price desires when we are making our offers.
3. The best strategy is to offer maximum for yourself from the start and step by step round by round decrease offer price for yourself and increase for partner. And in the last round it is important to get accept and offer some value for partner. If you are first “player” (Alice) and have the Power Of Last Round, you can try to solve haggling by giving to partner a little value on last round (he will have to accept).
4. Finding and keeping balance in offers is a key to great haggling. So it will be good to has opportunity to adjust it. In this case I will adjust my greed.

Strategy of algorithm:
================================

When I make my offer, first of all, I am choosing desired price for me. It depends on round number and my greed coefficient and calculated with next formula:
   
   priceToKeep = Math.round(totalValue * (max_rounds * greedCoeff - roundNum) / (max_rounds * greedCoeff));         

And when I am choosing what to give to my partner I rely on his offers and more concrete I rely on descending ordered array of less significance coefficients. Every coefficient will be bigger when he will *offer* this stuff to me *earlier* and calculates with next formula:

   partnerLessSignificans[j].uselessness += o[i] * (max_rounds - roundNum) , where o is his current offer.

So, I’m trying to leave for partner more valuable items for him.
And price of my offer must be > than priceToKeep. Thus, I will have my offer. 

After that I will compare price of my offer with best price, which offer partner to me. If partner’s price more than my and it is not one of the last rounds I will try to be more greedy, but If his price is still better than my I will accept this offer.

If we reached the last round it became a different story. Suppose I'm the first player(Alice), so I can get all except one item, valuable for partner, and he will have to accept. But If I’m second(Bob), I will have to accept any value for me.

