import Database from '../../models/Database';
import EtherscanContract from '../../models/EtherscanContract';
import { INetwork } from '../../common/Networks';
import { getAbi } from '../../common/apis/Etherscan';
import { utils } from 'ethers';

interface IO {
  name: string;
  type: string;
}

export interface AbiItem {
  constant: boolean;
  inputs: IO[];
  name: string;
  outputs: IO[];
  payable: boolean;
  stateMutability: string;
  type: string;
}

class Etherscan {
  get table() {
    return Database.etherscan_contracts;
  }

  async decodeCall(network: INetwork, contractAddress: string, calldata: string) {
    if (!network.etherscanApi) return;

    const existOne = await this.table.findOne({ where: { contract: contractAddress, chainId: network.chainId } });
    let abi: any[] | undefined = existOne?.abi;

    if (!abi) {
      abi = await getAbi(contractAddress, network.chainId, network.etherscanApi);
      if (!abi || !Array.isArray(abi)) return;

      const entity = new EtherscanContract();
      entity.contract = contractAddress;
      entity.chainId = network.chainId;
      entity.abi = abi;
      entity.save();
    }

    const functions: AbiItem[] = abi.filter((i) => i.type === 'function');
    const contract = new utils.Interface(abi);

    for (let func of functions) {
      try {
        const result = (contract.functions[func.name] as any)?.decode(calldata);
        return { func, result };
      } catch (error) {}
    }
  }
}

export default new Etherscan();
