Mark IV Haggle Bot (b58f4e18ce36dce2349b04087d8624f0 on the standard arena)
==================

Intro
-----

My final bot is an almagamation of quite a few weeks of running bots on the websocket arena while manually pouring over the results and making small adjustments. I would have liked to implement an evolutionary AI but I'm fairly new to the subject, and creating a reliable model to describe the problem was difficult for me.

This was a fun excercise, simple for humans to understand, but complex to automate. It spurred many conversations amongst my colleagues about game theory, likely strategies, automation, etc. After a few weeks, I found that I began to understand the simple premise from many different perspectives. Questions began to arise from obsessive studying of the problem: Is there an optimum round for accepting an offer? For giving? Which round has a more lucrative acceptance? How to find the optimum equilibrium between my and my opponent's values? How does a simple tweak (the difference between a 6 or a 7) affect overall performance?

I also found that, when running against the arena, the same bot variation would perform quite differently from day to day. I believe this is a direct correlation between which opponents (and the quality of which) happened to be running that day. This led me to try and not create new variations on a day-to-day basis and instead average out bot performance over days at a time. This of course, made the testing process fairly long-winded. Admittedly, a problem solved by smarter optimization and AI.

Description of Strategy
-----------------------
It seemed the best strategy was to make as many agreements as possible. However, agreeing too readily had a negative effect on the overall score. Driving a hard bargain from the beginning and gradually relaxing over the 5 rounds had the desired effect of driving up overall score, while still achieving a high level of agreement. This hypothesis was later confirmed when I read a whitepaper from Facebook on this very problem set.

My bot begins by calculating all possible permutations of the items and counts. This gives me all possible offers that can be received or given. From this point I sort them by personal value ascending. My bot is somewhat altruistic and wants to find the pareto optimum solution for both agents, so I filter out all offers that are worthless, the offer for everything, and also any offers that are of duplicate value to me but potentially lower value to the opponent. The latter effect can be illustrated by the following:

// 1 book, 3 hats, 1 ball
// $5,     $0,     $5
[1, 3, 1], // value 10
[1, 0, 1]  // value 10 * keep this one

While both offers are valued at 10 for me, the second offer would be more likely accepted by my opponent (if they value hats) because it offers them all the hats, instead of none.

Finally, I filter out any offers that are below a value threshold of 6.

My acceptance criteria is based on the value of the offer permutations. My minimum total score acceptance for the offer begins at the index of the highest value offer, and decrements the index round by round. I found this was slightly more successful than simply decrementing the minimum acceptable total by 1 every round. On the final round, if the opponent's offer has any value to me, then I will accept.

My criteria for making an offer works similarly, moving through the offers from highest value to lowest. If the number of rounds is greater than the number of potential offers, then it will start over.

Some Fun Facts
--------------
- 85 bot variations created (wow)
- 2 analyzation scripts created
- 1 leaderboard script created
- current AVG score: 6.529 (9th place at time of writing)
- so many game theory, number theory wikis, posts, and whitepapers read.