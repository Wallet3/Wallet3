import { makeObservable, observable, runInAction } from 'mobx';

import EventEmitter from 'eventemitter3';
import { SocketEvents } from 'react-native-tcp-socket/lib/types/Socket';
import TCP from 'react-native-tcp-socket';

interface Events extends SocketEvents {
  ready: () => void;
}

export class AsyncTCPSocket extends EventEmitter<Events> {
  readonly raw: TCP.TLSSocket | TCP.Socket;

  closed = false;

  constructor(socket: TCP.TLSSocket | TCP.Socket) {
    super();

    this.raw = socket;
    makeObservable(this, { closed: observable });

    this.raw.once('close', (had_error) => {
      this.emit('close', had_error);
      runInAction(() => (this.closed = true));
    });
  }

  write(data: Buffer | Uint8Array) {
    return new Promise<number>((resolve) =>
      this.raw.write(data, 'binary', (err) => {
        err ? console.error(err) : undefined;
        resolve(err ? 0 : data.byteLength);
      })
    );
  }

  writeString(data: string, encoding: BufferEncoding = 'utf8') {
    return this.write(Buffer.from(data, encoding));
  }

  read() {
    return new Promise<Buffer>((resolve) => this.raw.once('data', (data) => resolve(data as Buffer)));
  }

  readString(encoding: BufferEncoding = 'utf8') {
    return new Promise<string>((resolve) => this.raw.once('data', (data) => resolve(data.toString(encoding))));
  }

  destroy() {
    this.raw.destroy();
    this.raw.removeAllListeners();
    this.removeAllListeners();
  }

  get remoteIP() {
    return `${this.raw.remoteAddress}:${this.raw.remotePort}`;
  }
}
