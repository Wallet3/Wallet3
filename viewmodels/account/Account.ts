import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { genColor, genEmoji } from '../../utils/emoji';

import { AccountTokens } from './AccountTokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyViewmodel from '../settings/Currency';
import { ENSViewer } from './ENSViewer';
import { NFTViewer } from './NFTViewer';
import Networks from '../core/Networks';
import { POAP } from './POAP';
import { formatAddress } from '../../utils/formatter';
import { getEnsAvatar } from '../../common/ENS';

export class Account {
  readonly address: string;
  readonly index: number;
  readonly signInPlatform?: string;

  tokens: AccountTokens;
  ens: ENSViewer;
  nfts: NFTViewer;
  poap: POAP;
  emojiAvatar = '';
  emojiColor = '';
  nickname = '';

  get nativeToken() {
    return this.tokens.nativeToken;
  }

  get displayName() {
    return this.nickname || this.ens.name || formatAddress(this.address, 7, 5);
  }

  get miniDisplayName() {
    return this.nickname || this.ens.name || formatAddress(this.address, 6, 4, '...');
  }

  get avatar() {
    return this.ens.avatar;
  }

  get balance() {
    return CurrencyViewmodel.usdToToken(this.tokens.balanceUSD);
  }

  setAvatar(objs: { emoji?: string; color?: string; nickname?: string }) {
    this.emojiAvatar = objs.emoji || this.emojiAvatar;
    this.emojiColor = objs.color || this.emojiColor;
    this.nickname = objs.nickname ?? this.nickname;

    AsyncStorage.setItem(
      `${this.address}-local-avatar`,
      JSON.stringify({ emoji: this.emojiAvatar, color: this.emojiColor, nickname: this.nickname })
    );
  }

  constructor(address: string, index: number, extra: { signInPlatform?: string }) {
    // address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    // address = '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'; // nick.eth
    // address = '0x23d09ed7a3f46270271f5b2e00bfb4aecf361160';
    // address = '0xf0e0F53bF0564C82A8046bfB58E009076aafaAa3'; // japanese artist
    // address = '0xC0c648e8a51Fa89141b2ff297C8cD3270ab93576'; // BSC nfts
    // address = '0x5164cF3b0C8C0FDfE4BCc9Cf4F1e8f7E39461A59';

    this.address = address;
    this.index = index;
    this.signInPlatform = extra?.signInPlatform;

    this.tokens = new AccountTokens(this.address);
    this.ens = new ENSViewer(this.address);
    this.nfts = new NFTViewer(this.address);
    this.poap = new POAP(this.address);

    makeObservable(this, {
      tokens: observable,
      displayName: computed,
      balance: computed,
      emojiAvatar: observable,
      emojiColor: observable,
      nickname: observable,
      setAvatar: action,
    });

    AsyncStorage.getItem(`${address}-local-avatar`).then((v) => {
      let { emoji, color, nickname } = JSON.parse(v || '{}');

      if (!emoji || !color) {
        emoji = genEmoji();
        color = genColor();

        AsyncStorage.setItem(`${address}-local-avatar`, JSON.stringify({ emoji, color }));
      }

      runInAction(() => {
        this.emojiAvatar = emoji;
        this.emojiColor = color;
        this.nickname = nickname || '';
      });
    });
  }
}
