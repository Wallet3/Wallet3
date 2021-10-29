import { concat, hexDataSlice, hexZeroPad, hexlify } from '@ethersproject/bytes';

import { Base58 } from '@ethersproject/basex';
import { HDNode } from '@ethersproject/hdnode';
import { sha256 } from '@ethersproject/sha2';

function base58check(data: Uint8Array): string {
  return Base58.encode(concat([data, hexDataSlice(sha256(sha256(data)), 0, 4)]));
}

export function xpubkeyFromHDNode(hd: HDNode) {
  return base58check(
    concat([
      '0x0488B21E',
      hexlify(hd.depth),
      hd.parentFingerprint,
      hexZeroPad(hexlify(hd.index), 4),
      hd.chainCode,
      hd.publicKey,
    ])
  );
}
