import { createCipheriv, createHash, randomBytes } from 'crypto';
import { ethers, utils } from 'ethers';

import DeviceInfo from 'react-native-device-info';
import { LogBox } from 'react-native';
import MessageKeys from '../common/MessageKeys';
import { MultiSignPrimaryServiceType } from '../viewmodels/tss/Constants';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../viewmodels/tss/ShardReceiver';
import { ShardsDistributor } from '../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../common/p2p/TCPClient';
import ZeroConfiguration from '../common/p2p/ZeroConfiguration';
import eccrypto from 'eccrypto';
import { getScreenCornerRadius } from '../utils/ios';
import iosDevice from 'ios-device-list';
import quickcrypto from 'react-native-quick-crypto';
import secretjs from 'secrets.js-grempe';

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
  'socketDidDisconnect with nil clientDelegate for',
]);

if (__DEV__) {
  if (DeviceInfo.isTablet()) {
    ZeroConfiguration.on('resolved', (service: Service) => {
      console.log('tablet', service);

      new ShardReceiver(service);
    });

    ZeroConfiguration.scan(MultiSignPrimaryServiceType);
  } else {
    // const root = utils.HDNode.fromMnemonic(mnemonic);
    // console.log(utils.mnemonicToEntropy(mnemonic).substring(2), entropy.toString('hex'), root.privateKey);

    // eccrypto.encrypt(Buffer.from(root.publicKey.substring(2), 'hex'), Buffer.from('abc')).then(async (en) => {
    //   console.log(en.toString());
    //   console.log((await eccrypto.decrypt(Buffer.from(root.privateKey.substring(2), 'hex'), en)).toString('utf8'));
    // });
    // const entropy = randomBytes(16);
    // const mnemonic = utils.entropyToMnemonic(entropy);
    // console.log(secretjs.share(entropy.toString('hex'), 2, 2));
    // const pri = new KeyDistribution({ mnemonic });
    // pri.start();
    // pri.on('newClient', async (c) => {
    //   pri.approveClient(c);
    //   await pri.distributeSecret(1);
    //   console.log('dist status', pri.status);
    // });

    setTimeout(() => PubSub.publish(MessageKeys.openShardsDistribution), 3000);

    // const aes128cfb = createCipheriv('aes-128-cfb', randomBytes(16), randomBytes(16));
    // aes128cfb.write('abc', 'utf8');
    // .then(() => {
    //   LanDiscovery.publishService(MultiSignPrimaryServiceType, 'key-distribution', pri.port!, {
    //     role: 'primary',
    //     func: 'key-distribution',
    //   });
    // });
  }
}
