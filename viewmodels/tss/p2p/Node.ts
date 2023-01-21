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

interface IConstruct {
  nodeKey: string;
}

export class Node {
  private starting = false;

  readonly nodeKey: string;

  constructor({ nodeKey }: IConstruct) {
    this.nodeKey = nodeKey;
  }

  async start() {
    if (this.starting) return;

    const nodeStarted = await isStarted();
    if (nodeStarted) return;

    this.starting = true;

    try {
      await newNode({ host: '127.0.0.1', port: 61729, relay: false, filter: false, nodeKey: this.nodeKey } as any);
      await start();
    } catch (error) {
    } finally {
      this.starting = false;
    }
  }

  stop() {
    return stop();
  }
}
