import numpy as np
import random

from generator import Generator, MAX_TYPES
from ui import UI

class Environment:
  def __init__(self,
               types=3, max_rounds=5, min_obj=1, max_obj=6, total=10.0):
    self.opponent_list = []

    self.generator = Generator(types, min_obj, max_obj, total)
    self.ui = UI()

    self.types = types
    self.max_rounds = max_rounds
    self.total = total

    self.offers = self.generator.offers
    self.action_space = 1 + len(self.offers)
    self.reward_space = 1

    self.no_consensus_score = 0.68

    state = self.reset()

    # +- on each type, left/right, submit button
    self.observation_space = len(state)
    self.context_space = len(self.get_context())

  def reset(self, force_self=False):
    # Select configuration
    objects = self.generator.get()
    self.values = {
      'self': objects['valuations'][0],
      'opponent': objects['valuations'][1],
    }
    self.counts = objects['counts']
    self.offer_mask = objects['offer_mask']

    if len(self.opponent_list) > 0:
      self.player = 'self' if force_self else \
          random.choice([ 'self', 'opponent' ])
      self.opponent = random.choice(self.opponent_list)
      self.opponent_state = self.opponent.build_initial_state(
          self.get_context('opponent'))
    else:
      self.player = 'self'
      self.opponent = None
      self.opponent_state = None

    self.steps = 0
    self.done = False
    self.status = 'active'
    self.last_reward = 0.0
    self.last_opponent_reward = 0.0

    self.proposed_offer = None

    self.ui.initial(self.opponent, self.counts, self.values['self'])

    if self.player is 'opponent':
      self._run_opponent()

    if not self.player is 'self':
      raise Exception('Unexpected!')

    return self._make_state()

  def add_opponent(self, opponent):
    self.opponent_list.append(opponent)

  def clear_opponents(self):
    self.opponent_list = []

  def step(self, offer):
    player = self.player
    if self.done:
      raise Exception('Already done, can\'t go on')

    if not offer is True:
      for val, max in zip(offer, self.counts):
        if val < 0 or val > max:
          raise Exception('Invalid offer {}, counts are {}'.format(
              offer, self.counts))

    done = False

    reward, state, done = self._submit(offer)
    if not done and self.player is 'opponent':
      # NOTE: `reward` is always for `self`
      reward, state, done = self._run_opponent()

    self.done = done
    return state, reward, done, { 'player': player }

  def bench(self, agent, times=1000):
    score = 0.0
    op_score = 0.0
    delta = 0.0
    accepted = 0
    for i in range(times):
      is_accepted, reward, op_reward = self.bench_single(agent)
      score += reward
      op_score += op_reward
      delta += reward - op_reward

      if is_accepted:
        accepted += 1

    return {
      'mean': score / float(times),
      'mean_accepted': score / float(accepted),
      'op_mean': op_score / float(times),
      'op_mean_accepted': op_score / float(accepted),
      'delta': delta / float(accepted),
      'acceptance': float(accepted) / float(times),
    }

  def bench_single(self, agent):
    state = self.reset()
    agent_state = agent.build_initial_state(self.get_context('self'))

    while True:
      action, agent_state = agent.step(state, agent_state)
      state, _, done, _ = self.step(action)
      if done:
        accepted = self.status == 'accepted'
        return accepted, self.last_reward, self.last_opponent_reward

    # Timed out
    return False, 0.0

  def get_offer(self, index):
    if index == 0:
      # Submit
      return True
    else:
      return self.offers[index - 1]

  def find_offer(self, offer):
    for i, existing in enumerate(self.offers):
      if np.array_equal(offer, existing):
        return 1 + i
    raise Exception('Invalid offer')

  def _make_state(self):
    proposed_offer = self.proposed_offer

    # Initial offer
    if proposed_offer is None:
      proposed_offer = 0
      can_submit = 0
    else:
      if proposed_offer == 0:
        raise Exception('Invalid non-initial offer')
      can_submit = 1

    available_actions = np.concatenate([ [ can_submit ], self.offer_mask ])
    if len(available_actions) != self.action_space:
      raise Exception('Invalid available_actions')

    return np.concatenate([
      available_actions,
      [ proposed_offer ],
    ])

  def get_context(self, player='self'):
    return np.concatenate([
      self.values[player],
      self.counts,
    ])

  def _submit(self, offer):
    # No state change here
    state = self._make_state()
    counter_player = 'opponent' if self.player is 'self' else 'self'

    if offer is True:
      if self.proposed_offer is None:
        raise Exception('Can\'t accept if starting the round')

      offer = self.get_offer(self.proposed_offer)
      accepted = True
    else:
      accepted = False

    self.steps += 1
    timed_out = self.steps == 2 * self.max_rounds

    done = accepted or timed_out
    if accepted:
      self_offer = offer
      opponent_offer = self.counts - offer
      if not self.player is 'self':
        self_offer, opponent_offer = opponent_offer, self_offer

      self_reward = np.sum(self_offer * self.values['self'], dtype='float32')
      self.ui.accept('self', self_reward)
      opponent_reward = np.sum(opponent_offer * self.values['opponent'],
          dtype='float32')
      self.ui.accept('opponent', opponent_reward)

      # Normalize rewards
      self_reward_p = self_reward / self.total
      opponent_reward_p = opponent_reward / self.total

      # Stimulate bigger relative score
      bonus = 0.1 + max(0.0, min(0.2, self_reward_p - opponent_reward_p)) / 0.3

      # Stimulate bigger absolute score
      bonus *= (self_reward_p + opponent_reward_p)

      reward = [ bonus ]

      self.status = 'accepted'

      # Just for benching (really messy)
      # TODO(indutny): unmess it
      self.last_reward = self_reward
      self.last_opponent_reward = opponent_reward
    elif timed_out:
      # Discourage absence of consensus
      reward = [ -1.0 ]
      self.last_reward = 0.0
      self.last_opponent_reward = 0.0
      self.ui.no_consensus()
      self.status = 'no consensus'
    else:
      reward = [ 0.0 ]
      self.ui.offer(offer, self.counts, self.player)

    # Switch player
    self.player = counter_player
    self.proposed_offer = self.find_offer(self.counts - offer)

    # NOTE: reward is actually for `self`, not `opponent`
    return reward, state, done

  def _run_opponent(self):
    if not self.player is 'opponent':
      raise Exception('Unexpected!')

    state = self._make_state()
    action, self.opponent_state = self.opponent.step(state, self.opponent_state)

    state, reward, done, _ = self.step(action)

    # Offer accepted, return reward
    return reward, self._make_state(), done
