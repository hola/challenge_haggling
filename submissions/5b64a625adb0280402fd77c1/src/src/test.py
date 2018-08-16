import numpy as np

from env import Environment
from policy_agent import PolicyAgent

env = Environment()

estimator = PolicyAgent(env, policy='estimator')

env.add_opponent(estimator)

print(env.bench(PolicyAgent(env, policy='downsize'), times=3000))

env.reset()
print(env._make_state())
