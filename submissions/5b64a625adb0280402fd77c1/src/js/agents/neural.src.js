'use strict';

const weights = {/*weights*/};

function assert(exp) {
  if (!exp)
    throw new Error('Assertion failure');
}
assert.strictEqual = (a, b) => {
  if (a !== b)
    throw new Error(`Assert equal failure ${a} !== ${b}`);
};

const MAX_TYPES = 3;
const MIN_OBJ = 1;
const MAX_OBJ = 6;
const ACTION_SPACE = [];

function genOffers(out, offer, minObj, maxObj, i) {
  if (i === MAX_TYPES) {
    let sum = 0;
    for (const count of offer) {
      sum += count;
    }
    if (sum > maxObj) {
      return;
    }
    out.push(offer.slice());
    return;
  }

  for (let j = 0; j <= maxObj; j++) {
    offer[i] = j;
    genOffers(out, offer, minObj, maxObj, i + 1);
  }
}

function findOffer(offer) {
  // Initial observation
  if (offer === null) {
    return 0;
  }

  for (let i = 0; i < ACTION_SPACE.length; i++) {
    const other = ACTION_SPACE[i];
    let same = true;
    for (let j = 0; j < other.length; j++) {
      if (other[j] !== offer[j]) {
        same = false;
        break;
      }
    }

    if (same) {
      return 1 + i;
    }
  }

  throw new Error('No matching offer found');
}

genOffers(ACTION_SPACE, new Array(MAX_TYPES).fill(0), MIN_OBJ, MAX_OBJ, 0);

function matmul(vec, mat) {
  assert.strictEqual(vec.length, mat.length);

  const res = new Array(mat[0].length).fill(0);
  for (let j = 0; j < res.length; j++) {
    let acc = 0;
    for (let i = 0; i < vec.length; i++) {
      acc += vec[i] * mat[i][j];
    }
    res[j] = acc;
  }

  return res;
}

function matmulT(vec, mat) {
  assert.strictEqual(vec.length, mat[0].length);

  const res = new Array(mat.length).fill(0);
  for (let j = 0; j < res.length; j++) {
    let acc = 0;
    for (let i = 0; i < vec.length; i++) {
      acc += vec[i] * mat[j][i];
    }
    res[j] = acc;
  }

  return res;
}

function add(a, b) {
  assert.strictEqual(a.length, b.length);

  const res = a.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] += b[i];
  }
  return res;
}

function mul(a, b) {
  assert.strictEqual(a.length, b.length);

  const res = a.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] *= b[i];
  }
  return res;
}

function tanh(x) {
  const res = x.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] = Math.tanh(res[i]);
  }
  return res;
}

function sigmoid(x) {
  const res = x.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] = 1 / (1 + Math.exp(-res[i]));
  }
  return res;
}

function relu(x) {
  const res = x.slice();
  for (let i = 0; i < res.length; i++) {
    res[i] = Math.max(0, res[i]);
  }
  return res;
}

function softmax(x) {
  const res = x.slice();
  let sum = 0;
  for (let i = 0; i < res.length; i++) {
    const t = Math.exp(res[i]);
    sum += t;
    res[i] = t;
  }

  for (let i = 0; i < res.length; i++) {
    res[i] /= sum;
  }
  return res;
}

class LSTM {
  constructor(kernel, bias) {
    this.kernel = kernel;
    this.bias = bias;

    this.units = (this.kernel[0].length / 4) | 0;
    this.forgetBias = new Array(this.units).fill(1);
    this.activation = tanh;

    this.initialState = {
      c: new Array(this.units).fill(0),
      h: new Array(this.units).fill(0),
    };
  }

  call(input, state = this.initialState) {
    const x = input.concat(state.h);

    const gateInputs = add(matmul(x, this.kernel), this.bias);

    const i = gateInputs.slice(0, this.units);
    const j = gateInputs.slice(this.units, 2 * this.units);
    const f = gateInputs.slice(2 * this.units, 3 * this.units);
    const o = gateInputs.slice(3 * this.units);

    const newC = add(mul(state.c, sigmoid(add(f, this.forgetBias))),
        mul(sigmoid(i), this.activation(j)));
    const newH = mul(this.activation(newC), sigmoid(o));

    return { result: newH, state: { c: newC, h: newH } };
  }
}

class Dense {
  constructor(kernel, bias) {
    this.kernel = kernel;
    this.bias = bias;
  }

  call(input) {
    return add(matmul(input, this.kernel), this.bias);
  }
}

