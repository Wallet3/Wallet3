import * as ethers from 'ethers';

import Database from '../../models/Database';
import EtherscanContract from '../../models/entities/EtherscanContract';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import { getAbi } from '../../common/apis/Etherscan';

export interface DecodedFunc {
  func: string;
  fullFunc: string;
  methodID: string;
  inputs: ethers.utils.ParamType[];
  params: ethers.utils.Result;
  comment?: string;
}

class EtherscanHub {
  private get table() {
    return Database.etherscan_contracts;
  }

  async decodeCall(network: INetwork, contractAddress: string, calldata: string): Promise<DecodedFunc | null> {
    if (!network.etherscanApi) return null;

    const existOne = await this.table.findOne({ where: { contract: contractAddress, chainId: network.chainId } });
    let abi: any[] | undefined = existOne?.abi;

    if (!abi) {
      abi = await getAbi(contractAddress, network.chainId, network.etherscanApi);
      if (!abi || !Array.isArray(abi)) return null;

      const entity = new EtherscanContract();
      entity.contract = contractAddress;
      entity.chainId = network.chainId;
      entity.abi = abi;
      entity.lastUpdatedTimestamp = Date.now();
      entity.save();
    }

    const contract = new ethers.Contract(contractAddress, abi);

    for (let func of LINQ.from(contract.interface.functions)) {
      try {
        const params = contract.interface.decodeFunctionData(`${func.key}`, calldata);
        const fullFunc = `${func.value.name}(${func.value.inputs.map((i) => `${i.type} ${i.name}`).join(', ')})`;

        return { func: func.value.name, fullFunc, inputs: func.value.inputs, params, methodID: calldata.substring(0, 10) };
      } catch (error) {}
    }

    return null;
  }
}

export default new EtherscanHub();
