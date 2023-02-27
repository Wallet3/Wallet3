import { computed, makeObservable, observable, runInAction } from 'mobx';
import { openKeyRecoveryProvider, openShardProvider } from '../../../common/Modals';

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
    const { keyRecoveryRequestor: service } = handleRawService(raw);
    if (!service) return;
    console.log('found recovery request', raw);

    const reqId = service.txt?.['reqId'];
    if (this.handledIds.has(reqId)) {
      return;
    }

    openKeyRecoveryProvider({});
  };

  scanLan = () => PairedDevices.hasDevices && Bonjour.scan(KeyManagementService);
}

export default new KeyRecoveryWatcher();
