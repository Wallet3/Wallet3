import * as ethers from 'ethers';

import { ISourcifyMetadata, getMetadata } from '../../common/apis/Sourcify';

import Database from '../../models/Database';
import { DecodedFunc } from './EtherscanHub';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import SourcifyMetadata from '../../models/SourcifyItem';

class Sourcify {
  private get table() {
    return Database.sourcify_metadata;
  }

  async decodeCall(network: INetwork, contractAddress: string, calldata: string): Promise<DecodedFunc | null> {
    const existOne = await this.table.findOne({ where: { contract: contractAddress, chainId: network.chainId } });
    let metadata: ISourcifyMetadata | undefined = existOne?.data;

    if (!metadata) {
      metadata = await getMetadata(network.chainId, contractAddress);
      if (!metadata || !metadata.output || !metadata.output.abi) return null;

      const entity = new SourcifyMetadata();
      entity.contract = contractAddress;
      entity.chainId = network.chainId;
      entity.data = metadata;
      entity.lastUpdatedTimestamp = Date.now();
      entity.save();
    }

    const contract = new ethers.Contract(contractAddress, metadata.output.abi);

    for (let func of LINQ.from(contract.interface.functions)) {
      try {
        const params = contract.interface.decodeFunctionData(`${func.key}`, calldata);
        const fullFunc = `${func.value.name}(${func.value.inputs.map((i) => `${i.type} ${i.name}`).join(', ')})`;
        const fullFuncWithoutParamName = `${func.value.name}(${func.value.inputs.map((i) => `${i.type}`).join(',')})`;
        const methodID = calldata.substring(0, 10);
        const comment = metadata?.output?.userdoc?.methods?.[fullFuncWithoutParamName]?.notice;

        return { func: func.value.name, fullFunc, inputs: func.value.inputs, params, methodID, comment };
      } catch (error) {}
    }

    return null;
  }
}

export default new Sourcify();
