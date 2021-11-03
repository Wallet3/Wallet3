import { makeObservable, observable } from 'mobx';

import { IToken } from '../common/Tokens';

class Transferring {
  to = '';
  token: IToken | null = null;
  amount = '0';

  constructor() {
    makeObservable(this, { to: observable, setTo: observable, token: observable, amount: observable });
  }

  setTo(to: string) {
    this.to = to;
  }
}
