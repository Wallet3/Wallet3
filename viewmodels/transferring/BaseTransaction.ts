import { AccountBase, SendTxRequest, SendTxResponse } from '../account/AccountBase';
import { BigNumber, utils } from 'ethers';
import { ERC1271InvalidSignatureResult, EncodedERC1271CallData, Gwei_1, MAX_GWEI_PRICE } from '../../common/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { clearPendingENSRequests, isENSDomain } from '../services/ENSResolver';
import { estimateGas, eth_call_return, getCode, getGasPrice, getMaxPriorityFee, getNextBlockBaseFee } from '../../common/RPC';
import { isDomain, resolveDomain } from '../services/DomainResolver';

import AddressTag from '../../models/entities/AddressTag';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../../common/apis/Coingecko';
import { ERC20Token } from '../../models/ERC20';
import { ERC4337Account } from '../account/ERC4337Account';
import ERC4337Queue from './ERC4337Queue';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import { NativeToken } from '../../models/NativeToken';
import { createERC4337Client } from '../services/ERC4337';
import { fetchAddressInfo } from '../services/EtherscanPublicTag';
import { getEnsAvatar } from '../../common/ENS';

const Keys = {
  feeToken: (chainId: number | string) => `${chainId}_user_preferred_feeToken`,
};

export class BaseTransaction {
  private toAddressTypeCache = new Map<string, { isContractWallet: boolean; isContractRecipient: boolean }>();
  private timer?: NodeJS.Timer;

  readonly network: INetwork;
  readonly account: AccountBase;
  readonly nativeToken: NativeToken;

  to = '';
  toAddress = '';
  toAddressTag: AddressTag | null = null;
  avatar?: string = '';
  isResolvingAddress = false;
  isContractRecipient = false;
  isContractWallet = false;

  isEstimatingGas = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = 0;
  txException = '';
  initializing = false;
  feeToken: ERC20Token | null = null;

  isQueuingTx = false;

  constructor(args: { network: INetwork; account: AccountBase }, initChainData = true) {
    this.network = args.network;
    this.account = args.account;
    this.nativeToken = new NativeToken({ ...this.network, owner: this.account.address });

    makeObservable(this, {
      to: observable,
      toAddress: observable,
      toAddressTag: observable,
      isValidAddress: computed,
      isResolvingAddress: observable,
      isContractRecipient: observable,
      isContractWallet: observable,
      hasZWSP: computed,
      safeTo: computed,

      isEstimatingGas: observable,
      gasLimit: observable,
      nextBlockBaseFeeWei: observable,
      nextBlockBaseFee: computed,
      maxGasPrice: observable,
      maxPriorityPrice: observable,
      nonce: observable,
      txException: observable,
      txFee: computed,
      txFeeWei: computed,
      isValidGas: computed,
      initializing: observable,
      feeToken: observable,
      feeTokenSymbol: computed,
      insufficientFee: computed,
      toAddressRisky: computed,
      loading: computed,
      isQueuingTx: observable,

      setNonce: action,
      setGasLimit: action,
      setMaxGasPrice: action,
      setPriorityPrice: action,
      setTo: action,
      setToAddress: action,
      setGas: action,
      setFeeToken: action,
      setIsQueuingTx: action,
    });

    this.nativeToken.getBalance();

    if (initChainData) this.initChainData();

    if (this.network.eip1559) this.refreshEIP1559(this.network.chainId);
    if (this.network.feeTokens) this.initFeeToken();

    this.isQueuingTx = ERC4337Queue.find(
      (req) => req.tx?.chainId === this.network.chainId && req.tx.from === this.account.address
    )
      ? true
      : false;

    Coingecko.refresh();
  }

  get isERC4337Account() {
    return this.account.isERC4337;
  }

  get isERC4337Network() {
    return this.network.erc4337 ? true : false;
  }

  get isERC4337Available() {
    return this.isERC4337Account && this.isERC4337Network;
  }

