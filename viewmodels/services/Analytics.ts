import Networks from '../core/Networks';
import { Platform } from 'react-native';
import { SendTxRequest } from '../core/Wallet';
import { SupportedWCSchemes } from '../hubs/LinkHub';
import Transaction from '../../models/Transaction';
import analytics from '@react-native-firebase/analytics';
import { utils } from 'ethers';

const Transfer_ERC20 = '0xa9059cbb';
const Transfer_ERC1155 = '0xf242432a';
const Transfer_ERC721 = '0x23b872dd';

const Approve_ERC20 = '0x095ea7b3';
const Approve_ERC721 = Approve_ERC20;
const Approve_ERC1155 = '0xa22cb465';

const TxTypes = new Map([
  ['0x', 't_n'],
  [Transfer_ERC20, 't_20'],
  [Transfer_ERC1155, 't_1155'],
  [Transfer_ERC721, 't_721'],
  [Approve_ERC20, 'ap_20'],
  [Approve_ERC1155, 'ap_1155'],
]);

export function logSendTx(request: SendTxRequest) {
  if (Networks.find(request.tx.chainId || 0)?.testnet) return;

  const type = TxTypes.get(request.tx.data?.toString().substring(0, 10) || '0x') || 'ci';

  log('send_tx', {
    type,
    chainId: request.tx.chainId,
    to: type === 'ci' ? request.tx.to : undefined,
  });
}

export function logTxConfirmed(tx: Transaction) {
  log('tx_confirmed', { hash: tx.hash, status: tx.status, chainId: tx.chainId });
}

export function logAppReset() {
  log('wallet_reset');
}

export function logSignWithWeb2() {
  log('sign_web2');
}

export function logDeleteWeb2Secret(uid: string) {
  log('delete_web2_secret', {
    uid,
    timestamp: new Date().toISOString(),
    timezone: `${-(new Date().getTimezoneOffset() / 60)}`,
  });
}

export function logCreateWallet() {
  log('new_wallet');
}

export function logAddToken(args: { chainId: number; token: string }) {
  log('add_token', { ...args });
}

export function logWalletLocked() {
  log('wallet_locked');
}

export function logAppReview() {
  log('store_review');
}

export function logAddBookmark() {
  log('bookmark_added');
}

export function logRemoveBookmark() {
  log('bookmark_removed');
}

export function logQRScanned(data: string) {
  let type = '';

  if (utils.isAddress(data)) {
    type = 'address';
  } else if (data.startsWith('http')) {
    type = 'url';
  } else if (data.startsWith('wc:') || SupportedWCSchemes.find((s) => data.startsWith(s))) {
    type = 'walletconnect';
  }

  log('qr_scanned', { type });
}

export function logEthSign(type?: string) {
  log('eth_sign', { type });
}

export function logWalletConnectRequest(args: { chainId: number; method: string }) {
  log('wc_request', args);
}

export function logInpageRequest(args: { chainId: number; method: string } | any) {
  log('inpage_request', args);
}

export function logBackup() {
  log('backup_secret');
}

function log(name: string, args: any = {}) {
  if (__DEV__) return;

  analytics().logEvent(name, { ...args, os: Platform.OS });
}
