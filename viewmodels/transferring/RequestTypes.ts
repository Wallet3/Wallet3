export type RequestType =
  | 'Transfer'
  | 'Contract Interaction'
  | 'Approve_ERC20'
  | 'Approve_ERC721'
  | 'Approve_ERC1155'
  | 'Unknown';

export const Transfer = '0xa9059cbb';
export const Approve_ERC20 = '0x095ea7b3';

export const Methods = new Map<string, RequestType>([
  [Transfer, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve_ERC20, 'Approve_ERC20'],
]);
