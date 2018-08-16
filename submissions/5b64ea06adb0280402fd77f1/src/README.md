# challenge_haggling
My solution for [hola! JS Challenge Summer 2018: Haggling](https://github.com/hola/challenge_haggling)

## Strategy for accepting an offer
Accept an offer if it costs greater than or equal to the threshold, which is calculated as:

**threshold** = **total** - 1.7 **round**,

**round** = [0, max_rounds)

**Exception for last round:** if our turn is second accept any offer if it costs more than zero.


## Strategy of making offers
Before all games for each set of objects' counts and valuations and each round to calculate offers. When the game start the agent loads this previously calculated offers and uses them.

### Algorithm for calculation of the sequence of offers
We suppose that an opponent on average has a strategy of offers acceptance: «accept an offer if it costs greater than or equal to the half». We use a complete enumeration of sequences from max_rounds of offers to maximize the mathematical expectation of the special game. In this game our agent only makes offers and our opponent only accept or refuse offers. All possible sets of opponent's objects' valuation according to the constraints of the generator are assumed equally likely. So this mathematical expectation equals total score in games with each possible opponent's objects' valuation divided by the number of these games. When we search the sequence of offers we don't use zero and total offers and don't use offers containing objects which is worth zero for us.

After the deadline I noticed that when I calculate mathematical expectation I suppose that opponents may have the same objects' valuations, but according to the generator's code it is wrong and valuations are always different. When I tested the play of my agent vs my agent and my agent vs example.js this error didn't affect of the score.  Maybe the score with wrong mathematical expectiton was even a little bit more.
