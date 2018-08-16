# Haggling RL

A submission for [hola! JS Challenge Summer 2018: Haggling][0].

Check out [Github Repo][6] for the latest source code.

## How this works

The approach of this submission is to train an agent using Reinforcement
Learning with policy gradients. At each round of the game the model is invoked
with previous (or initial) state, current offer, and returns a vector with
probabilities for each possible counter offer.

Our agent can work either probabilistically (by sampling the counter offers
using the generated probabilities) or deterministically (by choosing offer with
maximum probability). At late stages of training probability for the preferred
offer becomes very close to `1`, making deterministic selection a natural
choice.

## How to train the model

The model is written using Python3 and [TensorFlow][1], and can be trained by
executing following commands;

```sh
pip3 install tensorflow
python3 src/train.py --singular
```

_NOTE: Many different configurations were considered with various LSTM sizes,
and different numbers of `pre` layers. LSTM with 128 units and no `pre` layer
appears to work best for provided hand-written agents._

_NOTE: While PPO epochs can take different values, apparently all of them but
`1` reduces the maximum achieved reward for hand-written agents. Thus only
`--ppo_epochs=1` were used throughout the experiments._

## How to build JS agent

First, the weights of the trained model has to be exported:
```sh
python3 src/transform-save.py \
  ./saves/run-name/last-checkpoint \
  export/weights.json
```

Next the JS agent has to be compiled with exported weights:
```sh
node js/build.js js/agents/neural.src.js export/weights.json > \
  js/agents/neural.js
```

The resulting file size is around 3mb for LSTM with 128 units and no pre layers.
Compression might have been used to reduce the file size, but it wasn't explored
due to high file size limits in the contest rules.

## Architecture

Initially, the agent had 5 possible actions: prev/next type, increment/decrement
count, submit. Despite acceptable results, the model took very long time to
train due to the count of the neural network invocations (mean step count
varied from 12 to 25 per game). The stability was poor too, because the model
could enter increment/decrement (or prev/next) loop and time out on certain
offers. While we admit that such solution was more general and could potentially
apply to different configurations, for the final submission we decided to use
different scheme.

All possible offers are enumerated from 1 to N and are the new actions of the
network. Action 0 accepts the offer. All actions end the turn. Since in general
configurations there could be thousands of possible offers, each input/output
offer is mapped to a compact 128-dimensional embedding. At the input this
embedding is fed directly to the LSTM layer, the dot product of LSTM output and
embedding produces probabilities of the desired actions (after softmax). Same
embedding is used for input and output.

An available action mask is applied to filter out impossible offers and speed up
the training process. Disallowed actions are mapped to large negative number to
make them zero after the softmax activation, allowed actions are left as they
are.

Initial LSTM state is generated using game configuration vector (`values` +
`counts`) and dense layer with `relu` activation. The state is passed from
round to round, and the training works with BPTT of full length (5 rounds
in default configuration).

The loss is [A2C][2] with [PPO][3]. The training consisted of the cycles of
exploration phases (with 1024 games) and reflection phases using collected data.

The value function is a single dimensional vector. The reward is computed using
following formula:

```js
if (!gameEnd) {
  reward = 0;
} else if (accepted) {
  // Stimulate bigger relative score
  const scale = 0.1 + Math.max(0, Math.min(0.2, selfReward - opponentReward));

  // Stimulate bigger absolute score sum
  reward = (scale / 0.3) * (selfReward + opponentReward);
} else {
  // Stimulate more agreemenets
  reward = -1;
}
```

## Source code

There's no excuse for poorly written Python code, but please take in account
that the code base is a result of hundreds of different experiments. Many of
them required rewriting or commenting out different parts of the code. Our
Python skill are sub-par, and huge amount of rewrites didn't help to improve the
quality of the source!

Many files serve no purpose outside of the experiments they were used in, and
are left in the source tree for posterity.

Now with a disclaimer above, let's turn to the code:

### `src/env.py`

Environment implementation. See [OpenAI's gym][4] for description of public
methods. Each environment has configurable pool of opponents, each opponent
is pooled at random at the start of new game.

### `src/policy_agent.py`

Implementation of hand-written agents. The most important are:

* `downsize`
* `half_or_all` (`example.js` in the contest's repository)
* `estimator`

All three of them were used for training the model for the final submission.

### `src/model.py`

Neural Network agent. The messiest part of the project, but inarguably the most
important part of it.

### `src/train.py`

A training loop, and few routines to periodically save model to disk.

### `src/transform-save.py`

A tool that exports TensorFlow model weights to JSON file.

### `src/generator.py`

Generator of possible configurations. A python port of the similar script from
the contest's repository.

### `src/agent.py`

Base class for all agents (including hand-written ones). No methods there, but
there could be some!

### `src/check-js.py`

An outdated script to verify that model output matches between Python and JS.

### `src/test.py`

Just a boilerplate for small experiments.

### `src/ui.py`

A console-based UI that could be used to display the played games in a way
similar to the one in the contest's repo.

### `js/agents/neural.js`

The result of the training.

### `js/remote.js`

A tool to fetch score and current position from the leaderboard.

### `js/eval.js`

Fast local arena to evaluate the trained model against other JS agents.

### `js/distributions.js`

Junk.

### `js/generate.js`

Copy of generator from the contest's repo.

### `js/test.js`

Boilerplate code.

## Thank you

Huge thanks to everyone who agreed to play with our agent on the
[unofficial arena][5]!

#### LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2018.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://github.com/hola/challenge_haggling
[1]: http://tensorflow.org/
[2]: https://blog.openai.com/baselines-acktr-a2c/
[3]: https://blog.openai.com/openai-baselines-ppo/
[4]: https://github.com/openai/gym/blob/master/gym/core.py
[5]: https://github.com/indutny/alt-haggle
[6]: https://github.com/indutny/haggling_rl
