import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import Networks from '../Networks';
import curve from '@curvefi/api';
import { getRPCUrls } from '../../common/RPC';

const SupportedChains: { [key: number]: IToken[] } = {
  1: [],
  137: [],
  43114: [],
};

const Keys = {
  userSelectedNetwork: 'userSelectedNetwork',
};

export class CurveExchange {
  networks = Object.getOwnPropertyNames(SupportedChains).map((id) => Networks.find(id)!);
  userSelectedNetwork = Networks.Ethereum;

  get tokens() {
    return SupportedChains[this.userSelectedNetwork.chainId];
  }

  constructor() {
    makeObservable(this, { userSelectedNetwork: observable, networks: observable, tokens: computed, switchNetwork: action });

    this.init();

    // curve.init('JsonRpc', { url: getRPCUrls(1)[0] }, { chainId: 1 }).then(async () => {
    //   const r = await curve.router.getBestRouteAndOutput(
    //     '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //     '0xD533a949740bb3306d119CC777fa900bA034cd52',
    //     '1000'
    //   );
    //   console.log(r);

    //   await curve.init('JsonRpc', { url: getRPCUrls(137)[0] }, { chainId: 137 });

    //   console.log(
    //     await curve.router.getBestRouteAndOutput(
    //       '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    //       '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    //       '2'
    //     )
    //   );
    // });
  }

  async init() {
    console.log(this.networks);

    const chainId = Number((await AsyncStorage.getItem(Keys.userSelectedNetwork)) || 1);

    runInAction(() => {
      this.userSelectedNetwork = Networks.find(chainId)!;
    });
  }

  switchNetwork(network: INetwork) {
    this.userSelectedNetwork = network;
    AsyncStorage.setItem(Keys.userSelectedNetwork, `${network.chainId}`);
  }
}

export default new CurveExchange();
