import { MultiSignPrimaryServiceType } from './Constants';
import Zeroconf from 'react-native-zeroconf';
import { makeObservable } from 'mobx';

export class TCPClient {
  private zc = new Zeroconf();

  constructor() {
    this.zc.on('found', (e) => console.log('found', e));
    this.zc.on('resolved', (s) => console.log('resolved', s));
    this.zc.on('start', () => console.log('The scan has started.'));
  }

  start() {
    this.zc.scan(MultiSignPrimaryServiceType, 'tcp');
  }
}
