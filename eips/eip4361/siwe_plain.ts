import * as Linking from 'expo-linking';

import { isURL } from '../../utils/url';
import { utils } from 'ethers';

const DOMAIN = 'wants you to sign in with your Ethereum account:';
const ADDRESS = '0x[a-zA-Z0-9]{40}';
const STATEMENT = '(([^\\n]+)\\n)?';
const URI = '(([^:?#]+):)?(([^?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))';
const URI_LINE = 'URI: ';
const VERSION = 'Version: ';
const CHAIN_ID = 'Chain ID: ';
const NONCE = 'Nonce: ';
const DATETIME =
  '([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))';
const ISSUED_AT = 'Issued At: ';
const EXPIRATION_TIME = 'Expiration Time: ';
const NOT_BEFORE = 'Not Before: ';
const REQUEST_ID = 'Request ID: ';
const RESOURCES = 'Resources:';

export class ParsedMessage {
  domain: string | undefined;
  address: string | undefined;
  statement: string | null | undefined;
  uri: string | undefined;
  version: number | undefined;
  chainId: number | undefined;
  nonce: string | undefined;
  issuedAt: string | undefined;
  expirationTime: string | null | undefined;
  notBefore: string | null | undefined;
  requestId: string | null | undefined;

  readonly origin: string | undefined;

  readonly isConsistent: boolean;

  constructor(msg: string, originHost: string) {
    this.origin = originHost;

    const components = msg?.split('\n').filter((i) => i);

    const url = components[0].split(' ')[0]?.toLowerCase();

    this.domain = components[0]?.endsWith(DOMAIN)
      ? Linking.parse(url?.startsWith('https://') ? url : `https://${url}`)?.hostname || ''
      : '';

    this.isConsistent =
      this.domain?.toLowerCase().replace('https://', '') === this.origin?.toLowerCase().replace('https://', '');

    if (!isURL(this.domain)) {
      __DEV__ && console.log(this.domain);
      throw new Error('Invalid domain');
    }

    this.address = utils.isAddress(components[1]) ? components[1] : '';
    if (!this.address) throw new Error('Invalid address');

    this.statement = components[2] || '';

    this.uri = components[3]?.startsWith(URI_LINE) ? components[3].split(': ')[1] : '';
    if (!isURL(this.uri)) throw new Error('Invalid URI');

    this.version = components[4]?.startsWith(VERSION) ? Number(components[4]?.split(': ')[1]) : undefined;
    if (!this.version) throw new Error('Invalid version');

    this.chainId = components[5]?.startsWith(CHAIN_ID) ? Number(components[5]?.split(': ')[1]) : undefined;
    if (!this.chainId) throw new Error('Invalid chainID');

    this.nonce = components[6]?.startsWith(NONCE) ? components[6]?.split(': ')[1] : undefined;
    if (!this.nonce) throw new Error('Invalid nonce');

    this.issuedAt = components[7]?.startsWith(ISSUED_AT) ? components[7]?.split(': ')[1] : undefined;

    this.expirationTime = components[8]?.startsWith(EXPIRATION_TIME) ? components[8]?.split(': ')[1] : undefined;

    this.notBefore = components[9]?.startsWith(NOT_BEFORE) ? components[9]?.split(': ')[1] : undefined;

    this.requestId = components[10]?.startsWith(REQUEST_ID) ? components[10]?.split(': ')[1] : undefined;
  }
}
