import { LogBox, NativeModules } from 'react-native';
import { createCipheriv, createHash, randomBytes } from 'crypto';
import { ethers, utils } from 'ethers';

import Bonjour from '../common/p2p/Bonjour';
import DeviceInfo from 'react-native-device-info';
import LanDiscovery from '../common/p2p/LanDiscovery';
import MessageKeys from '../common/MessageKeys';
import { MultiSignPrimaryServiceType } from '../viewmodels/tss/Constants';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../viewmodels/tss/ShardReceiver';
import { ShardsDistributor } from '../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../common/p2p/TCPClient';
import eccrypto from 'eccrypto';
import { getScreenCornerRadius } from '../utils/hardware';
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
  DeviceInfo.getDeviceName().then(console.log);

  if (DeviceInfo.isTablet()) {
    // LanDiscovery.on('shardsDistributorFound', (service: Service) => {
    //   console.log('tablet', service);
    //   setTimeout(() => PubSub.publish(MessageKeys.openShardReceiver), 3000);
    // });
    // LanDiscovery.scan();
  } else {
    // const root = utils.HDNode.fromMnemonic(mnemonic);
    // console.log(utils.mnemonicToEntropy(mnemonic).substring(2), entropy.toString('hex'), root.privateKey);

    const privkey = Buffer.from('8f7e98cf8f54d9aaedfa24a3d5971b2c80f8e05d2cce799dcbc51884d5f0ed95', 'hex');

    // eccrypto.encrypt(Buffer.from(root.publicKey.substring(2), 'hex'), Buffer.from('abc')).then(async (en) => {
    //   console.log(en.toString());
    //   console.log((await eccrypto.decrypt(Buffer.from(root.privateKey.substring(2), 'hex'), en)).toString('utf8'));
    // });
    const entropy = randomBytes(16);
    const mnemonic = utils.entropyToMnemonic(entropy);
    const hd = utils.HDNode.fromMnemonic(mnemonic);
    const xprivkey = Buffer.from(hd.extendedKey, 'utf8').toString('hex');
    const shares = secretjs.share(xprivkey, 10, 5);
    console.log(hd.extendedKey, xprivkey, shares);

    console.log('combined', secretjs.combine(shares.slice(2, 7)));
    console.log('recovered', Buffer.from(secretjs.combine(shares.slice(2, 7)), 'hex').toString('utf8') === hd.extendedKey);

    if (Buffer.from(secretjs.combine(shares.slice(2, 7)), 'hex').toString('utf8') !== hd.extendedKey) {
      throw new Error('!!! check !!!');
    }
    // console.log(secretjs.share(entropy.toString('hex'), 2, 2));
    // const pri = new KeyDistribution({ mnemonic });
    // pri.start();
    // pri.on('newClient', async (c) => {
    //   pri.approveClient(c);
    //   await pri.distributeSecret(1);
    //   console.log('dist status', pri.status);
    // });

    // setTimeout(
    //   () =>
    //     PubSub.publish(
    //       MessageKeys.openShardsDistribution,
    //       new ShardsDistributor({ mnemonic: utils.entropyToMnemonic(randomBytes(16)) })
    //     ),
    //   3000
    // );

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
