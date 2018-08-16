import tensorflow as tf
import numpy as np

from agent import Agent

class Model(Agent):
  def __init__(self, config, env, sess, writer, name='haggle', trainable=True):
    super(Model, self).__init__()
    self.config = {
      'pre': [],
      'lstm': 128,
      'value_scale': 0.5,
      'lr': 0.001,
      'grad_clip': 0.5,
      'ppo': 0.1,
      'ppo_epochs': 10,
    }

    self.max_rounds = env.max_rounds

    self.config.update(config)

    self.original_name = name
    self.version = 0

    self.name = name

    self.observation_space = env.observation_space
    self.action_space = env.action_space
    self.context_space = env.context_space
    self.reward_space = env.reward_space

    self.empty_reward = np.zeros(self.reward_space, dtype='float32')

    # Used for getting offers by index
    self.env = env

    self.scope = tf.VariableScope(reuse=False, name=name)
    self.sess = sess
    self.writer = writer
    self.writer_step = 0

    with tf.variable_scope(self.scope):
      self.input = tf.placeholder(tf.int32,
          shape=(None, self.observation_space,), name='input')
      self.context = tf.placeholder(tf.int32,
          shape=(None, self.context_space,), name='input_context')

      # Init layers

      self.layers = {
        'embedding': tf.get_variable('embedding', dtype=tf.float32,
             initializer=tf.initializers.random_normal,
             shape=(self.action_space, self.config['lstm'])),
        'pre': [],
        'action': tf.layers.Dense(self.action_space, name='action'),
        'value': tf.layers.Dense(self.reward_space, name='value'),
        'context': tf.layers.Dense(self.config['lstm'] * 2,
            activation=tf.nn.relu, name='context'),
        'lstm': tf.contrib.rnn.LSTMBlockCell(name='lstm',
                                             num_units=self.config['lstm']),
      }

      self.build_context = self.layers['context'](
          tf.cast(self.context, dtype=tf.float32))

      for i, width in enumerate(self.config['pre']):
        pre = tf.layers.Dense(width, activation=tf.nn.relu,
                              name='preprocess_{}'.format(i))
        self.layers['pre'].append(pre)

      state_size = self.layers['lstm'].state_size
      self.rnn_state = tf.placeholder(tf.float32,
          shape=(None, state_size.c + state_size.h), name='rnn_state')

      state = tf.contrib.rnn.LSTMStateTuple(c=self.rnn_state[:, :state_size.c],
                                            h=self.rnn_state[:, state_size.c:])

      new_state, action, action_probs, value = \
          self._network(state, self.input)

      self.action = action
      self.action_probs = action_probs
      self.value = value
      self.new_state = tf.concat([ new_state.c, new_state.h ], axis=-1, \
          name='new_state')

      # Losses
      if trainable:
        self._losses()

      # Weight loading
      self.trainable_variables = self.scope.trainable_variables()

      self.weight_placeholders = {}
      self.load_ops = []
      for var in self.trainable_variables:
        name = var.name.split(':', 1)[0]
        name = name.split('/', 1)[1]
        placeholder = tf.placeholder(var.dtype,
            shape=var.shape,
            name='{}/placeholder'.format(name))
        self.weight_placeholders[name] = placeholder
        self.load_ops.append(var.assign(placeholder))

  def _network(self, state, obs, sample=True):
    # Get offer mask
    available_actions, offer = tf.split(obs, [
      self.action_space, 1,
    ], axis=1)

    available_actions = tf.cast(available_actions, dtype=tf.float32)

    # Translate proposed offer to embedding
    offer = tf.squeeze(offer, axis=-1, name='offer_index')
    offer = tf.gather(self.layers['embedding'], offer, name='offer')

    x = offer

    for pre in self.layers['pre']:
      x = pre(x)

    # Feed embedding into LSTM
    x, state = self.layers['lstm'](x, state)

    # Transform output to probs through same embedding, applying offer mask
    raw_action = tf.matmul(x, self.layers['embedding'], transpose_b=True)
    raw_action *= available_actions
    raw_action += (1.0 - available_actions) * -1e23

    action_probs = tf.nn.softmax(raw_action, name='action_probs')

    value = x
    value = self.layers['value'](value)

    if not sample:
      return state, action_probs, value

    action_dist = tf.distributions.Categorical(probs=action_probs)
    action = action_dist.sample()

    return state, action, action_probs, value

  def _losses(self):
    self.entropy_coeff = tf.placeholder(tf.float32, shape=(),
        name='entropy_coeff')

    input_shape = (None, self.max_rounds,)
    self.train_input = tf.placeholder(tf.int32,
        shape=input_shape + (self.observation_space,), name='train_input')
    self.train_mask = tf.placeholder(tf.bool, shape=input_shape,
        name='train_mask')
    self.true_value = tf.placeholder(tf.float32,
        shape=input_shape + (self.reward_space,), name='true_value')
    self.past_value = tf.placeholder(tf.float32,
        shape=input_shape + (self.reward_space,), name='past_value')
    self.past_prob = tf.placeholder(tf.float32,
        shape=input_shape, name='past_prob')
    self.selected_action = tf.placeholder(tf.int32,
        shape=input_shape, name='selected_action')

    state_size = self.layers['lstm'].state_size
    state = tf.contrib.rnn.LSTMStateTuple(
        c=self.build_context[:, :state_size.c],
        h=self.build_context[:, state_size.c:])

    entropy = []
    value_loss = []
    policy_loss = []
    values = []

    for i in range(self.max_rounds):
      with tf.name_scope('train_step_{}'.format(i)):
        obs = self.train_input[:, i]
        true_value = self.true_value[:, i]
        past_value = self.past_value[:, i]
        past_prob = self.past_prob[:, i]
        selected_action = self.selected_action[:, i]

        state, action_probs, value = self._network(state, obs, sample=False)

        round_entropy = \
            -tf.reduce_sum(action_probs * tf.log(action_probs + 1e-20),
                           axis=-1)

        online_advantage = true_value - value
        round_value_loss = tf.reduce_sum(online_advantage ** 2 / 2.0, axis=-1)

        action_one_hot = tf.one_hot(selected_action,
            depth=action_probs.shape[-1],
            dtype='float32',
            name='action_one_hot')
        current_prob = tf.reduce_sum(
            action_one_hot * action_probs,
            axis=-1,
            name='current_prob')

        prob_ratio = current_prob / (past_prob + 1e-12)
        ppo_epsilon = self.config['ppo']
        clipped_ratio = tf.clip_by_value(prob_ratio, 1.0 - ppo_epsilon,
            1.0 + ppo_epsilon, name='clipped_ratio')

        offline_advantage = tf.reduce_sum(true_value - past_value, axis=-1)
        round_policy_loss = -tf.minimum(
            prob_ratio * offline_advantage,
            clipped_ratio * offline_advantage)

        entropy.append(round_entropy)
        value_loss.append(round_value_loss)
        policy_loss.append(round_policy_loss)
        values.append(tf.reduce_sum(value, axis=-1))

    mask = tf.cast(self.train_mask, tf.float32, name='float_mask')

    mean_mask = mask / tf.expand_dims(tf.reduce_sum(mask, axis=-1) + 1e-12, \
        axis=-1)

    entropy = tf.stack(entropy, axis=-1, name='stacked_entropy')
    value_loss = tf.stack(value_loss, axis=-1, name='stacked_value_loss')
    policy_loss = tf.stack(policy_loss, axis=-1, name='stacked_policy_loss')
    values = tf.stack(values, axis=-1, name='stacked_values')

    self.entropy = tf.reduce_mean(
        tf.reduce_sum(entropy * mean_mask, axis=-1),
        axis=-1, name='entropy')
    self.value_loss = tf.reduce_mean(
        tf.reduce_sum(value_loss * mean_mask, axis=-1),
        axis=-1, name='value_loss')
    self.policy_loss = tf.reduce_mean(
        tf.reduce_sum(policy_loss * mean_mask, axis=-1),
        axis=-1, name='policy_loss')
    self.mean_value = tf.reduce_mean(
        tf.reduce_sum(values * mean_mask, axis=-1),
        axis=-1, name='mean_value')

    optimizer = tf.train.AdamOptimizer(self.config['lr'])

    self.loss = self.policy_loss + \
        self.value_loss * self.config['value_scale'] - \
        self.entropy * self.entropy_coeff

    variables = tf.trainable_variables()
    grads = tf.gradients(self.loss, variables)
    grads, grad_norm = tf.clip_by_global_norm(grads, self.config['grad_clip'])
    grads = list(zip(grads, variables))
    self.grad_norm = grad_norm
    self.train = optimizer.apply_gradients(grads_and_vars=grads)

  def save_weights(self, sess):
    values = sess.run(self.trainable_variables)
    out = {}
    for var, value in zip(self.trainable_variables, values):
      name = var.name.split(':', 1)[0]
      name = name.split('/', 1)[1]
      out[name] = value
    return out

  def load_weights(self, weights):
    feed_dict = {}
    for name, value in weights.items():
      if name in self.weight_placeholders:
        feed_dict[self.weight_placeholders[name]] = value
    return feed_dict, self.load_ops

  def set_version(self, version):
    self.version = version
    self.name = '{}_v{}'.format(self.original_name, self.version)

  def fill_feed_dict(self, out, obs, state=None):
    if state is None:
      state = [ self.initial_state ]

    out[self.input] = obs
    out[self.rnn_state] = state
    return out

  def build_initial_state(self, context):
    feed_dict = { self.context: [ context ] }
    return self.sess.run(self.build_context, feed_dict=feed_dict)[0]

  def step(self, obs, state):
    feed_dict = {}
    self.fill_feed_dict(feed_dict, [ obs ], [ state ])
    tensors = [ self.action, self.new_state ]

    action, next_state = self.sess.run(tensors, feed_dict=feed_dict)
    return self.env.get_offer(action[0]), next_state[0]

  def multi_step(self, env_states, model_states):
    feed_dict = {
      self.input: env_states,
      self.rnn_state: model_states,
    }
    tensors = [ self.action, self.action_probs, self.new_state, self.value ]
    out = self.sess.run(tensors, feed_dict=feed_dict)

    actions, action_probs, next_model_states, values = out
    action_probs = [
        probs[action] for action, probs in zip(actions, action_probs) ]

    return actions, next_model_states, values, action_probs

  def game(self, env_list):
    log = [ {
      'env_states': [],
      'env_context': None,
      'actions': [],
      'action_probs': [],
      'values': [],
      'rewards': [],
      'dones': [],
      'statuses': [],
    } for i in range(len(env_list)) ]

    env_states = [ env.reset() for env in env_list ]
    env_contexts = [ env.get_context('self') for env in env_list ]

    model_states = self.sess.run(self.build_context, feed_dict={
      self.context: env_contexts,
    })

    for context, entry in zip(env_contexts, log):
      entry['env_context'] = context

    steps = 0
    while True:
      actions, next_model_states, values, action_probs = \
          self.multi_step(env_states, model_states)

      next_env_states = []
      rewards = []
      dones = []
      statuses = []
      for env, env_state, action in zip(env_list, env_states, actions):
        if not env.done:
          next_env_state, reward, done, _ = env.step(self.env.get_offer(action))
        else:
          next_env_state, reward, done = \
              env_state, np.copy(self.empty_reward), True

        next_env_states.append(next_env_state)
        rewards.append(reward)
        dones.append(done)
        statuses.append(env.status)

      steps += 1

      zipped = zip(env_states, rewards, dones, statuses, actions,
          action_probs, values)
      for i, t in enumerate(zipped):
        env_state, reward, done, status, action, action_prob, \
            value = t

        entry = log[i]
        entry['env_states'].append(env_state)
        entry['rewards'].append(reward)
        entry['dones'].append(done)
        entry['statuses'].append(status)
        entry['actions'].append(action)
        entry['action_probs'].append(action_prob)
        entry['values'].append(value)

      # Update states
      env_states = next_env_states
      model_states = next_model_states

      has_pending = False in dones
      if not has_pending:
        # All completed
        break

    return log

  def explore(self, env_list, game_count=1024, reflect_every=256, game_off=0, \
              entropy_schedule=None):
    finished_games = 0
    while finished_games < game_count:
      reflect_target = min(game_count - finished_games, reflect_every)

      games = self.collect(env_list, reflect_target)
      finished_games += reflect_target

      if entropy_schedule is None:
        entropy_schedule = lambda game_step: self.config['entropy']

      self.reflect(games,
          entropy_coeff=entropy_schedule(game_off + finished_games))

  def collect(self, env_list, count):
    res = {
      'masks': [],
      'env_contexts': [],
      'env_states': [],
      'actions': [],
      'action_probs': [],
      'values': [],
      'rewards': [],
      'acceptance': [],
      'steps_per_game': [],
    }

    if count % len(env_list) != 0:
      raise Exception('Number of games is not divisible by concurrency')

    def pad(l, val):
      to_pad = self.max_rounds - len(l)
      if to_pad == 0:
        return l
      padding = [ val ] * to_pad
      res = np.concatenate([ l, padding ], axis=0)
      return res

    empty_obs = [ 0.0 ] * self.observation_space

    for game_index in range(count // len(env_list)):
      log = self.game(env_list)

      global_max_steps = len(log[0]['dones'])
      for entry in log:
        dones = entry['dones']
        max_steps = None
        for i in range(global_max_steps):
          if dones[i]:
            max_steps = i + 1
            break

        rewards = self.estimate_rewards(entry['rewards'], entry['dones'])

        res['env_states'].append(pad(entry['env_states'], empty_obs))
        res['actions'].append(pad(entry['actions'], 0))
        res['action_probs'].append(pad(entry['action_probs'], 0.0))
        res['values'].append(pad(entry['values'], np.copy(self.empty_reward)))
        res['rewards'].append(pad(rewards, np.copy(self.empty_reward)))
        res['masks'].append(pad([ True for e in entry['dones'] ], False))

        res['env_contexts'].append(entry['env_context'])

        # Averaged stats
        statuses = entry['statuses']
        res['acceptance'].append(statuses[max_steps - 1] is 'accepted')
        res['steps_per_game'].append(max_steps)

    res['steps_per_game'] = np.mean(res['steps_per_game'])
    res['acceptance'] = np.mean(res['acceptance'])

    return res

  def estimate_rewards(self, rewards, dones, gamma=0.99):
    estimates = np.zeros((len(rewards), self.reward_space,), dtype='float32')
    future = np.copy(self.empty_reward)

    for i, reward in reversed(list(enumerate(rewards))):
      if dones[i]:
        future *= 0.0
      future *= gamma
      estimates[i] = reward + future
      future += reward

    return estimates

  def reflect(self, games, entropy_coeff):
    feed_dict = {
      self.context: games['env_contexts'],
      self.train_input: games['env_states'],
      self.train_mask: games['masks'],
      self.selected_action: games['actions'],
      self.true_value: games['rewards'],
      self.past_value: games['values'],
      self.past_prob: games['action_probs'],
      self.entropy_coeff: entropy_coeff,
    }

    tensors = [
        self.train, self.loss, self.entropy, self.value_loss, self.policy_loss,
        self.mean_value, self.grad_norm,
    ]

    # TODO(indutny): average over metrics?
    for i in range(self.config['ppo_epochs']):
      _, loss, entropy, value_loss, policy_loss, value, grad_norm = \
          self.sess.run(tensors, feed_dict=feed_dict)

    global_rewards = []
    for rewards, masks in zip(games['rewards'], games['masks']):
      for reward, mask in zip(rewards, masks):
        if mask:
          global_rewards.append(reward)

    metrics = {
      'grad_norm': grad_norm,
      'loss': loss,
      'entropy': entropy,
      'entropy_coeff': entropy_coeff,
      'value_loss': value_loss,
      'policy_loss': policy_loss,
      'steps_per_game': games['steps_per_game'],
      'acceptance': games['acceptance'],
      'reward': np.mean(np.sum(global_rewards, axis=-1)),
      'value': value,
    }
    self.log_summary(metrics)

  def log_summary(self, metrics):
    summary = tf.Summary()
    for key in metrics:
      value = metrics[key]
      summary.value.add(tag='train/{}'.format(key), simple_value=value)
    self.writer.add_summary(summary, self.writer_step)
    self.writer.flush()
    self.writer_step += 1
