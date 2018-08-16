import numpy as np
import random

from generator import MAX_TYPES
from agent import Agent

MAX_ROUNDS = 5

class BasePolicy:
  def __init__(self, values, counts):
    self.values = values
    self.counts = counts
    self.max_types = len(self.counts)
    self.total = np.sum(counts * values)

class HalfOrAllPolicy(BasePolicy):
  def on_offer(self, offer):
    offer_value = np.sum(offer * self.values)

    # Accept offer
    if offer_value >= self.total / 2.0:
      return True, None

    # Generate target
    return False, np.where(self.values > 0.0, self.counts, 0)

class MostOrLastPolicy(BasePolicy):
  def __init__(self, *args, **kwargs):
    super(MostOrLastPolicy, self).__init__(*args, **kwargs)

    self.round = 0

  def on_offer(self, offer):
    self.round += 1
    offer_value = np.sum(offer * self.values)

    # Accept offer
    if offer_value / float(self.total) >= 0.7:
      return True, None

    # Accept any positive last offer
    if self.round == MAX_ROUNDS and offer_value > 0:
      return True, None

    # Generate target
    return False, np.where(self.values > 0.0, self.counts, 0)

class DownsizePolicy(BasePolicy):
  def __init__(self, *args, **kwargs):
    super(DownsizePolicy, self).__init__(*args, **kwargs)

    self.round = 0

  def on_offer(self, offer):
    self.round += 1

    alpha = 1 - min(MAX_ROUNDS, self.round) / float(MAX_ROUNDS)
    half = self.total / 2.0
    minimum = (self.total - half) * alpha + half

    offer_value = np.sum(offer * self.values)

    # Accept offer
    if offer_value >= minimum:
      return True, None

    offers = []
    self.find_offers(offers, np.zeros(self.counts.shape), minimum, 0, 0.0)

    min_value = float('inf')
    for offer_value, offer in offers:
      if offer_value > min_value:
        continue
      min_value = offer_value

    min_offers = [ offer for value, offer in offers if value == min_value ]
    offer = random.choice(min_offers)

    # Generate target
    return False, offer

  def find_offers(self, offers, offer, minimum, i, total):
    if i == len(self.counts):
      return

    if self.values[i] == 0.0:
      return self.find_offers(offers, offer, minimum, i + 1, total)

    for j in range(0, self.counts[i] + 1):
      offer[i] = j
      offer_value = total + j * self.values[i]
      if offer_value >= minimum:
        offers.append((offer_value, np.copy(offer),))

      self.find_offers(offers, offer, minimum, i + 1, offer_value)

class AltruistPolicy(BasePolicy):
  def on_offer(self, offer):
    offer_value = np.sum(offer * self.values)
    if offer_value > 0:
      return True, None

    min_value_i = np.argmin(
        np.where(self.values > 0, self.values, float('inf')))
    counter_offer = np.zeros(self.counts.shape)
    counter_offer[min_value_i] = 1

    return False, counter_offer

class GreedyPolicy(BasePolicy):
  def on_offer(self, offer):
    offer_value = np.sum(offer * self.values)
    if offer_value == self.total:
      return True, None

    return False, np.copy(self.counts)

class StubbornPolicy(BasePolicy):
  def on_offer(self, offer):
    counter_offer = np.zeros(self.counts.shape)
    for i, max_count in enumerate(self.counts):
      counter_offer[i] = random.randint(0, max_count)
    return False, counter_offer

