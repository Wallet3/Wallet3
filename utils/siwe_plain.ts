import { isURL } from './url';

const DOMAIN = '(([^?#]*)) wants you to sign in with your Ethereum account:';
const ADDRESS = '0x[a-zA-Z0-9]{40}';
const STATEMENT = '(([^\\n]+)\\n)?';
const URI = '(([^:?#]+):)?(([^?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))';
const URI_LINE = `URI: (${URI}?)`;
const VERSION = 'Version: 1';
const CHAIN_ID = 'Chain ID: [0-9]+';
const NONCE = 'Nonce: [a-zA-Z0-9]{8,}';
const DATETIME = `([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))`;
const ISSUED_AT = `Issued At: ${DATETIME}`;
const EXPIRATION_TIME = `Expiration Time: ${DATETIME}?`;
const NOT_BEFORE = `Not Before: ${DATETIME}?`;
const REQUEST_ID = "Request ID: [-._~!$&'()*+,;=:@%a-zA-Z0-9]*?";
const RESOURCES = `Resources:\\n- ${URI}+?`;

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
  resources: string[] | null | undefined;

  constructor(msg: string) {
    const components = msg?.split('\n').filter((i) => i);

    const domains = new RegExp(DOMAIN).exec(components[0])?.filter((i) => i) || [];
    this.domain = domains[domains?.length - 1] || '';
    if (!isURL(this.domain)) throw new Error('Invalid domain');

    this.address = new RegExp(ADDRESS).test(components[1] || '') ? components[1] : undefined;
    if (!this.address) throw new Error('Invalid address');

    this.statement = new RegExp(STATEMENT).test(components[2] || '') ? components[2] : undefined;

    this.uri = new RegExp(URI_LINE).test(components[3] || '') ? components[3]?.split(': ')[1] : undefined;
    if (!isURL(this.uri || '')) throw new Error('Invalid URI');

    this.version = new RegExp(VERSION).test(components[4] || '') ? Number(components[4]?.split(': ')[1]) : undefined;
    if (!this.version) throw new Error('Invalid version');

    this.chainId = Number(new RegExp(CHAIN_ID).test(components[5] || '') ? Number(components[5]?.split(': ')[1]) : undefined);
    if (!this.chainId) throw new Error('Invalid chainID');

    this.nonce = new RegExp(NONCE).test(components[6] || '') ? components[6]?.split(': ')[1] : undefined;
    if (!this.nonce) throw new Error('Invalid nonce');

    this.issuedAt = new RegExp(ISSUED_AT).test(components[7] || '') ? components[7]?.split(': ')[1] : undefined;

    this.expirationTime = new RegExp(EXPIRATION_TIME).test(components[8]) ? components[8]?.split(': ')[1] : undefined;

    this.notBefore = new RegExp(NOT_BEFORE).test(components[9] || '') ? components[9]?.split(': ')[1] : undefined;

    this.requestId = new RegExp(REQUEST_ID).test(components[10] || '') ? components[10]?.split(': ')[1] : undefined;

    this.resources = new RegExp(RESOURCES).test(components[11] || '')
      ? components[11]?.split(': ')[1]?.split?.('\n- ')
      : undefined;
  }
}
