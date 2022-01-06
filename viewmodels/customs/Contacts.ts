import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Networks from '../Networks';
import { getAvatar } from '../../common/ENS';

export interface IContact {
  address: string;
  ens?: string;
  avatar?: string;
}

class Contacts {
  contacts: IContact[] = [];

  constructor() {
    makeObservable(this, { contacts: observable, saveContact: action, reset: action });

    AsyncStorage.getItem(`contacts`).then((v) => {
      runInAction(() => (this.contacts = JSON.parse(v || '[]')));
    });
  }

  async saveContact(contact: IContact) {
    let { address, ens } = contact;
    const freq = this.contacts.find((c) => c.address.toLowerCase() === address.toLowerCase());
    if (freq) {
      this.contacts = [freq, ...this.contacts.filter((c) => c !== freq)];
      AsyncStorage.setItem(`contacts`, JSON.stringify(this.contacts));
      return;
    }

    this.contacts = [contact, ...this.contacts];
    AsyncStorage.setItem(`contacts`, JSON.stringify(this.contacts));

    if (!ens) {
      const provider = Networks.MainnetWsProvider;
      ens = (await provider.lookupAddress(address)) || '';
    }

    if (ens) {
      getAvatar(ens, address).then((v) => {
        if (!v?.url) return;

        const target = this.contacts.find((c) => c.address === address);
        if (target) {
          target.avatar = v.url;
          target.ens = ens;
        }

        AsyncStorage.setItem(`contacts`, JSON.stringify(this.contacts));
      });
    }
  }

  reset() {
    this.contacts = [];
  }
}

export default new Contacts();
