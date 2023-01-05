import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Coin, SafeViewContainer, Skeleton } from '../../components';
import React, { useRef, useState } from 'react';
import { secondaryFontColor, warningColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import AddressRiskIndicator from '../components/AddressRiskIndicator';
import AnimatedNumber from '../../components/AnimatedNumber';
import BalanceChangePreview from '../views/BalanceChangePreview';
import { BioType } from '../../viewmodels/auth/Authentication';
import Currency from '../../viewmodels/settings/Currency';
import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import FuncReview from '../views/FuncReview';
import GasReview from '../views/GasReview';
import HorizontalNftList from '../components/HorizontalNftList';
import HorizontalTokenList from '../components/HorizontalTokenList';
import Image from 'react-native-fast-image';
import InsufficientFee from '../components/InsufficientFee';
import MultiSourceImage from '../../components/MultiSourceImage';
import { PreExecResult } from '../../common/apis/Debank';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';
import { ReactiveScreen } from '../../utils/device';
import RejectApproveButtons from '../components/RejectApproveButtons';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import TxException from '../components/TxException';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import styles from '../styles';

interface Props {
  vm: RawTransactionRequest;
  app: { name: string; icon: string; verified?: boolean };
  onReject?: () => void;
  onApprove?: () => Promise<void>;
  onGasPress?: () => void;
  onDecodedFuncPress?: (decodedFunc: DecodedFunc) => void;
  onBalanceChangePreviewPress?: (previewResult: PreExecResult) => void;
  account: Account;
  bioType?: BioType;
}

const TxReview = observer(
  ({ vm, onReject, onApprove, onGasPress, onDecodedFuncPress, app, account, bioType, onBalanceChangePreviewPress }: Props) => {
    const { network } = vm;
    const { t } = i18n;
    const { textColor, borderColor, secondaryTextColor, thirdTextColor } = Theme;

    const [busy, setBusy] = useState(false);

    const reviewItemStyle = { ...styles.reviewItem, borderColor };
    const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
    const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };
    const safeThemeColor = vm.toAddressRisky ? warningColor : thirdTextColor;

    return (
      <SafeViewContainer>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: 19, fontWeight: '500', color: safeThemeColor, opacity: 0.25 }}>
            {/* {t('modal-review-title')} */}
          </Text>

          <AccountIndicator account={account} />
        </View>

        <View style={reviewItemsContainer}>
          <View style={reviewItemStyle}>
            <Text style={styles.reviewItemTitle}>DApp</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: app.icon }} style={{ width: 19, height: 19, marginEnd: 5, borderRadius: 3 }} />
              <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
                {app.name}
              </Text>
            </View>
          </View>

          <View style={{ ...reviewItemStyle }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-type')}</Text>

            <TouchableOpacity
              disabled={!vm.decodedFunc}
              onPress={() => (vm.decodedFunc ? onDecodedFuncPress?.(vm.decodedFunc) : undefined)}
              style={{ maxWidth: '72%', marginTop: -8, paddingTop: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 180, justifyContent: 'flex-end' }}>
                <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>
                  {t(`tx-type-${vm.type.toLowerCase().replace(' ', '-')}`)}
                </Text>

                {vm.decodedFunc && (
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={15}
                    color={secondaryTextColor}
                    style={{ marginStart: 2, marginEnd: -3, marginBottom: -1 }}
                  />
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', right: 0, bottom: -11.5 }}>
                {vm.decodingFunc && <Skeleton style={{ height: 9, width: 72 }} />}

                {vm.decodedFunc && <Ionicons name="code-slash-outline" size={9} color={vm.network.color} />}
                {vm.decodedFunc && (
                  <Text
                    style={{ fontSize: 9, color: vm.network.color, fontWeight: '600', marginStart: 5, maxWidth: 150 }}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {vm.decodedFunc.func}
                  </Text>
                )}

                {vm.type !== 'Contract Interaction' && vm.type !== 'Transfer' && vm.valueWei.gt(0) && (
                  <Text style={{ fontSize: 9, color: vm.network.color, fontWeight: '600', marginStart: 3 }}>
                    {`-${vm.value} ${vm.network.symbol}`}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {vm.type === 'Transfer' || vm.type === 'Transfer_ERC20' ? (
            <View style={{ ...reviewItemStyle }}>
              <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-amount')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {vm.tokenAmountWei.gt(0) ? (
                  <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>
                    {`${vm.tokenAmount} ${vm.tokenSymbol}`}
                  </Text>
                ) : undefined}

                {vm.tokenAmountWei.gt(0) && vm.valueWei.gt(0) ? (
                  <Text style={{ ...reviewItemValueStyle, marginHorizontal: 6 }}>+</Text>
                ) : undefined}

                {vm.valueWei.gt(0) || vm.tokenAmountWei.eq(0) ? (
                  <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>{`${vm.value} ${vm.network.symbol}`}</Text>
                ) : undefined}
              </View>
            </View>
          ) : undefined}

          {(vm.type === 'Transfer_ERC721' || vm.type === 'Transfer_ERC1155') && (
            <View style={{ ...reviewItemStyle }}>
              <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-amount')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginStart: 0 }}>
                {vm.tokenAmountWei.gt(0) ? (
                  <Text style={{ ...reviewItemValueStyle, maxWidth: '80%' }} numberOfLines={1}>
                    {`${vm.tokenAmount} ${vm.nft?.metadata?.name || ''}`}
                  </Text>
                ) : undefined}

                {vm.nft?.loading && <Skeleton style={{ height: 17, width: 64, marginStart: 8 }} />}

                {vm.nft?.metadata?.image && (
                  <MultiSourceImage
                    uriSources={[vm.nft?.metadata?.image]}
                    style={{ width: 20, height: 20, borderWidth: 0.5, borderColor, borderRadius: 5 }}
                    containerStyle={{ marginStart: 8 }}
                    loadingIconSize={20}
                    borderRadius={3}
                    sourceTypes={[]}
                  />
                )}

                {vm.tokenAmountWei.gt(0) && vm.valueWei.gt(0) ? (
                  <Text style={{ ...reviewItemValueStyle, marginHorizontal: 6 }}>+</Text>
                ) : undefined}

                {vm.valueWei.gt(0) || vm.tokenAmountWei.eq(0) ? (
                  <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>{`${vm.value} ${vm.network.symbol}`}</Text>
                ) : undefined}
              </View>
            </View>
          )}

          {vm.type === 'Approve_ERC20' ? (
            <View style={{ ...reviewItemStyle }}>
              <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-max-approve')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {vm.maxUint256Amount && !app.verified ? (
                  <Ionicons name="warning" color="crimson" size={15} style={{ marginEnd: 4 }} />
                ) : undefined}

                <TextInput
                  numberOfLines={1}
                  defaultValue={vm.maxUint256Amount ? 'Unlimited' : vm.tokenAmount}
                  keyboardType="decimal-pad"
                  onChangeText={(t) => vm.setERC20ApproveAmount(t)}
                  selectTextOnFocus
                  textAlign="right"
                  style={{
                    ...reviewItemValueStyle,
                    maxWidth: 120,
                    color: vm.maxUint256Amount || vm.exceedERC20Balance ? 'crimson' : textColor,
                    marginEnd: 8,
                    minWidth: 52,
                  }}
                />

                {vm.tokenSymbol ? (
                  <Coin symbol={vm.tokenSymbol} size={20} address={vm.tokenAddress} chainId={vm.network.chainId} />
                ) : undefined}
                {vm.tokenSymbol ? (
                  <Text style={{ ...reviewItemValueStyle, marginStart: 4, maxWidth: 64 }} numberOfLines={1}>
                    {vm.tokenSymbol}
                  </Text>
                ) : (
                  <Skeleton style={{ width: 52, height: 17, marginStart: 4 }} />
                )}
              </View>
            </View>
          ) : undefined}

          {vm.type === 'Approve_ERC721' ? (
            <View style={{ ...reviewItemStyle }}>
              <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-type-nft-id')}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Text
                  style={{ ...reviewItemValueStyle, marginEnd: 8, maxWidth: ReactiveScreen.width - 215 }}
                  numberOfLines={1}
                >
                  {vm.erc721?.metadata?.name || `#${vm.erc721?.tokenId}`}
                </Text>

                {vm.erc721?.metadata?.image ? (
                  <MultiSourceImage
                    uriSources={[vm.erc721?.metadata?.image, vm.erc721.metadata.animation_url]}
                    style={{ width: 20, height: 20 }}
                    loadingIconSize={20}
                    borderRadius={3}
                    sourceTypes={[]}
                  />
                ) : (
                  <AntDesign name="star" size={19} color={network.color} />
                )}
              </View>
            </View>
          ) : undefined}

          <View style={{ ...reviewItemStyle }}>
            <Text style={styles.reviewItemTitle}>
              {t(vm.type.startsWith('Approve') ? 'modal-dapp-approve-to' : 'modal-dapp-request-to')}
            </Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}
              onPress={() => openBrowserAsync(`${network.explorer}/address/${vm.toAddress}`)}
            >
              <Text style={{ ...reviewItemValueStyle, color: vm.toAddressRisky ? warningColor : textColor }} numberOfLines={1}>
                {vm.toAddress ? formatAddress(vm.to, 7, 5) : t('modal-dapp-request-deploy-contract')}
              </Text>

              {vm.to ? (
                <Ionicons
                  name="search-outline"
                  size={15}
                  color={vm.toAddressTag?.dangerous ? warningColor : textColor}
                  style={{ marginStart: 6 }}
                />
              ) : undefined}

              {vm.toAddressTag ? (
                <AddressRiskIndicator
                  chainId={network.chainId}
                  address={vm.toAddress}
                  label={vm.toAddressTag?.publicName}
                  risky={vm.toAddressTag?.dangerous}
                  containerStyle={{ position: 'absolute', bottom: -11.5, right: 0 }}
                />
              ) : undefined}
            </TouchableOpacity>
          </View>

          {vm.type === 'Contract Interaction' ? (
            (vm.preExecResult?.receive_nft_list?.length || 0) > 0 ||
            (vm.preExecResult?.send_nft_list?.length || 0) > 0 ||
            (vm.preExecResult?.send_token_list?.length || 0) > 0 ||
            (vm.preExecResult?.receive_token_list?.length || 0) > 0 ? (
              <View style={{ ...reviewItemStyle, alignItems: 'center' }}>
                <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-value')}</Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => onBalanceChangePreviewPress?.(vm.preExecResult!)}
                >
                  {(vm.preExecResult?.send_token_list?.length || 0) > 0 ? (
                    <HorizontalTokenList
                      tokens={vm.preExecResult!.send_token_list!}
                      style={styles.horizontalTokenList}
                      inOut="in"
                      themeColor={vm.network.color}
                    />
                  ) : undefined}

                  {(vm.preExecResult?.send_nft_list?.length || 0) > 0 ? (
                    <HorizontalNftList
                      nfts={vm.preExecResult?.send_nft_list!}
                      style={styles.horizontalTokenList}
                      inOut="in"
                      themeColor={vm.network.color}
                    />
                  ) : undefined}

                  {((vm.preExecResult?.send_token_list?.length || 0) > 0 ||
                    (vm.preExecResult?.send_nft_list?.length || 0) > 0) &&
                  ((vm.preExecResult?.receive_token_list?.length || 0) > 0 ||
                    (vm.preExecResult?.receive_nft_list?.length || 0) > 0) ? (
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      style={{ marginTop: 3, marginHorizontal: 6 }}
                      color={secondaryFontColor}
                    />
                  ) : undefined}

                  {(vm.preExecResult?.receive_token_list?.length || 0) > 0 ? (
                    <HorizontalTokenList
                      tokens={vm.preExecResult!.receive_token_list!}
                      style={styles.horizontalTokenList}
                      inOut="out"
                      themeColor={vm.network.color}
                    />
                  ) : undefined}

                  {(vm.preExecResult?.receive_nft_list?.length || 0) > 0 ? (
                    <HorizontalNftList
                      nfts={vm.preExecResult?.receive_nft_list!}
                      style={styles.horizontalTokenList}
                      inOut="out"
                      themeColor={vm.network.color}
                    />
                  ) : undefined}

                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={15}
                    color={secondaryTextColor}
                    style={{ marginStart: 2, marginEnd: -3, marginBottom: -1 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ ...reviewItemStyle, position: 'relative' }}>
                <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-value')}</Text>

                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ ...reviewItemValueStyle, maxWidth: 150, marginEnd: 4 }} numberOfLines={1}>
                    {`${vm.valueWei.gt(0) ? '-' : ''}${vm.value}`}
                  </Text>

                  <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>
                    {vm.network.symbol}
                  </Text>

                  {vm.preExecuting && (
                    <Skeleton style={{ width: 72, height: 9, position: 'absolute', right: 0, bottom: -11.5 }} />
                  )}
                </View>
              </View>
            )
          ) : undefined}

          <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
            <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {generateNetworkIcon({ ...network, width: 15, style: { marginEnd: 6 } })}

              <Text style={{ ...reviewItemValueStyle, color: network?.color }} numberOfLines={1}>
                {network?.network?.split(' ')?.[0]}
              </Text>

              {vm.loading ? <ActivityIndicator size="small" style={{ marginStart: 5 }} /> : undefined}
            </View>
          </View>
        </View>

        <View
          style={{
            ...reviewItemsContainer,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingStart: 16,
          }}
        >
          <Text style={styles.reviewItemTitle}>{t('modal-review-fee')}</Text>

          <TouchableOpacity
            onPress={onGasPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              paddingVertical: 12,
              paddingEnd: 12,
              justifyContent: 'flex-end',
              width: '75%',
            }}
          >
            <Text style={{ ...styles.reviewItemTitle, fontSize: 15 }}>
              {`(${Currency.tokenToUSD(vm.estimatedRealFee, vm.feeTokenSymbol).toFixed(2)} USD)`}
            </Text>

            <AnimatedNumber
              style={{ ...reviewItemValueStyle, marginStart: 2, marginEnd: 5 }}
              numberOfLines={1}
              timing="linear"
              value={vm.txFee}
              formatter={(val) => val.toFixed(5)}
            />

            <Text style={reviewItemValueStyle}>{vm.feeTokenSymbol}</Text>

            <MaterialIcons
              name="keyboard-arrow-right"
              size={15}
              color={secondaryTextColor}
              style={{ marginStart: 2, marginBottom: -1 }}
            />
          </TouchableOpacity>
        </View>

        {vm.insufficientFee && !vm.loading ? <InsufficientFee /> : undefined}

        {vm.txException ? <TxException exception={vm.txException} /> : undefined}

        <View style={{ flex: 1 }} />

        <RejectApproveButtons
          onReject={onReject}
          themeColor={vm.toAddressRisky ? warningColor : network?.color}
          rejectTitle={t('button-reject')}
          approveTitle={t('modal-review-button-confirm')}
          disabledApprove={!vm.isValidParams || busy}
          swipeConfirm={bioType === 'faceid'}
          approveIcon={
            bioType === 'faceid'
              ? () => <FaceID width={12.5} height={12.5} style={{ marginEnd: 2 }} />
              : bioType === 'fingerprint'
              ? () => <MaterialCommunityIcons name="fingerprint" size={19} color="#fff" />
              : undefined
          }
          onApprove={async () => {
            setBusy(true);
            await onApprove?.();
            setBusy(false);
          }}
        />
      </SafeViewContainer>
    );
  }
);

type DetailType = 'gas' | 'func' | 'balance_preview';

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);
  const [type, setType] = useState<DetailType>('gas');
  const [decodedFunc, setDecodedFunc] = useState<DecodedFunc>();
  const [balancePreview, setBalancePreview] = useState<PreExecResult>();

  const swipeTo = (type: DetailType) => {
    setType(type);
    setTimeout(() => swiper.current?.scrollTo(1), 10);
  };

  const goBack = () => swiper.current?.scrollTo(0);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <TxReview
        {...props}
        onGasPress={() => swipeTo('gas')}
        onBalanceChangePreviewPress={(preview) => {
          setBalancePreview(preview);
          swipeTo('balance_preview');
        }}
        onDecodedFuncPress={(func) => {
          setDecodedFunc(func);
          swipeTo('func');
        }}
      />

      {type === 'gas' && <GasReview onBack={goBack} vm={props.vm} themeColor={props.vm.network.color} />}

      {type === 'func' && <FuncReview onBack={goBack} themeColor={props.vm.network.color} decodedFunc={decodedFunc} />}

      {type === 'balance_preview' && (
        <BalanceChangePreview onBack={goBack} themeColor={props.vm.network.color} preview={balancePreview} />
      )}
    </Swiper>
  );
});