class EstimatorPolicy(BasePolicy):
  cache = {}

  def __init__(self, *args, **kwargs):
    super(EstimatorPolicy, self).__init__(*args, **kwargs)

    self.possible_values = []
    self.possible_offers = []
    self.round = 0
    self.max_rounds = MAX_ROUNDS

    cache_key = str(self.counts)
    if cache_key in EstimatorPolicy.cache:
      entry = EstimatorPolicy.cache[cache_key]
      self.possible_values = np.copy(entry['values'])
      self.possible_offers = np.copy(entry['offers'])
    else:
      self.fill_values(np.zeros(self.max_types, dtype='int32'), 0, 0)
      self.fill_offers(np.zeros(self.max_types, dtype='int32'), 0)
      EstimatorPolicy.cache[cache_key] = {
        'values': np.copy(self.possible_values),
        'offers': np.copy(self.possible_offers),
      }

    # Opponent can't have same values as ourselves
    self.possible_values = [
      v
      for v in self.possible_values if not np.array_equal(v, self.values)
    ]

    self.possible_offers = [
      o
      for o in self.possible_offers if self.offer_value(o, self.values) >= 0.5
    ]

    self.past_offers = []

  def invert_offer(self, offer):
    return self.counts - offer

  def offer_value(self, offer, values):
    return np.sum(offer * values, dtype='float32') / self.total

  def fill_values(self, values, i, total):
    count = self.counts[i]
    max_value = (self.total - total) // count
    if i == self.max_types - 1:
      if total + max_value * count == self.total:
        values[i] = max_value
        self.possible_values.append(np.copy(values))
      return

    for j in range(max_value + 1):
      values[i] = j
      self.fill_values(values, i + 1, total + j * count)

  def fill_offers(self, offer, i):
    if i == self.max_types:
      self.possible_offers.append(np.copy(offer))
      return

    for j in range(self.counts[i] + 1):
      offer[i] = j
      self.fill_offers(offer, i + 1)

  def on_offer(self, proposed_offer):
    self.round += 1

    self.past_offers.append({
      'type': 'wanted',
      'offer': self.invert_offer(proposed_offer),
    })
    estimates = self.estimate(self.past_offers)
    max_estimate = np.max(estimates)
    min_estimate = max_estimate * 0.4

    estimated_values = self.average_values([
      values
      for estimate, values in zip(estimates, self.possible_values)
      if estimate >= min_estimate
    ])

    threshold = 0.8 - 0.3 * (float(self.round) / self.max_rounds) ** 1.0

    def score_each(offer):
      self_value = self.offer_value(offer, self.values)
      op_value = self.offer_value(self.invert_offer(offer), estimated_values)

      if self_value < threshold:
        return -1e42

      return self_value + op_value

    scores = list(map(score_each, self.possible_offers))

    max_score = np.max(scores)
    offers = [
      offer
      for score, offer in zip(scores, self.possible_offers)
      if score == max_score
    ]

    result = random.choice(offers)
    value = self.offer_value(result, self.values)

    proposed_value = self.offer_value(proposed_offer, self.values)
    if threshold <= proposed_value:
      return True, None

    self.past_offers.append({
      'type': 'rejected',
      'offer': self.invert_offer(result),
    })
    return False, result

  def estimate(self, past_offers):
    scores = []
    for values in self.possible_values:
      score = 0.0
      for o in past_offers:
        value = self.offer_value(o['offer'], values)
        if o['type'] == 'rejected':
          score -= value
        else:
          score += value
      scores.append(score)
    return scores

  def average_values(self, list_of_values):
    return np.mean(list_of_values, axis=0)

class PolicyAgent(Agent):
  def __init__(self, env, policy):
    super(PolicyAgent, self).__init__()

    self.env = env

    if policy is 'downsize':
      self.policy = DownsizePolicy
    elif policy is 'half_or_all':
      self.policy = HalfOrAllPolicy
    elif policy is 'most_or_last':
      self.policy = MostOrLastPolicy
    elif policy is 'altruist':
      self.policy = AltruistPolicy
    elif policy is 'greedy':
      self.policy = GreedyPolicy
    elif policy is 'stubborn':
      self.policy = StubbornPolicy
    elif policy is 'estimator':
      self.policy = EstimatorPolicy
    else:
      self.policy = policy

    self.name = 'agent_' + self.policy.__name__

    self.target = None

  def build_initial_state(self, context):
    self.values = context[:MAX_TYPES]
    self.counts = context[MAX_TYPES:]

  def step(self, obs, policy):
    available_offers = obs[:self.env.action_space]
    obs = obs[len(available_offers):]

    proposed_offer = self.env.get_offer(int(obs[0]))

    # Initial offer
    if proposed_offer is True:
      proposed_offer = np.zeros(MAX_TYPES, dtype='int32')

    obs = obs[1:]

    if policy is None:
      policy = self.policy(self.values, self.counts)

    accept, target = policy.on_offer(proposed_offer)

    # Accept offer
    if accept:
      return True, policy

    return target, policy
