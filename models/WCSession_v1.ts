import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface WCClientMeta {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

export interface IRawWcSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta: WCClientMeta | null;
  peerId: string;
  peerMeta: WCClientMeta | null;
  handshakeId: number;
  handshakeTopic: string;
}

export interface WCSessionRequestRequest {
  id: number;
  jsonrpc: '2.0';
  method: 'wc_sessionRequest';
  params: [
    {
      peerId: string;
      peerMeta: WCClientMeta;
      chainId?: number | null;
    }
  ];
}

export interface WCCallRequestRequest {
  id: number;
  jsonrpc: '2.0';
  method: 'eth_sendTransaction' | 'eth_signTransaction' | 'eth_sign' | 'personal_sign' | 'eth_signTypedData';
  params: any;
}

export interface WCCallRequest_eth_sendTransaction {
  from: string;
  to: string;
  gasPrice: string;
  gas: string;
  gasLimit?: string;
  value: string;
  nonce: string;
  data: string;
}

@Entity({ name: 'wcsessionv1_1' })
export default class WCSession_v1 extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'simple-json' })
  session!: IRawWcSession;

  @Column({ type: 'simple-json' })
  chains!: number[];

  @Column({ type: 'simple-json' })
  accounts!: string[];

  @Column()
  lastUsedTimestamp!: number;

  @Column({ default: false })
  isMobile!: boolean;

  @Column({ nullable: true })
  hostname!: string;

  @Column({ default: '0x1' })
  lastUsedChainId!: string;

  @Column()
  lastUsedAccount!: string;
}
