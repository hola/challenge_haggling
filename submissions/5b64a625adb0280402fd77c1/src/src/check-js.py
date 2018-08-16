import tensorflow as tf

from env import Environment
from policy_agent import PolicyAgent
from model import Model
from args import parse_args

_, CONFIG, args = parse_args('check-js')

env = Environment()

env.add_opponent(PolicyAgent(env, policy='downsize'))

with tf.Session() as sess:
  model = Model(CONFIG, env, sess, None, name='haggle')
  saver = tf.train.Saver(max_to_keep=10000, name='test')

  saver.restore(sess, args.source)
  print(sess.run(model.action_probs, feed_dict={
    model.input: [ [
      # available actions
      1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,

      0, 0, 1, 3, 4, 0, 2, 1, 1
    ] ],
    model.rnn_state: [ model.zero_state ],
    model.is_first_round: [ True ],
  }))
