export type RequestType = 'Transfer' | 'Contract Interaction' | 'Approve' | 'Unknown';

export const Transfer = '0xa9059cbb';
export const Approve = '0x095ea7b3';
export const Methods = new Map<string, RequestType>([
  [Transfer, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve, 'Approve'],
]);
