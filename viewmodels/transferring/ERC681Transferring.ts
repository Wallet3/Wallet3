import { computed, makeObservable, runInAction } from 'mobx';

import App from '../App';
import { ERC20Token } from '../../models/ERC20';
import { INetwork } from '../../common/Networks';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import { TokenTransferring } from './TokenTransferring';
import { utils } from 'ethers';

export interface ERC681 {
  chain_id?: string;
  function_name?: string;
  parameters?: { address?: string; uint256?: string; value?: string };
  scheme?: string;
  target_address: string;
}

export class ERC681Transferring extends TokenTransferring {
  get isValidAmount() {
    return this.amountWei.gte(0) && this.amountWei.lte(this.token.balance!) && !this.token.loading;
  }

  constructor({ defaultNetwork, erc681 }: { defaultNetwork: INetwork; erc681: ERC681 }) {
    const account = App.currentWallet!.currentAccount!;

    const network = Networks.all.find((n) => n.chainId === Number(erc681.chain_id)) ?? defaultNetwork;
    const token = (
      erc681.function_name === 'transfer' && utils.isAddress(erc681.target_address)
        ? new ERC20Token({ contract: erc681.target_address, owner: account.address, chainId: network.chainId })
        : new NativeToken({ owner: account.address, chainId: network.chainId, symbol: network.symbol })
    ) as ERC20Token;

    super({ targetNetwork: network, defaultToken: token, autoSetToken: false });

    makeObservable(this, {});

    token?.getDecimals?.();
    token?.getSymbol?.();
    token?.getBalance?.(erc681.function_name ? true : false);

    this.initERC681(erc681);
  }

  private async initERC681(erc681: ERC681) {
    if (erc681.function_name === 'transfer') {
      await this.setTo(erc681.parameters?.address);

      (this.token as ERC20Token)?.getDecimals?.()?.then((decimals) => {
        try {
          const amount = utils.formatUnits(
            Number(erc681.parameters?.uint256 || '0').toLocaleString('fullwide', { useGrouping: false }),
            decimals
          );

          runInAction(() => {
            this.setAmount(amount.replace(/\.0$/g, ''));
            this.estimateGas();
          });
        } catch (error) {}
      });
    } else {
      try {
        this.setTo(erc681.target_address);

        const amount = utils.formatEther(
          Number(erc681.parameters?.value ?? '0').toLocaleString('fullwide', { useGrouping: false })
        );

        this.setAmount(amount.replace(/\.0$/g, ''));
        this.estimateGas();
      } catch (error) {}
    }
  }
}
