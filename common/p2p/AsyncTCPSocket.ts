import EventEmitter from 'eventemitter3';
import { SocketEvents } from 'react-native-tcp-socket/lib/types/Socket';
import TCP from 'react-native-tcp-socket';

interface Events extends SocketEvents {}

export class AsyncTCPSocket<T> extends EventEmitter<Events> {
  private socket: TCP.TLSSocket | TCP.Socket;

  constructor(socket: TCP.TLSSocket | TCP.Socket) {
    super();
    this.socket = socket;

    this.socket.once('close', (had_error) => this.emit('close', had_error));
  }

  write(data: Buffer | Uint8Array) {
    return new Promise<number>((resolve) => this.socket.write(data, 'binary', (err) => resolve(err ? 0 : data.byteLength)));
  }

  writeString(data: string, encoding: BufferEncoding = 'utf8') {
    return this.write(Buffer.from(data, encoding));
  }

  read() {
    return new Promise<Buffer>((resolve) => this.socket.once('data', (data) => resolve(data as Buffer)));
  }

  readString(encoding: BufferEncoding = 'utf8') {
    return new Promise<string>((resolve) => this.socket.once('data', (data) => resolve(data.toString(encoding))));
  }

  destroy() {
    this.socket.destroy();
  }

  get remoteId() {
    return `${this.socket.remoteAddress}:${this.socket.remotePort}`;
  }

  onClose(listener: (had_error: boolean) => void) {
    this.socket.on('close', listener);
  }

  extra?: T;
}
