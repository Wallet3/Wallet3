import Bonjour from '../../../common/p2p/Bonjour';
import { KeyManagementService } from '../Constants';
import PairedDevices from './PairedDevices';

class LanWatcher {
  scan = () => {
    Bonjour.scan(KeyManagementService);
  };
}

export default new LanWatcher();
