import os
import time
import sys
import json
import tensorflow as tf

from args import parse_args
from env import Environment
from model import Model

_, CONFIG, args = parse_args('transform-save')

env = Environment()

import_path = args.source
export_path = args.target

with tf.Session() as sess:
  model = Model(CONFIG, env, sess, None, name='haggle', trainable=False)
  saver = tf.train.Saver()
  saver.restore(sess, import_path)

  out = {}
  for var in tf.trainable_variables():
    val = sess.run(var)
    out[var.name] = val.tolist()

  with open(export_path, 'w') as f:
    json.dump(out, f)

  exit(0)

  # Unused code
  inputs = {
    'input': tf.saved_model.utils.build_tensor_info(model.input),
    'state': tf.saved_model.utils.build_tensor_info(model.rnn_state),
  }

  outputs = {
    'action': tf.saved_model.utils.build_tensor_info(model.action),
  }

  signature_def = tf.saved_model.signature_def_utils.build_signature_def(
      inputs=inputs,
      outputs=outputs,
  )

  builder = tf.saved_model.builder.SavedModelBuilder(export_path)
  builder.add_meta_graph_and_variables(
      sess, [ tf.saved_model.tag_constants.SERVING ],
      signature_def_map={ 'compute_action': signature_def })

  builder.save()
