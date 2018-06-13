'use strict';

const crypto = require('crypto')

class TpState {
  constructor (context) {
    this.context = context
    this.addressCache = new Map([])
    this.timeout = 500 // Timeout in milliseconds
  }

getState (name) {
    return this._loadState(name).then((state) => state.get(name));
}

setState (name, state) {
  let address = _makeTpAddress(name);

  return this._loadState(name).then((state) => {
    state.set(name, state);
    return state;
  }).then((state) => {
    let data = _serialize(state);

    this.addressCache.set(address, data);
    let entries = {
      [address]: data
    };
    return this.context.setState(entries, this.timeout);
  });
}

_loadState (name) {
  let address = _makeTpAddress(name);
  if (this.addressCache.has(address)) {
    if (this.addressCache.get(address) === null) {
      return Promise.resolve(new Map([]));
    } else {
      return Promise.resolve(_deserialize(this.addressCache.get(address)));
    }
  } else {
    return this.context.getState([address], this.timeout)
      .then((addressValues) => {
        if (!addressValues[address].toString()) {
          this.addressCache.set(address, null);
          return new Map([]);
        } else {
          let data = addressValues[address].toString();
          this.addressCache.set(address, data);
          return _deserialize(data);
        }
      });
    }
  }
}

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64);

const TP_FAMILY = 'tp';

const TP_NAMESPACE = _hash(TP_FAMILY).substring(0, 6);

const _makeTpAddress = (x) => TP_NAMESPACE + _hash(x);

module.exports = {
  TP_NAMESPACE,
  TP_FAMILY,
  TpState
}
