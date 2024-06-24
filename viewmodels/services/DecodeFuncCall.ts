import {
  Approve_ERC20,
  SafeTransferFrom_ERC1155,
  SafeTransferFrom_ERC721,
  SafeTransferFrom_WithData_ERC721,
  Transfer_ERC20,
  Transfer_ERC721,
} from '../transferring/RequestTypes';
import { providers, utils } from 'ethers';

import { INetwork } from '../../common/Networks';
import { ReadableInfo } from '../../models/entities/Transaction';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';

const Methods = new Map([
  [Transfer_ERC20, 'sent'],
  [Transfer_ERC721, 'sent'], // Transfer ERC-721
  [SafeTransferFrom_ERC721, 'sent'],
  [SafeTransferFrom_ERC1155, 'sent'], // Transfer ERC-1155
  [SafeTransferFrom_WithData_ERC721, 'sent'],
  [Approve_ERC20, 'approve'],
  ['0x', 'sent'],
]);

export function decodeCallToReadable(
  tx: providers.TransactionRequest,
  opts?: { readableInfo?: ReadableInfo; network?: INetwork }
) {
  const { network, readableInfo } = opts || {};
  const data = tx?.data as string;

  if (!data || data === '0x') {
    return i18n.t('readable-transfer-token', {
      amount: utils.formatEther(tx.value || 0),
      symbol: network?.symbol,
      dest: formatAddress(tx.to || '', 6, 4),
    });
  }

  const method = Methods.get(data?.substring(0, 10) || '');
  switch (method) {
    case 'approve':
      return i18n.t('readable-approve-token', {
        amount: readableInfo?.amount,
        symbol: readableInfo?.symbol,
        dest: formatAddress(readableInfo?.recipient || '', 6, 4),
      });

    case 'sent':
      return i18n.t('readable-transfer-token', {
        amount: readableInfo?.amount,
        symbol: readableInfo?.symbol,
        dest: formatAddress(readableInfo?.recipient || '', 6, 4),
      });
  }

  return i18n.t('home-history-item-type-contract-interaction');
}
