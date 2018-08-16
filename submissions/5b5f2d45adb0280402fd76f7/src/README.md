# haggle

In the constuctor I make a list of variants of objects and sort them by cost.
```
[1, 2, 3] - 10
[1, 1, 3] - 9
[0, 2, 3] - 8
....
[0, 0, 0] - 0
```

## Offer

For each round I have different threshold which decreases with each round.

```javascript
threshold = MIN_THRESHOLD / this.maxRounds * (this.rounds) + MIN_THRESHOLD
```

If opponent offer greater then my agreement for current round I accept his offer.
 
### My offer

Take my offer from list of counts sorted by cost.
In the first round i take 2-nd most important proposal but not less then MIN_THRESHOLD (i.e. [1, 1, 3]). 
In the next round I take next proposal but not less then MIN_THRESHOLD ([0, 2, 3]) and so on.

## Last round

If my turn was first I check saved opponent's offers and select from them most profitable for me and not less then MIN_THRESHOLD. If there is one I make it offer.
If my turn was second I agreenment only if opponent's offer not less then MIN_THRESHOLD.