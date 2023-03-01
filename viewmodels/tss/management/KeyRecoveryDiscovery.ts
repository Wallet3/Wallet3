import Bonjour from '../../../common/p2p/Bonjour';
import { KeyManagementService } from '../Constants';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import { handleRawService } from './Common';
import { openKeyRecoveryProvider } from '../../../common/Modals';

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
      setTimeout(() => this.scanLan(), 15 * SECOND);
      return;
    }

    this.handledIds.add(reqId);
    openKeyRecoveryProvider({ service, onClosed: () => setTimeout(() => this.scanLan(), 15 * SECOND) });
  };

  scanLan = () => Bonjour.scan(KeyManagementService);
}

export default new KeyRecoveryWatcher();
