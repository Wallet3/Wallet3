import DeviceInfo from 'react-native-device-info';
import LanDiscovery from '../common/p2p/LanDiscovery';
import { LogBox } from 'react-native';
import { Service } from 'react-native-zeroconf';
import TCP from 'react-native-tcp-socket';
import { TCPClient } from '../common/p2p/TCPClient';
import { TCPServer } from '../common/p2p/TCPServer';
import { randomBytes } from 'crypto';

// import ws, { WebSocketServer } from 'ws';

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
    LanDiscovery.on('resolved', (svc: Service) => {
      console.log('tablet', svc);
      new TCPClient(svc);
    });
    LanDiscovery.scan();
    console.log('im tablet');

    // let count = 10000;
    // const client = TCP.createConnection({ port: 7777, host: '192.168.151.1' }, () => {});

    // const handler = (d: Buffer | string) => {
    //   console.log(`from server: ${d.toString('utf8')}`);

    //   client.write(`${count++}`, 'utf8', (err) => console.log('client written callback', client.bytesWritten, err));

    //   // client.once('data', handler);
    // };

    // client.on('data', handler);
  } else {
    const pri = new TCPServer();
    pri.start();

    // const server = TCP.createServer((c) => {
    //   let count = 0;

    //   const dataHandler = (data: Buffer | string) => {
    //     console.log(`from client: ${data.toString('utf8')}`);
    //     c.write(`${count++}`, 'utf8', (err) => console.log('server written callback', c.bytesWritten, err));
    //     // c.once('data', dataHandler);
    //   };

    //   c.on('data', dataHandler);

    //   c.write(Buffer.from(`${++count}`, 'utf8'), 'binary', () => console.log('server written', c.bytesWritten));
    // });
    // server.listen({ port: 7777, host: '0.0.0.0' });
  }
}
