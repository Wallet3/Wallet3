import Bonjour from '../../../common/p2p/Bonjour';
import { KeyManagementService } from '../Constants';
import PairedDevices from './PairedDevices';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import eccrypto from 'eccrypto';
import { globalId } from '../../../common/p2p/Utils';
import { handleRawService } from './Common';
import { openKeyRecoveryProvider } from '../../../common/Modals';
import { openShardRedistributionReceiver } from '../../../common/Modals';

class KeyRecoveryWatcher {
  private handledIds = new Set<string>();
  private selfId = globalId;

  constructor() {
    Bonjour.on('resolved', this.onResolved);
  }

  private onResolved = (raw: Service) => {
    this.handleRecovery(raw);
    this.handleRedistributor(raw);
  };

  private handleRecovery = (raw: Service) => {
    const { keyRecoveryRequestor: service } = handleRawService(raw);
    if (!service) return;
    if (service.txt.info.globalId === this.selfId) return;

    const reqId = service.txt?.['reqId'];
    if (this.handledIds.has(reqId)) {
      setTimeout(() => this.scanLan(), 15 * SECOND);
      return;
    }

    this.handledIds.add(reqId);
    openKeyRecoveryProvider({ service, onClosed: () => setTimeout(() => this.scanLan(), 15 * SECOND) });
  };

  private handleRedistributor = async (raw: Service) => {
    const { shardsRedistribution: service } = handleRawService(raw);
    if (!service) return;
    if (!service.txt.witness) return;
    if (service.txt.info.globalId === this.selfId) return;
    if (this.handledIds.has(service.txt.reqId)) return;

    this.handledIds.add(service.txt.reqId);

    const id = service.txt.distributionId;
    const devices = PairedDevices.devices.filter((d) => d.distributionId === id);
    const device = devices.find((d) => d.deviceInfo.globalId === service.txt.info.globalId);

    if (!device) return;

    const { now, signature } = JSON.parse(service.txt.witness) as { now: number; signature: string };

    try {
      await eccrypto.verify(
        Buffer.from(device.secretsInfo.verifyPubkey, 'hex'),
        Buffer.from(`${now}_${device.secretsInfo.version}`, 'utf8'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      return;
    }

    openShardRedistributionReceiver({ service, device });
  };

  scanLan = () => PairedDevices.hasDevices && Bonjour.scan(KeyManagementService);
}

export default new KeyRecoveryWatcher();
