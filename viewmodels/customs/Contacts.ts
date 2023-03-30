import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import App from '../core/App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Networks from '../core/Networks';
import { getEnsAvatar } from '../../common/ENS';
import { reverseLookupAddress } from '../services/ens/DomainResolver';

export interface IContact {
  address: string;
  ens?: string;
  avatar?: string;
  name?: string;
  emoji?: { color: string; icon: string };
  more?: { tel?: string; email?: string; twitter?: string; note?: string };
}

class Contacts {
  contacts: IContact[] = [];

  get sorted() {
    return this.contacts.filter((i) => i.name || i.ens).concat(this.contacts.filter((i) => !i.name && !i.ens));
  }

  constructor() {
    makeObservable(this, { contacts: observable, sorted: computed, saveContact: action, reset: action, remove: action });
  }

  init() {
    AsyncStorage.getItem('contacts').then((v) => {
      const contacts: IContact[] = JSON.parse(v || '[]');
      for (let c of contacts) {
        c.more = c.more || {};

        const a = App.findAccount(c.address);
        if (!a) continue;

        c.name = a.nickname || c.ens || `Account ${a.index}`;
        c.emoji = { color: a.emojiColor, icon: a.emojiAvatar };
      }

      runInAction(() => (this.contacts = contacts));
    });
  }

  async saveContact(contact: IContact) {
    let { address, ens } = contact;
    const freq = this.contacts.find((c) => c.address.toLowerCase() === address.toLowerCase());
    if (freq) {
      this.contacts = [freq, ...this.contacts.filter((c) => c !== freq)];
      AsyncStorage.setItem('contacts', JSON.stringify(this.contacts));
      return;
    }

    this.contacts = [contact, ...this.contacts];
    AsyncStorage.setItem('contacts', JSON.stringify(this.contacts));

    if (!ens) ens = (await reverseLookupAddress(address)) || '';
    if (!ens) return;

    getEnsAvatar(ens, address).then((v) => {
      if (!v?.url) return;

      const target = this.contacts.find((c) => c.address === address);
      if (target) {
        target.avatar = v.url;
        target.ens = ens;
      }

      AsyncStorage.setItem('contacts', JSON.stringify(this.contacts));
    });
  }

  remove(contact: IContact) {
    const index = this.contacts.findIndex((c) => c === contact);
    if (index === -1) return;

    this.contacts = this.contacts.filter((c) => c !== contact);
    AsyncStorage.setItem('contacts', JSON.stringify(this.contacts));
  }

  reset() {
    this.contacts = [];
  }
}

export default new Contacts();
