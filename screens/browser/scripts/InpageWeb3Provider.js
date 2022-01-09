class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  once(name, listener) {
    this.on(name, (...args) => {
      this.removeListener(name, listener);
      listener.apply(this, args);
    });
  }

  off(name, listener) {
    this.removeListener(name, listener);
  }

  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      return;
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name, data) {
    if (!this._events[name]) {
      return;
    }

    const fireCallbacks = (callback) => callback(data);

    this._events[name].forEach(fireCallbacks);
  }
}

class InpageWeb3Provider extends EventEmitter {
  constructor() {
    super();

    this._id = 0;
    this._pending = {};
    this._chainId = 1;
    this._account = undefined;
    this._subscribe();
  }

  get chainId() {
    return this._chainId;
  }

  get netVersion() {
    return this._chainId;
  }

  _postMessage(payload) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'INPAGE_REQUEST', origin: window.location.hostname, jsonrpc: payload })
    );
  }

  _onMessage(data) {
    try {
      const { payload, type } = JSON.parse(data);
      switch (type) {
        case 'STATE_UPDATE':
          this._onStateUpdate(payload);
          break;

        case 'INPAGE_RESPONSE':
          this._onBackgroundResponse(payload);
          break;
      }
    } catch (error) {}
  }

  _onBackgroundResponse(payload) {
    const callback = this._pending[payload.id];
    if (!callback) return;

    callback(payload.error, payload);
    delete this._pending[id];
  }

  _onStateUpdate(state) {
    const { selectedAddress, network } = state;

    if (this._account !== selectedAddress) {
      this._account = selectedAddress;
      this.emit('accountsChanged', [this._account]);
    }

    if (Number(this._chainId) !== Number(network)) {
      this._chainId = network;
      this.emit('networkChanged', this._chainId);
      this.emit('chainChanged', this._chainId);
    }

    // Legacy web3 support
    if (window.web3 && window.web3.eth) {
      window.web3.eth.defaultAccount = this._account;
    }

    window.ethereum._wallet3.defaultAccount = this._account;
  }

  _subscribe() {
    window.addEventListener('message', ({ data }) => {
      if (data.toString().indexOf('INPAGE_RESPONSE') !== -1 || data.toString().indexOf('STATE_UPDATE') !== -1) {
        this._onMessage(data);
      }
    });
  }

  enable = () => this.rpcRequest('eth_requestAccounts');

  isConnected = () => true;

  request = (methodOrPayload, paramsOrCallback) => this.send(methodOrPayload, paramsOrCallback);

  rpcRequest = (method, params) => {
    return new Promise((resolve, reject) => {
      this._sendAsync({ jsonrpc: '2.0', id: ++this._id, method, params }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.result);
        }
      });
    });
  };

  send(methodOrPayload, paramsOrCallback) {
    if (typeof methodOrPayload === 'string') {
      return this.rpcRequest(methodOrPayload, paramsOrCallback);
    }

    return new Promise((resolve, reject) => {
      const id = methodOrPayload.id || this._id++;
      this._sendAsync({ ...methodOrPayload, id, jsonrpc: '2.0' }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
          paramsOrCallback(undefined, response);
        }
      });
    });
  }

  _sendAsync(jsonRpcRequest, jsonRpcCallback) {
    this._pending[jsonRpcRequest.id] = jsonRpcCallback;
    this._postMessage(jsonRpcRequest);
  }
}

if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  try {
    window.ethereum = new InpageWeb3Provider();
  } catch (e) {
    alert(JSON.stringify(e));
  }

  window.ethereum._wallet3 = {};

  window.ethereum._metamask = new Proxy(
    {
      /**
       * Determines if user accounts are enabled for this domain
       *
       * @returns {boolean} - true if accounts are enabled for this domain
       */
      isEnabled: () => true,

      /**
       * Determines if user accounts have been previously enabled for this
       * domain in the past. This is useful for determining if a user has
       * previously whitelisted a given dapp.
       *
       * @returns {Promise<boolean>} - Promise resolving to true if accounts have been previously enabled for this domain
       */
      isApproved: async () => {
        return true;
      },

      /**
       * Determines if MetaMask is unlocked by the user. The mobile application
       * is always unlocked, so this method exists only for symmetry with the
       * browser extension.
       *
       * @returns {Promise<boolean>} - Promise resolving to true
       */
      isUnlocked: () => Promise.resolve(true),
    },
    {
      get: (obj, prop) => {
        !window.ethereum._warned &&
          // eslint-disable-next-line no-console
          console.warn(
            'Heads up! ethereum._metamask exposes methods that have ' +
              'not been standardized yet. This means that these methods may not be implemented ' +
              'in other dapp browsers and may be removed from MetaMask in the future.'
          );
        window.ethereum._warned = true;
        return obj[prop];
      },
    }
  );
}
