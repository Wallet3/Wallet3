import { EthereumAddress, POAP } from './POAP';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { genColor, genEmoji } from '../../utils/emoji';

import { AccountTokens } from './AccountTokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyViewmodel from '../settings/Currency';
import { ENSViewer } from './ENSViewer';
import Networks from '../Networks';
import { formatAddress } from '../../utils/formatter';
import { getAvatar } from '../../common/ENS';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: AccountTokens;
  ens: ENSViewer;
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

  constructor(address: string, index: number) {
    address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    if (index === 2) address = '0xFfec0067F5a79CFf07527f63D83dD5462cCf8BA4';
    
    this.address = address;
    this.index = index;

    this.tokens = new AccountTokens(this.address);
    this.ens = new ENSViewer(this.address);

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
