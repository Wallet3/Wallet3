import { Platform } from 'react-native';
import { SendTxRequest } from '../core/Wallet';
import analytics from '@react-native-firebase/analytics';

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
  if (__DEV__) return;

  const type = TxTypes.get(request.tx.data?.toString().substring(0, 10) || '0x') || 'ci';

  analytics().logEvent('send_tx', {
    type,
    chainId: request.tx.chainId,
    to: type === 'ci' ? request.tx.to : undefined,
  });
}

export function logAppReset() {
  if (__DEV__) return;

  analytics().logEvent('app_reset');
}

export function logDeleteWeb2Secret(uid: string) {
  if (__DEV__) return;

  analytics().logEvent('delete_web2_secret', {
    uid,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    timezone: `${-(new Date().getTimezoneOffset() / 60)}`,
  });
}
