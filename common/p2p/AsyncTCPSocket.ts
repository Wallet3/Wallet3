import EventEmitter from 'events';
import TCP from 'react-native-tcp-socket';

export class AsyncTCPSocket extends EventEmitter {
  private socket: TCP.TLSSocket | TCP.Socket;

  constructor(socket: TCP.TLSSocket | TCP.Socket) {
    super();
    this.socket = socket;
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
}
