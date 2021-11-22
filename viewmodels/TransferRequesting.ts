import { BigNumber, utils } from 'ethers';
import { action, computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { build, parse } from 'eth-url-parser';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INetwork } from '../common/Networks';
import { IToken } from '../common/Tokens';

export class TransferRequesting {
  token: IToken;
  amount = '';

  readonly network: INetwork;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  get amountWei() {
    try {
      return utils.parseUnits(this.amount, this.token.decimals);
    } catch (error) {
      return BigNumber.from(-1);
    }
  }

  get isValidAmount() {
    return this.amountWei.gte(0);
  }

  get requestingUri() {
    const basic = { scheme: 'ethereum', chain_id: this.network.chainId };

    if (this.token.address) {
      return build({
        ...basic,
        target_address: this.token.address,
        function_name: 'transfer',
        parameters: {
          uint256: this.isValidAmount ? this.amountWei.toString() : '0',
          address: this.currentAccount.address,
        },
      });
    } else {
      return build({
        ...basic,
        target_address: this.currentAccount.address,
        parameters: { value: this.isValidAmount ? this.amountWei.toString() : '0' },
      });
    }
  }

  constructor(network: INetwork) {
    this.network = network;
    this.token = this.allTokens[0];

    makeObservable(this, {
      token: observable,
      amount: observable,
      allTokens: computed,
      amountWei: computed,
      isValidAmount: computed,
      requestingUri: computed,
      setToken: action,
      setAmount: action,
    });

    AsyncStorage.getItem(`${network.chainId}-${this.currentAccount.address}-LastUsedToken`).then((v) => {
      if (!v) return;

      const token = this.allTokens.find((t) => t.address === v) || this.allTokens[0];
      runInAction(() => this.setToken(token));
    });
  }

  setToken(token: IToken) {
    this.token = token;

    AsyncStorage.setItem(`${this.network.chainId}-${this.currentAccount.address}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
  }
}

// console.log(
//   'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
// );
// console.log(
//   parse(
//     'ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0x8e23ee67d1332ad560396262c48ffbb01f93d052&uint256=1'
//   )
// );

console.log(parse('ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7@137?value=2.8e20'));
