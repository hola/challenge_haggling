# Explanation of approach for JS Challenge Summer 2018: Haggling

## Theory

We will consider the trading platform as the basis for the
linear programming task.
Each constraint is based on a possible opponent value set.
We can get offer item sets for different objective functions.
Comparing sets for different objective functions, we can choose
the best offer.
Every round we will cut some possible opponent value sets after
analizing opponent offer and refusal of an opponent from our offer
(it means we will cut some constraints).

## Realization

### Initialization

1. Build a list of all possible opponent value sets
2. Build a list of several best solutions (maximal profit)

### Every round

1. Cut volume sets incompatible with opponent offer
2. Cut volume sets in connection with the our offer rejection
3. Linear programming task. Objective functions:
   my maximal price, when opponen gets price more then some value
   (simplex-method, Gomory cut).
4. Linear programming task. Objective functions:
   minimal number of items set, when opponen gets profit not more
   then my profit
   (simplex-method, Gomory cut, simplex-method dual).
5. Choose the best set from opponet offer (accept offer) and
   calculated sets