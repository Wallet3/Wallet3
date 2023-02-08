import DeviceInfo from 'react-native-device-info';
import { KeyDistribution } from '../viewmodels/tss/KeyDistribution';
import LanDiscovery from '../common/p2p/LanDiscovery';
import { LogBox } from 'react-native';
import { MultiSignPrimaryServiceType } from '../common/p2p/Constants';
import { Service } from 'react-native-zeroconf';
import { TCPClient } from '../common/p2p/TCPClient';
import { TCPServer } from '../common/p2p/TCPServer';

LogBox.ignoreLogs([
  'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component is no longer necessary. You can now directly use the ref instead. This method will be removed in a future release.',
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
  'Face ID is not available in Expo Go. You can use it in a standalone Expo app by providing `NSFaceIDUsageDescription`.',
  '[mobx] Out of bounds read',
  'Webview Process Terminated',
  'source.uri should not be an empty string',
  'check out new Gestures system',
  'Could not find image file',
  'Require cycle:',
  'This may lead to deadlocks',
  "Module ReactNative requires main queue setup since it overrides `init` but doesn't implement `requiresMainQueueSetup`",
]);

if (__DEV__) {
  if (DeviceInfo.isTablet()) {
    LanDiscovery.on('resolved', (service: Service) => {
      console.log('tablet', service);
      new TCPClient({ service });
    });

    LanDiscovery.scan(MultiSignPrimaryServiceType);
  } else {
    const pri = new KeyDistribution();
    pri.start().then(() => {
      LanDiscovery.publishService(MultiSignPrimaryServiceType, 'key-distribution', pri.port!, {
        role: 'primary',
        func: 'key-distribution',
      });
    });
  }
}
