import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { genColor, genEmoji } from '../../utils/emoji';

import { AccountTokens } from './content/AccountTokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyViewmodel from '../settings/Currency';
import { ENSViewer } from './content/ENSViewer';
import { NFTViewer } from './content/NFTViewer';
import Networks from '../core/Networks';
import { POAP } from './content/POAP';
import { formatAddress } from '../../utils/formatter';
import { getEnsAvatar } from '../../common/ENS';

export type AccountType = 'eoa' | 'erc4337';

export abstract class AccountBase {
  abstract readonly type: AccountType;
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

  get isERC4337() {
    return this.type === 'erc4337';
  }

  get isEOA() {
    return this.type === 'eoa';
  }

  constructor(address: string, index: number, extra?: { signInPlatform?: string }) {
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

  setAvatar(objs: { emoji?: string; color?: string; nickname?: string }) {
    this.emojiAvatar = objs.emoji || this.emojiAvatar;
    this.emojiColor = objs.color || this.emojiColor;
    this.nickname = objs.nickname ?? this.nickname;

    AsyncStorage.setItem(
      `${this.address}-local-avatar`,
      JSON.stringify({ emoji: this.emojiAvatar, color: this.emojiColor, nickname: this.nickname })
    );
  }

  toPlainObject() {
    return {
      address: this.address,
      index: this.index,
    };
  }
}
