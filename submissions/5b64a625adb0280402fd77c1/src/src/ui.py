ITEM_NAMES = [ 'book', 'hat', 'ball', 'flower', 'bottle', 'cookie', 'hammer',
    'chair', 'spoon', 'pencil' ]

class UI:
  def __init__(self):
    self.disabled = True

  def initial(self, opponent, counts, values):
    items = self._enumerate(counts)
    self._display('Opponent name is: {}'.format(
      'unspecified ' if opponent is None else opponent.name))
    self._display('There are: ' + ', '.join(items))
    prices = self._prices(values)
    self._display(', '.join(prices))

  def offer(self, offer, counts, player):
    items = self._enumerate(offer)
    counter = self._enumerate(counts - offer)

    if len(items) == 0:
      me = 'I want nothing'
    else:
      me = 'I want ' + ', '.join(items)

    if len(counter) == 0:
      you = 'You get nothing'
    else:
      you = 'You get ' + ', '.join(counter)

    self._display('{}: {}; {}'.format(player, me, you))

  def accept(self, player, reward):
    self._display('{}: I accept and get ${}'.format(player, reward))

  def no_consensus(self):
    self._display('No consensus!')

  def _enumerate(self, counts):
    items = []
    for i, count in enumerate(counts):
      if count == 0:
        continue

      if count == 1:
        items.append('1 {}'.format(ITEM_NAMES[i]))
      else:
        items.append('{} {}s'.format(count, ITEM_NAMES[i]))
    return items

  def _prices(self, values):
    return [ '1 {} is worth ${}'.format(name, price) \
        for name, price in zip(ITEM_NAMES, values) if price > 0 ]

  def _display(self, message):
    if not self.disabled:
      print(message)
