import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { SessionTypes } from '@walletconnect/web3wallet/node_modules/@walletconnect/types';

interface SessionStruct {
  topic: string;

  expiry: number;
  acknowledged: boolean;
  controller: string;
  namespaces: { [key: string]: any };
  requiredNamespaces: { [key: string]: any };
  self: {
    publicKey: string;
    metadata: { name: string; description: string; url: string; icons: string[] };
  };
  peer: {
    publicKey: string;
    metadata: { name: string; description: string; url: string; icons: string[] };
  };
}

@Entity({ name: __DEV__ ? 'wcv2_session_dev' : 'wcv2_session' })
export default class WCV2_Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'simple-json' })
  session!: SessionStruct;

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
