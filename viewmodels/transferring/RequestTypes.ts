export type RequestType =
  | 'Transfer'
  | 'Contract Interaction'
  | 'Approve_ERC20'
  | 'Approve_ERC721'
  | 'Approve_ERC1155'
  | 'Unknown';

export const Transfer_ERC20 = '0xa9059cbb';
export const Approve_ERC20 = '0x095ea7b3';
export const Approve_ERC721 = Approve_ERC20;
export const ERC1155_ApprovalForAll = '0xa22cb465';

export const Methods = new Map<string, RequestType>([
  [Transfer_ERC20, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve_ERC20, 'Approve_ERC20'],
  [ERC1155_ApprovalForAll, 'Approve_ERC1155'],
]);
