import { makeObservable, observable, runInAction } from 'mobx';

import EventEmitter from 'eventemitter3';
import { SocketEvents } from 'react-native-tcp-socket/lib/types/Socket';
import TCP from 'react-native-tcp-socket';

interface Events extends SocketEvents {
  ready: () => void;
}

export class AsyncTCPSocket extends EventEmitter<Events> {
  private awaits = new Set<Function>();

  readonly raw: TCP.TLSSocket | TCP.Socket;

  closed = false;

  constructor(socket: TCP.TLSSocket | TCP.Socket) {
    super();

    this.raw = socket;
    makeObservable(this, { closed: observable });

    this.raw.once('close', (had_error) => {
      this.emit('close', had_error);
      runInAction(() => (this.closed = true));

      for (let cancel of this.awaits) {
        cancel();
      }
    });
  }

  write(data: Buffer | Uint8Array) {
    if (this.closed) return 0;

    try {
      return new Promise<number>((resolve, reject) => {
        this.awaits.add(reject);

        this.raw.write(data, 'binary', (err) => {
          this.awaits.delete(reject);

          err ? console.error(err) : undefined;
          resolve(err ? 0 : data.byteLength);
        });
      });
    } catch (error) {
      return 0;
    }
  }

  writeString(data: string, encoding: BufferEncoding = 'utf8') {
    return this.write(Buffer.from(data, encoding));
  }

  read() {
    if (this.closed) return;

    return new Promise<Buffer>((resolve, reject) => {
      this.awaits.add(reject);

      this.raw.once('data', (data) => {
        this.awaits.delete(reject);

        resolve(data as Buffer);
      });
    });
  }

  async readString(encoding: BufferEncoding = 'utf8') {
    if (this.closed) return;

    try {
      return (await this.read())?.toString(encoding);
    } catch (error) {}
    // return new Promise<string>((resolve) => this.raw.once('data', (data) => resolve(data.toString(encoding))));
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
