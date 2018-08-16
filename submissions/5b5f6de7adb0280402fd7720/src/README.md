# Previous solution approach

* **first step alaways greedy**: script takes more then half of full value and tries to make such offer
* **next step tries to keep the same level in different ways**: script stores all its offers to not repeat itsetf and will reduce desired value by 1 after all tries. At the same time script stores best offer and will send it if his own offer has lover value.
* **last step always the last**: on its last turn script will make best of opponent's offers.

# New solution approach

* **first step looks fare (but greedy)**:
  * script takes half of full amount of items, but tooks most expensive of them
  * value of taken items stored as `desired value`
  * script calculates all `possible options` to take `desired value` from full set of items
  * script sorts `possible options` by amount of items to make a smallest offer first
  * script takes first `possible option` and provide it as an `offer`
* **next step tries to keep the same level**:
  * script takes next `possible option` and provide it as an `offer`
  * if there are no more `possible options` script reduce `desired value` by `1`, generates `possible options` for new `desired value` and goes to previous step
* **last step always reasonable**:
   * script takes the best of `opponent's offers`
   * if there is no `opponent's offer` or its value equals to `0` script behaves as for `next step`