class Model {
  constructor(weights) {
    this.embedding = weights['haggle/embedding:0'];
    this.context = new Dense(weights['haggle/context/kernel:0'],
                             weights['haggle/context/bias:0']);

    this.pre = [];
    for (let i = 0; ; i++) {
      const prefix = `haggle/preprocess_${i}`;
      if (!weights.hasOwnProperty(`${prefix}/kernel:0`)) {
        break;
      }

      this.pre.push(new Dense(weights[`${prefix}/kernel:0`],
                              weights[`${prefix}/bias:0`]));
    }

    this.lstm = new LSTM(weights['haggle/lstm/kernel:0'],
                         weights['haggle/lstm/bias:0']);

    this.value = new Dense(weights['haggle/value/kernel:0'],
                           weights['haggle/value/bias:0']);
  }

  random(probs) {
    let roll = Math.random();
    let action = 0;
    for (;;) {
      roll -= probs[action];
      if (roll <= 0) {
        break;
      }
      action++;
    }
    return action;
  }

  max(probs) {
    let max = 0;
    let maxI = 0;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > max) {
        maxI = i;
        max = probs[i];
      }
    }
    return maxI;
  }

  buildInitialState(context) {
    const state = relu(this.context.call(context));
    return {
      c: state.slice(0, this.lstm.units),
      h: state.slice(this.lstm.units),
    };
  }

  call(input, state) {
    const available = input.slice(0, 1 + ACTION_SPACE.length);
    input = input.slice(available.length);

    const proposed = input[0];
    const embeddedProposal = this.embedding[proposed];

    let pre = embeddedProposal;
    for (const layer of this.pre) {
      pre = relu(layer.call(pre));
    }
    let { result: x, state: newState } = this.lstm.call(pre, state);
    const rawAction = matmulT(x, this.embedding);

    // Mask
    assert.strictEqual(rawAction.length, available.length);
    for (let i = 0; i < available.length; i++) {
      const mask = available[i];
      if (!mask) {
        rawAction[i] = -1e23;
      }
    }
    const probs = softmax(rawAction);

    const action = this.random(probs);
    // const action = this.max(probs);

    const value = this.value.call(x);

    return { probs, action, value, state: newState };
  }
}

class Environment {
  constructor(values, counts, maxRounds, types = 3) {
    this.types = types;

    this.offer = null;
    this.values = new Array(MAX_TYPES).fill(0);
    this.counts = new Array(MAX_TYPES).fill(0);

    assert(values.length <= this.values.length);
    for (let i = 0; i < values.length; i++)
      this.values[i] = values[i];

    assert(counts.length <= this.counts.length);
    for (let i = 0; i < counts.length; i++)
      this.counts[i] = counts[i];

    this.available = ACTION_SPACE.map((offer) => {
      return offer.every((count, i) => {
        return count <= this.counts[i];
      }) ? 1 : 0;
    });
  }

  buildObservation() {
    const canSubmit = this.offer !== null;
    return [].concat(canSubmit, this.available, findOffer(this.offer));
  }

  buildContext() {
    return [].concat(this.values, this.counts);
  }

  setOffer(offer) {
    assert(offer.length <= this.counts.length);
    if (this.offer === null) {
      this.offer = this.counts.slice();
    }
    for (let i = 0; i < offer.length; i++) {
      this.offer[i] = offer[i];
    }
  }
}

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.m = new Model(weights);

    this.env = new Environment(values, counts, maxRounds);
    this.log = log;
    this.state = this.m.buildInitialState(this.env.buildContext());
  }

  offer(o) {
    try {
      return this._offer(o);
    } catch (e) {
      this.log(e.stack);
      throw e;
    }
  }

  _offer(o) {
    if (o !== undefined) {
      this.env.setOffer(o);
    }

    const { action, value, probs, state: newState } = this.m.call(
        this.env.buildObservation(),
        this.state);

    if (value.length === 1) {
      this.log(`reward=${value[0].toFixed(3)} ` +
          `action=${action} ` +
          `prob=${probs[action].toFixed(3)}`);
    } else {
      this.log(`svalue=${value[0].toFixed(3)} ovalue=${value[1].toFixed(3)} ` +
          `action=${action} ` +
          `prob=${probs[action].toFixed(3)}`);
    }

    if (value.length >= 3) {
      this.log(`bonus=${value[2]}`);
    }

    this.state = newState;

    // Accept
    if (action === 0) {
      return undefined;
    }

    const offer = ACTION_SPACE[action - 1];
    return offer;
  }
};
