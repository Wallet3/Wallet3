import { makeObservable, observable } from 'mobx';

import { IToken } from '../common/Tokens';

export class Account {
  address: string;
  index: number;
  tokens: IToken[] = [];

  constructor(address: string, index: number) {
    this.address = address;
    this.index = index;

    makeObservable(this, { tokens: observable });
  }
}
