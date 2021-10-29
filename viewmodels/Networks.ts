import { INetwork, PublicNetworks } from '../common/Networks';

import { makeAutoObservable } from 'mobx';

class Networks {
  current = PublicNetworks[0];

  constructor() {
    makeAutoObservable(this);
  }

  switch(network: INetwork) {
    this.current = network;
  }
}

export default new Networks();
