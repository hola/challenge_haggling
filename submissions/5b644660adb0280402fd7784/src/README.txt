The solution tries to calculate partner prices by sending appropiate offers based
on currently calculated partner prices and my prices.
The proposials are prepared as all possible configurations of my offers that wil
give my sum larger than estimated partener sums.

All this combinations are sorted by total offer price and reversively subsorted by 
partner estimated total prices for N- 2 rounds.
On last 2 rounds i will propose to partner best solutions that still lowere then my sum.

Each partner proposial is treated as trying to give me things that are unneeded for the partner.
This allow to reduce or enlarge estimated price for item.
After that this sum is compared with all possible combinations of products that give
the same total sum of all items. The lowest error give me estimation.

First n-2 rounds are used to presise partner prices estimarions and
on last two rounds i try to deal.
