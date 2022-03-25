export type RequestType =
  | 'Transfer'
  | 'Contract Interaction'
  | 'Approve_ERC20'
  | 'Approve_ERC721'
  | 'Approve_ERC1155'
  | 'Unknown';

export const Transfer_ERC20 = '0xa9059cbb';
export const Transfer_ERC1155 = '0xf242432a';
export const Transfer_ERC721 = '0x23b872dd';

export const Approve_ERC20 = '0x095ea7b3';
export const Approve_ERC721 = Approve_ERC20;
export const Approve_ERC1155 = '0xa22cb465';

export const Methods = new Map<string, RequestType>([
  [Transfer_ERC20, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve_ERC20, 'Approve_ERC20'],
  [Approve_ERC1155, 'Approve_ERC1155'],
]);
