import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

interface WCClientMeta {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

interface IRawWcSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta?: WCClientMeta;
  peerId: string;
  peerMeta?: WCClientMeta;
  handshakeId: number;
  handshakeTopic: string;
  lastUsedTimestamp?: number;
  userChainId?: number;
}

@Entity({ name: 'wcsession_v1' })
export default class WCSession_v1 extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'simple-json' })
  session!: IRawWcSession;

  @Column()
  userChainId!: number;

  @Column()
  lastUsedTimestamp!: number;
}
