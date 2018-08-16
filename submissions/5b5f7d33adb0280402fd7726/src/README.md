# <img src=https://hola.org/img/logo.png alt="Hola!"> JS Challenge Summer 2018: Haggling

I designed my solution to accept an offer if it is >= of a target value that is calculated from a curve mapping target values over rounds. Then the objective was to find the optimal curve.

I then generated a set of seeds representig an average set of games and applied both a brute force and genetic algorithm to find the optimal curve.

For the brute force approach I sampled target values of 0, 4, 7, 10 over the 5 rounds and made a tournament with only the one beating the example solution.

For the genetic algorithm I used a fitness function that calculates the difference of points with the best agent in a tournament with the example and the brute force solution.

My submission is the optimal curve resulting from this process.