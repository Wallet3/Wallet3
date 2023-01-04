export type RequestType =
  | 'Transfer'
  | 'Contract Interaction'
  | 'Approve_ERC20'
  | 'Approve_ERC721'
  | 'Approve_ERC1155'
  | 'Revoke_ERC1155'
  | 'Unknown';

export const Transfer_ERC20 = '0xa9059cbb';
export const Transfer_ERC721 = '0x23b872dd'; // transferFrom(address from, address to, uint256 tokenId)
export const SafeTransferFrom_721 = '0x42842e0e'; // safeTransferFrom(address from, address to, uint256 tokenId)
export const SafeTransferFrom_WithData_721 = '0xb88d4fde'; // safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)
export const SafeTransferFrom_1155 = '0xf242432a'; //safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)
export const SafeBatchTransferFrom_1155 = '0x2eb2c2d6'; //safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)

export const Approve_ERC20 = '0x095ea7b3';
export const Approve_ERC721 = Approve_ERC20;
export const ApprovalForAll = '0xa22cb465';

export const Methods = new Map<string, RequestType>([
  [Transfer_ERC20, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve_ERC20, 'Approve_ERC20'],
  [ApprovalForAll, 'Approve_ERC1155'],
]);
