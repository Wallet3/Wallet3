import {
  Config,
  ContentFilter,
  FilterSubscription,
  StoreQuery,
  WakuMessage,
  connect,
  filterSubscribe,
  filterUnsubscribe,
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

import { EventEmitter } from 'events';
import { Peers } from './Bootstrap';

const Keys = {
  pubSubTopic: (topic: string) => `/waku/2/${topic}/proto`,
  contentTopic: (topic: string) => `/jp.co.chainbow.wallet3/1/${topic}/proto`,
};

export class Node extends EventEmitter {
  private starting = false;
  started = false;

  async start() {
    if (this.starting) return;

    const nodeStarted = await isStarted();
    if (nodeStarted) return;

    this.starting = true;

    try {
      await newNode({ host: '127.0.0.1', port: 61729 } as any);
      await start();

      await Promise.all(Peers.map((peer) => connect(peer).catch(() => console.log(`can't connect ${peer}`))));
      this.started = true;

      onMessage((msg: WakuMessage) => this.emit(`${msg.contentTopic}`, msg));
    } catch (error) {
    } finally {
      this.starting = false;
    }
  }

  get peers() {
    return peers();
  }

  subscribe(topic: string) {
    relaySubscribe(Keys.pubSubTopic(topic));
  }

  unsubscribe(topic: string) {
    relayUnsubscribe(Keys.pubSubTopic(topic));
  }

  filterSubscribe(topic: string, contentTopics: string[]) {
    const filter = new FilterSubscription(
      Keys.pubSubTopic(topic),
      contentTopics.map((t) => new ContentFilter(Keys.contentTopic(t)))
    );

    filterSubscribe(filter);
  }

  filterUnsubscribe(topic: string, contentTopics: string[]) {
    const filter = new FilterSubscription(
      Keys.pubSubTopic(topic),
      contentTopics.map((t) => new ContentFilter(Keys.contentTopic(t)))
    );

    filterUnsubscribe(filter);
  }

  send(topic: string, contentTopic: string, payload: Uint8Array) {
    const msg = new WakuMessage();
    msg.contentTopic = Keys.contentTopic(contentTopic);
    msg.payload = payload;
    msg.timestamp = new Date();
    msg.version = 0;

    return relayPublish(msg, Keys.pubSubTopic(topic));
  }

  stop() {
    return stop();
  }
}
