import { AccountBase, SendTxRequest, SendTxResponse } from '../account/AccountBase';
import { BigNumber, BigNumberish, providers, utils } from 'ethers';
import { ERC1271InvalidSignatureResult, EncodedERC1271CallData, Gwei_1, MAX_GWEI_PRICE } from '../../common/Constants';
import { IReactionDisposer, action, autorun, computed, makeObservable, observable, runInAction } from 'mobx';
import { clearPendingENSRequests, isENSDomain } from '../services/ENSResolver';
import {
  estimateGas,
  eth_call_return,
  getCode,
  getGasPrice,
  getMaxPriorityFee,
  getNextBlockBaseFee,
  getRPCUrls,
} from '../../common/RPC';
import { isDomain, resolveDomain } from '../services/DomainResolver';

import AddressTag from '../../models/entities/AddressTag';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../../common/apis/Coingecko';
import { ERC20Token } from '../../models/ERC20';
import { ERC4337Account } from '../account/ERC4337Account';
import ERC4337Queue from './ERC4337Queue';
import { IFungibleToken } from '../../models/Interfaces';
import { INetwork } from '../../common/Networks';
import { ITokenMetadata } from '../../common/tokens';
import { NativeToken } from '../../models/NativeToken';
import { Paymaster } from '../services/Paymaster';
import { createERC4337Client } from '../services/ERC4337';
import { fetchAddressInfo } from '../services/EtherscanPublicTag';
import { getEnsAvatar } from '../../common/ENS';

const Keys = {
  feeToken: (chainId: number | string, account: string) => `${chainId}_${account}_preferred_feeToken`,
};

export class BaseTransaction {
  private toAddressTypeCache = new Map<string, { isContractWallet: boolean; isContractRecipient: boolean }>();
  private timer?: NodeJS.Timer;
  private disposeTxFeeWatcher: IReactionDisposer;

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
  initializing = false;

  valueWei = BigNumber.from(0);
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = 0;
  txException = '';

  feeTokens: IFungibleToken[] | null = null;
  feeToken: IFungibleToken | null = null;
  feeTokenWei = BigNumber.from(0);

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
      valueWei: observable,
      txException: observable,
      txFee: computed,
      nativeFeeWei: computed,
      isValidGas: computed,
      initializing: observable,
      feeToken: observable,
      feeTokens: observable,
      feeTokenWei: observable,
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
    if (this.network.erc4337?.feeTokens) this.initFeeTokens();

    this.isQueuingTx = ERC4337Queue.find(
      (req) => req.tx?.chainId === this.network.chainId && req.tx.from === this.account.address
    )
      ? true
      : false;

    Coingecko.refresh();

