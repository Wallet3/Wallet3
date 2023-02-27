import { KeyAggregationService, KeyRecoveryService } from '../Constants';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../../common/p2p/Bonjour';
import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import { PairedDevice } from './PairedDevice';
import PairedDevices from './PairedDevices';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import ShardKey from '../../../models/entities/ShardKey';
import { ShardProvider } from '../ShardProvider';
import { handleRawService } from './DistributorDiscovery';
import { openShardProvider } from '../../../common/Modals';
import { sha256Sync } from '../../../utils/cipher';

class KeyRecoveryWatcher {
  private handledIds = new Set<string>();

  constructor() {
    Bonjour.on('resolved', this.handleService);
  }

  private handleService = (raw: Service) => {
    const { keyRecoveryRequestor: service } = handleRawService(raw);
    if (!service) return;

    const reqId = service.txt?.['reqId'];
    if (this.handledIds.has(reqId)) {
      return;
    }

    
  };

  scanLan = () => PairedDevices.hasDevices && Bonjour.scan(KeyRecoveryService);
}

export default new KeyRecoveryWatcher();
