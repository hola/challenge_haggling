*[Previous post](01-rules.md)* | *[Next post](03-round1-results.md)*

# Preliminary Standings as of July 17, 2018 and Clarifications on the Final Testing

See also the [Russian version](https://habr.com/company/hola/blog/417645/) of this page.

First, a few announcements.

## Clarifications on the final testing

After the final deadline, we are going to test all solutions more thoroughly than we did now.

### Seeds

We are committing ourselves to use the following method for generating the seeds, which is unambiguous yet not predictable in advance.

We shall take the first tweet in [this Twitter feed](https://twitter.com/SpringerTV) that appears after the submission deadline. You can be pretty sure that Jerry Springer is not in collusion with us. We take only the text of the tweet, ignoring any media (it's basically the part you can select by dragging the mouse over it). If the tweet is only media with no text, we skip it and take the next tweet instead. Retweets count. The name of the account being retweeted will not be included.

We feed the text into this code, which then produces the seeds:

```javascript
const random_js = require('random-js');
const text = 'The tweet goes here';
const bytes = Array.from(new Buffer(text));
const random = new random_js(random_js.engines.mt19937().seedWithArray(bytes));
for (let i = 0; i<200; i++) // we will generate as many as needed
    console.log(random.uint32());
```

The *odd-numbered* members of this sequence, numbered starting with 1 (that is, the first, third, fifth and so on) will be used as seeds for the first round; the *even-numbered* members will be used as additional seeds for the finals.

In the first round, at least 100 seeds will be used to test each ordered pair; more if the schedule allows. For the finals, at least 100 additional seeds. Note that the sessions that already took place between finalists in the first round, count in the finals (but not sessions between a finalist and a solution that didn't make it into the finals). This means that the ranking among finals will be decided by at least 200 seeds.

### Selection of finalists

After the first round, all solutions will be ranked by their total scores. A certain number of solutions starting from the top of the list will pass into the finals.

All the following methods will be used to select the finalists. Whichever rule turns out to be **the strictest** (that is, allows the *fewest* participants in the finals), decides the number of finalists.

* No more than half of all solutions.
* No more than 50 solutions.
* A solution must beat `example.js` to pass.

## Preliminary standings

Thanks to all the participants! By UTC midnight of July 17, we had received submissions from 82 unique participants. We took a snapshot of that set, and ran a mini-tournament among them. Unlike the final testing, this preliminary tournament was made of just one round. Using numbers 1, 2, …, 50 as the seed values, we tested every ordered pair of distinct solutions on each seed. This resulted in each solution being tested in 8100 sessions, and the tournament contained 332100 sessions overall.

Of course, the standings can change during the time left until the deadline, as new solutions are being submitted.

We are not disclosing the names of the participants until the end of the contest. You can find your submission ID in the email you received after submitting your solution.

Three copies of [example.js](../src/example.js) are among the submissions (see the *Remark* column). It's interesting that 21 of the 82 solutions tested did worse than our trivial example code. (If you are wondering why the three copies did not achieve exactly the same scores, consider that some of the solutions use `Math.random`, so their behavior is not precicely repeatable.)

Legend:

* **S**: Total score (this is what the competition is about)
* **S/N**: Average score per session
* **A**: Number of sessions where an agreement has been reached
* **A/N**: Number of agreements as a percentage of the number of sessions
* **S/A**: Average score per session where an agreement has been reached
* **X**: Number of sessions aborted by the solution (exceptions, incorrect output)

|  # | ID                       |     S |    S/N |     A |    A/N |   S/A |    X | Remark                                                 |
| --:| ------------------------ | -----:| ------:| -----:| ------:| -----:| ----:| ------------------------------------------------------ |
|  1 | 5b4d0277b7c31b3cc179d193 | 51659 | 6.3777 |  6895 | 85.12% |  7.49 |    0 |                                                        |
|  2 | 5b4cd074b7c31b3cc179d18f | 51161 | 6.3162 |  6783 | 83.74% |  7.54 |    0 |                                                        |
|  3 | 5b307bb6aed3c15e2ca92fae | 50747 | 6.2651 |  7333 | 90.53% |  6.92 |    0 |                                                        |
|  4 | 5b4b67b8b7c31b3cc179d17c | 50012 | 6.1743 |  7156 | 88.35% |  6.99 |    0 |                                                        |
|  5 | 5b4c66d6b7c31b3cc179d184 | 49839 | 6.1530 |  6903 | 85.22% |  7.22 |  351 | Invalid offers                                         |
|  6 | 5b4ce4e2b7c31b3cc179d190 | 49578 | 6.1207 |  6944 | 85.73% |  7.14 |    0 |                                                        |
|  7 | 5b44709db7c31b3cc179d15f | 49566 | 6.1193 |  6928 | 85.53% |  7.15 |    0 |                                                        |
|  8 | 5b4cbc1cb7c31b3cc179d188 | 49239 | 6.0789 |  6166 | 76.12% |  7.99 |    0 |                                                        |
|  9 | 5b410b6eb7c31b3cc179d156 | 48988 | 6.0479 |  6479 | 79.99% |  7.56 |    0 |                                                        |
| 10 | 5b4cc77fb7c31b3cc179d18e | 48795 | 6.0241 |  6255 | 77.22% |  7.80 |    0 |                                                        |
| 11 | 5b48b30cb7c31b3cc179d173 | 48792 | 6.0237 |  6317 | 77.99% |  7.72 |    0 |                                                        |
| 12 | 5b4bbc8fb7c31b3cc179d17e | 48773 | 6.0214 |  6824 | 84.25% |  7.15 |    0 |                                                        |
| 13 | 5b4858adb7c31b3cc179d172 | 48759 | 6.0196 |  6292 | 77.68% |  7.75 |    0 |                                                        |
| 14 | 5b4bbe26b7c31b3cc179d17f | 48758 | 6.0195 |  6803 | 83.99% |  7.17 |    0 |                                                        |
| 15 | 5b4c4190b7c31b3cc179d183 | 48504 | 5.9881 |  6310 | 77.90% |  7.69 |    0 |                                                        |
| 16 | 5b4d06bcb7c31b3cc179d197 | 48492 | 5.9867 |  6410 | 79.14% |  7.57 |    0 |                                                        |
| 17 | 5b3101b4aed3c15e2ca92faf | 48261 | 5.9581 |  6418 | 79.23% |  7.52 |    0 |                                                        |
| 18 | 5b437878b7c31b3cc179d15c | 48194 | 5.9499 |  6014 | 74.25% |  8.01 |    0 |                                                        |
| 19 | 5b446964b7c31b3cc179d15e | 48161 | 5.9458 |  6174 | 76.22% |  7.80 |    0 |                                                        |
| 20 | 5b4cbe59b7c31b3cc179d189 | 47932 | 5.9175 |  7358 | 90.84% |  6.51 |    0 |                                                        |
| 21 | 5b4cc28bb7c31b3cc179d18b | 47819 | 5.9036 |  6080 | 75.06% |  7.86 |    0 |                                                        |
| 22 | 5b2cfb9ca1f8f650d9b74df3 | 47787 | 5.8996 |  6972 | 86.07% |  6.85 |    0 |                                                        |
| 23 | 5b4b424bb7c31b3cc179d17b | 47739 | 5.8937 |  6422 | 79.28% |  7.43 |    0 |                                                        |
| 24 | 5b4766b1b7c31b3cc179d16d | 47715 | 5.8907 |  6027 | 74.41% |  7.92 |    4 |                                                        |
| 25 | 5b4766a3b7c31b3cc179d16c | 47661 | 5.8841 |  6348 | 78.37% |  7.51 |    0 |                                                        |
| 26 | 5b4a663eb7c31b3cc179d178 | 47606 | 5.8773 |  7142 | 88.17% |  6.67 |    0 |                                                        |
| 27 | 5b2c0aa2a1f8f650d9b74df1 | 47534 | 5.8684 |  6441 | 79.52% |  7.38 |    0 |                                                        |
| 28 | 5b4d0ad4b7c31b3cc179d19e | 47341 | 5.8446 |  6652 | 82.12% |  7.12 |    0 |                                                        |
| 29 | 5b491cdab7c31b3cc179d174 | 47283 | 5.8374 |  5901 | 72.85% |  8.01 |    0 |                                                        |
| 30 | 5b33d50dfb758b19a59897df | 47254 | 5.8338 |  5962 | 73.60% |  7.93 |    0 |                                                        |
| 31 | 5b34ee943b9e094a5032c22a | 47239 | 5.8320 |  6062 | 74.84% |  7.79 |    0 |                                                        |
| 32 | 5b36b3a791324b1435b76491 | 47220 | 5.8296 |  6215 | 76.73% |  7.60 |    0 |                                                        |
| 33 | 5b3bd6e0b7c31b3cc179d14a | 47165 | 5.8228 |  6524 | 80.54% |  7.23 |    0 |                                                        |
| 34 | 5b4d0a05b7c31b3cc179d19d | 46884 | 5.7881 |  6193 | 76.46% |  7.57 |    0 |                                                        |
| 35 | 5b4d26b6b7c31b3cc179d1a1 | 46340 | 5.7210 |  5826 | 71.93% |  7.95 |    0 |                                                        |
| 36 | 5b4d0891b7c31b3cc179d19b | 46290 | 5.7148 |  6234 | 76.96% |  7.43 |    0 |                                                        |
| 37 | 5b4d07a0b7c31b3cc179d19a | 46230 | 5.7074 |  6048 | 74.67% |  7.64 |    0 |                                                        |
| 38 | 5b4cf2fab7c31b3cc179d192 | 46170 | 5.7000 |  6849 | 84.56% |  6.74 |    0 |                                                        |
| 39 | 5b4d3168b7c31b3cc179d1a3 | 45939 | 5.6715 |  7453 | 92.01% |  6.16 |  427 | `TypeError: Cannot read property 'cost' of undefined`  |
| 40 | 5b4cb8dfb7c31b3cc179d187 | 45762 | 5.6496 |  5843 | 72.14% |  7.83 |    0 |                                                        |
| 41 | 5b4d062db7c31b3cc179d196 | 45699 | 5.6419 |  6208 | 76.64% |  7.36 |    0 |                                                        |
| 42 | 5b33a3a3fb758b19a59897dd | 45644 | 5.6351 |  5893 | 72.75% |  7.75 |    0 |                                                        |
| 43 | 5b4d1b43b7c31b3cc179d19f | 45564 | 5.6252 |  6590 | 81.36% |  6.91 |  702 | `TypeError: o.reduce is not a function`                |
| 44 | 5b2ca6a6a1f8f650d9b74df2 | 45443 | 5.6102 |  6007 | 74.16% |  7.57 |    0 |                                                        |
| 45 | 5b4d20d1b7c31b3cc179d1a0 | 45073 | 5.5646 |  6245 | 77.10% |  7.22 |    0 |                                                        |
| 46 | 5b4d0941b7c31b3cc179d19c | 45069 | 5.5641 |  6198 | 76.52% |  7.27 |    0 |                                                        |
| 47 | 5b2aea1f97974e421b4fdeb9 | 44900 | 5.5432 |  7280 | 89.88% |  6.17 |    0 |                                                        |
| 48 | 5b3f2927b7c31b3cc179d14c | 44656 | 5.5131 |  5930 | 73.21% |  7.53 |    0 |                                                        |
| 49 | 5b4c2173b7c31b3cc179d181 | 44639 | 5.5110 |  6491 | 80.14% |  6.88 |    0 |                                                        |
| 50 | 5b475bdcb7c31b3cc179d16a | 44294 | 5.4684 |  7888 | 97.38% |  5.62 |    0 |                                                        |
| 51 | 5b4d2cbab7c31b3cc179d1a2 | 44095 | 5.4438 |  5707 | 70.46% |  7.73 |  640 | `TypeError: Cannot read property 'goods' of undefined` |
| 52 | 5b41bc87b7c31b3cc179d15b | 43722 | 5.3978 |  6113 | 75.47% |  7.15 |    0 |                                                        |
| 53 | 5b2abff9d0951d3e501278f2 | 43374 | 5.3548 |  5776 | 71.31% |  7.51 |    0 |                                                        |
| 54 | 5b43d87fb7c31b3cc179d15d | 43341 | 5.3507 |  5571 | 68.78% |  7.78 |    0 |                                                        |
| 55 | 5b45287eb7c31b3cc179d163 | 43127 | 5.3243 |  5610 | 69.26% |  7.69 |    0 |                                                        |
| 56 | 5b4ce9bdb7c31b3cc179d191 | 43079 | 5.3184 |  5660 | 69.88% |  7.61 |    0 |                                                        |
| 57 | 5b4cb885b7c31b3cc179d186 | 43039 | 5.3135 |  5757 | 71.07% |  7.48 |    0 |                                                        |
| 58 | 5b33ac62fb758b19a59897de | 42995 | 5.3080 |  5161 | 63.72% |  8.33 |    0 |                                                        |
| 59 | 5b31ddb0485b89172ab89ffa | 42890 | 5.2951 |  5616 | 69.33% |  7.64 |    0 | Copy of `example.js`                                   |
| 60 | 5b2f9b47aed3c15e2ca92fad | 42883 | 5.2942 |  5614 | 69.31% |  7.64 |    0 | Copy of `example.js`                                   |
| 61 | 5b3251f44b5595212d10bde5 | 42866 | 5.2921 |  5619 | 69.37% |  7.63 |    0 | Copy of `example.js`                                   |
| 62 | 5b475aefb7c31b3cc179d169 | 42768 | 5.2800 |  6486 | 80.07% |  6.59 |  154 | Invalid offers                                         |
| 63 | 5b4d06ccb7c31b3cc179d199 | 42757 | 5.2786 |  6608 | 81.58% |  6.47 |    0 |                                                        |
| 64 | 5b4cc2fcb7c31b3cc179d18c | 42268 | 5.2183 |  5806 | 71.68% |  7.28 |    0 |                                                        |
| 65 | 5b4c7aa9b7c31b3cc179d185 | 42023 | 5.1880 |  5163 | 63.74% |  8.14 |    0 |                                                        |
| 66 | 5b4bb3f7b7c31b3cc179d17d | 41863 | 5.1683 |  7484 | 92.40% |  5.59 |    0 |                                                        |
| 67 | 5b332cb54b5595212d10bde6 | 41337 | 5.1033 |  4800 | 59.26% |  8.61 |    0 |                                                        |
| 68 | 5b3c6063b7c31b3cc179d14b | 40959 | 5.0567 |  4920 | 60.74% |  8.32 |    0 |                                                        |
| 69 | 5b467545b7c31b3cc179d167 | 40563 | 5.0078 |  7876 | 97.23% |  5.15 |    0 |                                                        |
| 70 | 5b321f87485b89172ab89ffb | 38966 | 4.8106 |  4935 | 60.93% |  7.90 |    0 |                                                        |
| 71 | 5b2c0738a1f8f650d9b74df0 | 38089 | 4.7023 |  4584 | 56.59% |  8.31 |    0 |                                                        |
| 72 | 5b2abb3cd0951d3e501278f1 | 38028 | 4.6948 |  4993 | 61.64% |  7.62 |    0 |                                                        |
| 73 | 5b3f3a31b7c31b3cc179d14e | 36057 | 4.4515 |  5392 | 66.57% |  6.69 |    0 |                                                        |
| 74 | 5b39543991324b1435b76499 | 35247 | 4.3515 |  3992 | 49.28% |  8.83 |    0 |                                                        |
| 75 | 5b2d6e58aed3c15e2ca92fa9 | 33771 | 4.1693 |  3699 | 45.67% |  9.13 |    0 |                                                        |
| 76 | 5b4b2a79b7c31b3cc179d17a | 32563 | 4.0201 |  3851 | 47.54% |  8.46 | 1492 | Invalid offers                                         |
| 77 | 5b2eb1caaed3c15e2ca92faa | 31803 | 3.9263 |  4104 | 50.67% |  7.75 |    0 |                                                        |
| 78 | 5b2d4cd1a1f8f650d9b74df5 | 31350 | 3.8704 |  3317 | 40.95% |  9.45 |    0 |                                                        |
| 79 | 5b44ba60b7c31b3cc179d162 | 30171 | 3.7248 |  5984 | 73.88% |  5.04 |    0 |                                                        |
| 80 | 5b2a7ce0e3cacc392ac3ec04 | 26988 | 3.3319 |  4836 | 59.70% |  5.58 |    0 |                                                        |
| 81 | 5b2d10a3a1f8f650d9b74df4 |  3600 | 0.4444 |   360 |  4.44% | 10.00 | 7638 | `ReferenceError: opp_counts is not defined`            |
| 82 | 5b2f4289aed3c15e2ca92fac |     0 | 0.0000 |     0 |  0.00% | _n/a_ | 8100 | `ReferenceError: total is not defined`                 |