    this.disposeTxFeeWatcher = autorun(() => this.estimateFeeToken(this.nativeFeeWei));
  }

  get isERC4337Account() {
    return this.account.isERC4337;
  }

  get isERC4337Network() {
    return this.network.erc4337 ? true : false;
  }

  get isUsingERC4337() {
    return this.isERC4337Account && this.isERC4337Network;
  }

  get isValidAccountAndNetwork() {
    if (!this.isERC4337Account) return true;
    if (!this.isERC4337Network) runInAction(() => (this.txException = 'Current network does not support ERC4337 yet.'));
    return this.isERC4337Network;
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

  get nativeFeeWei() {
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
    return this.feeToken?.address
      ? this.feeTokenWei.gt(this.feeToken.balance || 0)
      : this.valueWei.add(this.nativeFeeWei).gt(this.nativeToken.balance);
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
      return this.feeToken?.address
        ? Number(utils.formatUnits(this.feeTokenWei, this.feeToken.decimals))
        : Number(utils.formatEther(this.nativeFeeWei));
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

  setFeeToken(token: ITokenMetadata) {
    if (!this.feeTokens) return;

    this.feeToken = this.feeTokens.find((t) => t.address === token.address) ?? (this.feeTokens[0] || null);
    this.estimateFeeToken(this.nativeFeeWei);
    AsyncStorage.setItem(Keys.feeToken(this.network.chainId, this.account.address), token.address);
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
    this.disposeTxFeeWatcher();
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

      this.setNonce(nonce.toNumber());

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

  protected async estimateGas(args: { to?: string; data: string; value?: BigNumberish }) {
    runInAction(() => (this.isEstimatingGas = true));

    args.value = BigNumber.from(args.value || 0).eq(0) ? '0x0' : BigNumber.from(args.value).toHexString().replace('0x0', '0x');
    args.data = args.data || '0x';

    const { gas, errorMessage } = this.isUsingERC4337
      ? await this.estimateERC4337Gas(args)
      : await estimateGas(this.network.chainId, { ...args, from: this.account.address });

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  private async estimateERC4337Gas(args: { to?: string; value?: BigNumberish; data: string }) {
    const client = await createERC4337Client(this.network);
    if (!client) return { errorMessage: 'Network is not available' };

    let callData = '0x';

    if (utils.isAddress(args.to || '')) {
      callData = (await client.encodeExecute(args.to!, args.value || 0, args.data)) ?? '0x';
    } else {
      callData =
        (await client.encodeCreate2(
          args.value!,
          utils.formatBytes32String(`${await this.account.getNonce(this.network.chainId)}`),
          args.data
        )) ?? '0x';
    }

    const { callGasLimit, verificationGasLimit, preVerificationGas } = await client.createUnsignedUserOpForCallData(callData, {
      maxFeePerGas: Number.parseInt(`${this.maxGasPrice * Gwei_1}`),
      maxPriorityFeePerGas: Number.parseInt(`${this.maxPriorityPrice * Gwei_1}`),
    });

    const totalGas = BigNumber.from(callGasLimit)
      .add(verificationGasLimit as BigNumberish)
      .add(preVerificationGas as BigNumberish);

    try {
      const initGas = (await (this.account as ERC4337Account).checkActivated(this.network.chainId))
        ? BigNumber.from(5000)
        : BigNumber.from((await client?.estimateCreationGas(await client?.getInitCode())) || 0);

      return { gas: initGas.add(totalGas).toNumber() };
    } catch (error) {
      return { errorMessage: (error as Error).message };
    }
  }

  protected async estimateFeeToken(totalGas: BigNumber) {
    if (totalGas.eq(0)) return;

    const { erc4337, chainId } = this.network;

    if (this.feeToken?.isNative) {
      runInAction(() => (this.feeTokenWei = BigNumber.from(0)));
      return;
    }

    if (!erc4337) return;
    if (!this.feeToken?.address) return;
    if (!erc4337.paymasterAddress) return;

    const paymaster = new Paymaster({
      account: this.account,
      feeToken: this.feeToken,
      paymasterAddress: erc4337.paymasterAddress,
      provider: new providers.JsonRpcProvider(getRPCUrls(chainId)[0]),
      network: this.network,
    });

    const erc20Amount = await paymaster.getTokenAmount(totalGas, this.feeToken.address);
    if (!erc20Amount) return;

    runInAction(() => (this.feeTokenWei = erc20Amount));
    console.log(this.feeToken.symbol, utils.formatUnits(erc20Amount, this.feeToken.decimals));
  }

  protected refreshEIP1559(chainId: number) {
    getNextBlockBaseFee(chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(chainId), 1000 * (chainId === 1 ? 10 : 5));
    });
  }

  protected async initFeeTokens() {
    const tokens: IFungibleToken[] | null =
      this.network.erc4337?.feeTokens?.map(
        (t) => new ERC20Token({ ...t, chainId: this.network.chainId, owner: this.account.address, contract: t.address })
      ) || null;

    tokens?.map((t) => t.getBalance());
    tokens?.unshift(this.nativeToken);

    this.feeTokens = tokens;

    const tokenAddress = await AsyncStorage.getItem(Keys.feeToken(this.network.chainId, this.account.address));
    const userPreferred = this.feeTokens?.find((token) => token.address === tokenAddress) ?? this.nativeToken;

    runInAction(() => (this.feeToken = userPreferred));
  }

  async sendRawTx(args: SendTxRequest, pin?: string): Promise<SendTxResponse> {
    if (this.isQueuingTx && this.isUsingERC4337 && args.tx && utils.isAddress(this.toAddress)) {
      ERC4337Queue.add(args);
      return { success: true };
    }

    return this.account.sendTx(
      {
        ...args,
        network: this.network,
        feeToken: this.feeToken?.isNative === false ? { erc20: this.feeToken, maxAmountInWei: this.feeTokenWei } : undefined,
        gas: {
          maxFeePerGas: Number.parseInt(`${this.maxGasPrice * Gwei_1}`),
          maxPriorityFeePerGas: Number.parseInt(`${this.maxPriorityPrice * Gwei_1}`),
        },
      },
      pin
    );
  }
}