  get safeTo() {
    return this.to.replace(/[\u200B|\u200C|\u200D]/g, '[?]');
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get isEns() {
    return isDomain(this.to);
  }

  get hasZWSP() {
    return /[\u200B|\u200C|\u200D]/.test(this.to);
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get toAddressRisky() {
    return this.toAddressTag?.dangerous ?? false;
  }

  get txFeeWei() {
    try {
      const maxGasPriceWei = BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0));

      return this.network.eip1559
        ? maxGasPriceWei.add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0))).mul(this.gasLimit)
        : maxGasPriceWei.mul(this.gasLimit);
    } catch (error) {
      return BigNumber.from(0);
    }
  }

  get insufficientFee() {
    return this.txFeeWei.gt(this.nativeToken.balance);
  }

  get loading() {
    return this.initializing || this.nativeToken.loading || this.isEstimatingGas;
  }

  get estimatedRealFeeWei() {
    try {
      const maxGasPriceWei = BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0));
      const nextBlockBaseFeeWei = BigNumber.from(this.nextBlockBaseFeeWei);

      return this.network.eip1559
        ? (nextBlockBaseFeeWei.gt(maxGasPriceWei) ? maxGasPriceWei : nextBlockBaseFeeWei)
            .add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0)))
            .mul(this.gasLimit)
        : maxGasPriceWei.mul(this.gasLimit);
    } catch (error) {
      return BigNumber.from(0);
    }
  }

  get txFee() {
    try {
      return Number(utils.formatEther(this.txFeeWei));
    } catch (error) {
      return 0;
    }
  }

  get feeTokenSymbol() {
    return this.feeToken?.symbol ?? this.network.symbol;
  }

  get estimatedRealFee() {
    try {
      return Number(utils.formatEther(this.estimatedRealFeeWei));
    } catch {
      return 0;
    }
  }

  get isValidGas() {
    return this.maxGasPrice >= 0 && this.maxGasPrice >= this.maxPriorityPrice && this.gasLimit >= 0;
  }

  setToAddress(to: string) {
    this.toAddress = utils.getAddress(to);
    this.isResolvingAddress = false;
    this.checkToAddress();
  }

  async setTo(to?: string, avatar?: string) {
    if (to === undefined || to === null) return;

    to = to.trim();
    this.avatar = avatar;

    if (this.to.toLowerCase() === to.toLowerCase()) return;

    this.to = to;
    this.toAddress = '';
    this.txException = '';
    clearPendingENSRequests();

    if (!to) return;

    if (utils.isAddress(to)) {
      this.setToAddress(to);
      return;
    }

    if (this.network.addrPrefix && to.toLowerCase().startsWith(this.network.addrPrefix)) {
      let addr = to.substring(this.network.addrPrefix.length);
      addr = addr.startsWith('0x') ? addr : `0x${addr}`;

      utils.isAddress(addr) ? this.setToAddress(addr) : undefined;
      return;
    }

    this.isResolvingAddress = true;
    const address = await resolveDomain(to, this.network.chainId);

    runInAction(() => (this.isResolvingAddress = false));

    if (!utils.isAddress(address)) return;

    runInAction(() => this.setToAddress(address));

    if (avatar) return;

    if (isENSDomain(to)) {
      const img = await getEnsAvatar(to, address);
      if (!img?.url) return;

      runInAction(() => (this.avatar = img.url));
    }
  }

  setNonce(nonce: string | number) {
    this.nonce = Number(nonce) || this.nonce;
  }

  setGasLimit(limit: string | number) {
    try {
      this.gasLimit = Math.max(Math.min(Number.parseInt(limit as any), 100_000_000), 21000);
    } catch (error) {}
  }

  setMaxGasPrice(gwei: string | number) {
    try {
      gwei = (gwei === '.' ? '0' : gwei) || 0;
      this.maxGasPrice = Math.max(Math.min(Number(gwei), MAX_GWEI_PRICE), 0);
    } catch {}
  }

  setPriorityPrice(gwei: string | number) {
    try {
      gwei = (gwei === '.' ? '0' : gwei) || 0;
      this.maxPriorityPrice = Math.max(Math.min(Number(gwei), MAX_GWEI_PRICE), 0);
    } catch (error) {}
  }

  setFeeToken(token: IToken) {
    if (!this.network.feeTokens) return;
    const feeToken = this.network.feeTokens.find((t) => t.address === token.address) ?? this.network.feeTokens[0];
    this.feeToken = new ERC20Token({ ...this.network, ...feeToken, owner: this.account.address, contract: feeToken.address });
    this.feeToken.getBalance();
    AsyncStorage.setItem(Keys.feeToken(this.network.chainId), this.feeToken.address);
  }

  async setGas(speed: 'rapid' | 'fast' | 'standard') {
    const { eip1559, chainId } = this.network;
    const wei = (await getGasPrice(chainId)) || Gwei_1;
    const basePrice = wei / Gwei_1;

    let priorityPrice = 0;

    if (eip1559) {
      const priWei = (await getMaxPriorityFee(chainId)) || 0;
      priorityPrice = priWei / Gwei_1;
    }

    runInAction(() => {
      switch (speed) {
        case 'rapid':
          this.setMaxGasPrice(basePrice + (this.network.eip1559 ? priorityPrice : 0) + 10);
          if (eip1559) this.setPriorityPrice(priorityPrice + 3);
          break;
        case 'fast':
          this.setMaxGasPrice(Math.max(basePrice, priorityPrice + 1.1));
          if (eip1559) this.setPriorityPrice(priorityPrice + 1);
          break;
        case 'standard':
          this.setMaxGasPrice(Math.max(basePrice - 3, 0.1 + priorityPrice));
          if (eip1559) this.setPriorityPrice(priorityPrice);
          break;
      }
    });
  }

  dispose() {
    clearTimeout(this.timer);
  }

  protected async checkToAddress() {
    const key = `${this.network.chainId}-${this.toAddress}`;
    fetchAddressInfo(this.network.chainId, this.toAddress).then((tag) => runInAction(() => (this.toAddressTag = tag)));

    const cache = this.toAddressTypeCache.get(key);
    if (cache && typeof cache.isContractRecipient === 'boolean') {
      this.isContractWallet = cache.isContractWallet;
      this.isContractRecipient = cache.isContractRecipient;
      return;
    }

    const code = await getCode(this.network.chainId, this.toAddress);
    const isContractRecipient = code !== '0x';
    if (code === '0x') {
      runInAction(() => {
        this.isContractRecipient = false;
        this.isContractWallet = false;
      });
      return;
    }

    const erc1271Result = await eth_call_return(
      this.network.chainId,
      { to: this.toAddress, data: EncodedERC1271CallData },
      true
    );

    const isContractWallet = erc1271Result?.error?.code === 3 || erc1271Result?.result === ERC1271InvalidSignatureResult;

    runInAction(() => {
      this.isContractWallet = isContractWallet;
      this.isContractRecipient = isContractRecipient;
      this.toAddressTypeCache.set(key, { isContractWallet, isContractRecipient });
    });
  }

  setIsQueuingTx(flag: boolean) {
    this.isQueuingTx = flag;
  }

  protected async initChainData() {
    const { chainId, eip1559 } = this.network;

    runInAction(() => (this.initializing = true));

    const [gasPrice, nextBaseFee, priorityFee, nonce] = await Promise.all([
      getGasPrice(chainId),
      getNextBlockBaseFee(chainId),
      getMaxPriorityFee(chainId),
      this.account.getNonce(chainId),
    ]);

    runInAction(() => {
      this.nextBlockBaseFeeWei = Number(nextBaseFee.toFixed(0));

      this.setNonce(nonce);

      if (eip1559) {
        const priFee = (priorityFee || Gwei_1) / Gwei_1 + (chainId === 1 ? 0.2 : 0.05);
        this.setPriorityPrice(priFee);

        const maxPrice = (nextBaseFee || Gwei_1) / Gwei_1 + priFee;
        const suggestedGwei = Number(Math.min(maxPrice * 1.25, maxPrice + 20).toFixed(6));
        this.setMaxGasPrice(suggestedGwei);
      } else {
        this.setMaxGasPrice((gasPrice || Gwei_1) / Gwei_1);
      }

      this.initializing = false;
    });
  }

  protected async estimateGas(args: { from: string; to: string; data: string; value?: string }) {
    runInAction(() => (this.isEstimatingGas = true));

    let gas = 21000;
    let errorMessage = '';

    try {
      if (this.isERC4337Available) {
        const client = await createERC4337Client(this.network.chainId);
        const callData = await client?.encodeExecute(args.to, args.value || 0, args.data);

        const initGas = (await (this.account as ERC4337Account).checkActivated(this.network.chainId))
          ? BigNumber.from(5000)
          : await client?.estimateCreationGas(await client?.getInitCode());

        const estimatedOp = await estimateGas(this.network.chainId, {
          from: this.network.erc4337!.entryPointAddress,
          to: this.account.address,
          data: callData!,
        });

        gas = estimatedOp.gas! + 100_000 + (initGas as BigNumber).toNumber?.() ?? 0;
      } else {
        const estimated = await estimateGas(this.network.chainId, args);
        gas = estimated.gas || gas;
        errorMessage = estimated.errorMessage || '';
      }
    } catch (e) {
      console.error(e);
    } finally {
      runInAction(() => {
        this.isEstimatingGas = false;
        this.setGasLimit(gas || 0);
        this.txException = errorMessage || '';
      });
    }
  }

  protected refreshEIP1559(chainId: number) {
    getNextBlockBaseFee(chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(chainId), 1000 * (chainId === 1 ? 10 : 5));
    });
  }

  protected async initFeeToken() {
    if (!this.network.feeTokens) return;
    const tokenAddress = await AsyncStorage.getItem(Keys.feeToken(this.network.chainId));
    const token = this.network.feeTokens.find((token) => token.address === tokenAddress) ?? this.network.feeTokens[0];
    const feeToken = new ERC20Token({ ...this.network, ...token, owner: this.account.address, contract: token.address });
    feeToken.getBalance();
    runInAction(() => (this.feeToken = feeToken));
  }

  async sendRawTx(args: SendTxRequest, pin?: string): Promise<SendTxResponse> {
    if (this.isQueuingTx && this.isERC4337Available && args.tx) {
      ERC4337Queue.add(args);
      return { success: true };
    }

    return this.account.sendTx(
      {
        ...args,
        network: this.network,
        gas: {
          maxFeePerGas: Number.parseInt(`${this.maxGasPrice * Gwei_1}`),
          maxPriorityFeePerGas: Number.parseInt(`${this.maxPriorityPrice * Gwei_1}`),
        },
      },
      pin
    );
  }
}
