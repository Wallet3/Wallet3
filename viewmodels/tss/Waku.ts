import {
  Config,
  ContentFilter,
  FilterSubscription,
  StoreQuery,
  WakuMessage,
  connect,
  defaultPubsubTopic,
  filterSubscribe,
  isStarted,
  listenAddresses,
  newNode,
  onMessage,
  peerCnt,
  peerID,
  peers,
  relayEnoughPeers,
  relayPublish,
  relaySubscribe,
  relayUnsubscribe,
  start,
  stop,
  storeQuery,
} from '@waku/react-native';

export async function initWaku() {
  const nodeStarted = await isStarted();

  if (!nodeStarted) {
    await newNode({ host: '127.0.0.1', port: 60000 } as any);
    await start();
  }

  console.log('listen: ', await listenAddresses());

  await relaySubscribe("/waku/2/wallet3/proto");

  onMessage((event) => {
    console.log(`Message received: ${event.wakuMessage.timestamp} - payload:[${event.wakuMessage.payload}]`);
    console.log('Message received: ', event);
  });

  console.log('enoughPeers?', await relayEnoughPeers());
  console.log('addresses', await listenAddresses());
  console.log('connecting...');

  try {
    await connect(
      '/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/30303/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm',
      5000
    );
  } catch (err) {
    console.log('Could not connect to peers');
  }

  try {
    await connect(
      '/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/30303/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ',
      5000
    );
  } catch (err) {
    console.log('Could not connect to peers');
  }

  console.log('connected!');

  console.log('PeerCNT', await peerCnt());
  console.log('Peers', await peers());

  let msg = new WakuMessage();
  msg.contentTopic = 'ABC';
  msg.payload = new Uint8Array([1, 2, 3, 4, 5]);
  msg.timestamp = new Date();
  msg.version = 0;

  let messageID = await relayPublish(msg);

  console.log('The messageID', messageID);

  //   console.log('Retrieving messages from store node');
  //   const query = new StoreQuery();
  //   query.contentFilters.push(new ContentFilter('test-rramos'));
  //   const queryResult = await storeQuery(query, '16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm');
  //   console.log(queryResult);
}
