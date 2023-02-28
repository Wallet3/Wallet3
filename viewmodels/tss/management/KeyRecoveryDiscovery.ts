import { computed, makeObservable, observable, runInAction } from 'mobx';
import { openKeyRecoveryProvider, openShardProvider } from '../../../common/Modals';

import App from '../../core/App';
import Bonjour from '../../../common/p2p/Bonjour';
import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import { KeyManagementService } from '../Constants';
import { KeyRecoveryProvider } from '../KeyRecoveryProvider';
import { PairedDevice } from './PairedDevice';
import PairedDevices from './PairedDevices';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import ShardKey from '../../../models/entities/ShardKey';
import { ShardProvider } from '../ShardProvider';
import { handleRawService } from './DistributorDiscovery';
import { sha256Sync } from '../../../utils/cipher';

class KeyRecoveryWatcher {
  private handledIds = new Set<string>();

  constructor() {
    Bonjour.on('resolved', this.handleService);
  }

  private handleService = (raw: Service) => {
    if (!App.hasWalletSet) return;

    const { keyRecoveryRequestor: service } = handleRawService(raw);
    if (!service) return;

    const reqId = service.txt?.['reqId'];
    if (this.handledIds.has(reqId)) {
      setTimeout(() => this.scanLan(), 15 * SECOND);
      return;
    }

    this.handledIds.add(reqId);
    openKeyRecoveryProvider({ service, onClosed: () => setTimeout(() => this.scanLan(), 15 * SECOND) });
  };

  scanLan = () => Bonjour.scan(KeyManagementService);
}

export default new KeyRecoveryWatcher();
