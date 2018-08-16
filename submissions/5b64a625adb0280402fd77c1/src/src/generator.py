import numpy as np
import random

MAX_TYPES = 3

class Generator:
  def __init__(self, types, min_obj, max_obj, total):
    self.types = types
    self.min_obj = min_obj
    self.max_obj = max_obj
    self.total = total

    self.sets = []
    self.offers = []

    self._init_offers(np.zeros(MAX_TYPES, dtype='int32'), 0)
    self._init_sets(np.zeros(MAX_TYPES, dtype='int32'), 0, 0)

  def _init_sets(self, counts, i, total_count):
    remaining = total_count + self.types - i - 1

    min_count = max(1, self.min_obj - remaining)
    max_count = self.max_obj - remaining

    for j in range(min_count, max_count + 1):
      counts[i] = j

      # Recurse
      if i < self.types - 1:
        self._init_sets(counts, i + 1, total_count + j)
        continue

      res = { 'counts': np.copy(counts), 'valuations': [], 'offer_mask': None }
      self._init_valuations(res, np.zeros(MAX_TYPES, dtype='int32'), 0, 0)
      self._init_offer_mask(res)

      if len(res['valuations']) >= 2:
        self.sets.append(res)

  def _init_valuations(self, obj_set, values, i, total_value):
    count = obj_set['counts'][i]
    max_value = int((self.total - total_value) / count)
    if i == self.types - 1:
      # Not enough value
      if total_value + max_value * count != self.total:
        return

      values[i] = max_value
      obj_set['valuations'].append(np.copy(values))
      return

    for j in range(0, max_value + 1):
      values[i] = j
      self._init_valuations(obj_set, values, i + 1, total_value + j * count)

  def _init_offer_mask(self, obj_set):
    mask = np.zeros(len(self.offers), dtype='int32')

    for i, offer in enumerate(self.offers):
      valid = True
      for j, count in enumerate(offer):
        if count > obj_set['counts'][j]:
          valid = False
          break
      mask[i] = 1 if valid else 0

    obj_set['offer_mask'] = mask

  def _init_offers(self, offer, i):
    if i == self.types:
      # TODO(indutny): make this more efficient
      sum = np.sum(offer)
      if sum > self.max_obj:
        return

      self.offers.append(np.copy(offer))
      return

    for j in range(0, self.max_obj + 1):
      offer[i] = j
      self._init_offers(offer, i + 1)

  def get(self):
    pick = random.sample(self.sets, 1)[0]
    valuations = random.sample(pick['valuations'], 2)

    return {
      'counts': pick['counts'],
      'offer_mask': pick['offer_mask'],
      'valuations': valuations,
    }
