import { sendTransaction } from '../common/RPC';

class TxHub {
  async broadcastTx(chainId: number, tx: string): Promise<string> {
    const { result } = await sendTransaction(chainId, tx);
    return result!;
  }
}

export default new TxHub();
