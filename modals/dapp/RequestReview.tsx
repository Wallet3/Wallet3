import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Coin, SafeViewContainer, Skeleton } from '../../components';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import AnimateNumber from 'react-native-animate-number';
import { BioType } from '../../viewmodels/Authentication';
import Currency from '../../viewmodels/settings/Currency';
import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import FuncReview from '../views/FuncReview';
import GasReview from '../views/GasReview';
import Image from 'react-native-fast-image';
import InsufficientFee from '../components/InsufficientFee';
import MultiSourceImage from '../../components/MultiSourceImage';
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
  account: Account;
  bioType?: BioType;
}

const TxReview = observer(({ vm, onReject, onApprove, onGasPress, onDecodedFuncPress, app, account, bioType }: Props) => {
  const { network } = vm;
  const { t } = i18n;
  const { textColor, borderColor, secondaryTextColor } = Theme;

  const [busy, setBusy] = useState(false);

  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  return (
    <SafeViewContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingEnd: 4 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              {vm.decodedFunc && <Ionicons name="code-slash-outline" size={9} color={vm.network.color} />}
              {vm.decodedFunc && (
                <Text style={{ fontSize: 9, color: vm.network.color, fontWeight: '600', marginStart: 5 }}>
                  {vm.decodedFunc.func}
                </Text>
              )}

              {vm.type !== 'Contract Interaction' && vm.type !== 'Transfer' && vm.valueWei.gt(0) && (
                <Text style={{ fontSize: 9, color: vm.network.color, fontWeight: '600', marginStart: 3 }}>
                  {`+ ${vm.value} ${vm.network.symbol}`}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {vm.type === 'Transfer' ? (
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
                <Skeleton style={{ width: 52, height: 19, marginStart: 4 }} />
              )}
            </View>
          </View>
        ) : undefined}

        {vm.type === 'Approve_ERC721' ? (
          <View style={{ ...reviewItemStyle }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-type-nft-id')}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ ...reviewItemValueStyle, marginEnd: 8, maxWidth: ReactiveScreen.width - 215 }} numberOfLines={1}>
                {vm.erc721?.metadata?.title || vm.erc721?.tokenId}
              </Text>

              <MultiSourceImage
                uriSources={vm.erc721?.metadata?.images || []}
                style={{ width: 20, height: 20 }}
                borderRadius={3}
                sourceTypes={vm.erc721?.metadata?.types || []}
              />
            </View>
          </View>
        ) : undefined}

        <View style={{ ...reviewItemStyle }}>
          <Text style={styles.reviewItemTitle}>
            {t(vm.type.startsWith('Approve') ? 'modal-dapp-approve-to' : 'modal-dapp-request-to')}
          </Text>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => openBrowserAsync(`${network.explorer}/address/${vm.toAddress}`)}
          >
            <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>
              {vm.toAddress ? formatAddress(vm.to, 9, 5) : t('modal-dapp-request-deploy-contract')}
            </Text>

            {vm.to ? <Ionicons name="search-outline" size={15} color={textColor} style={{ marginStart: 6 }} /> : undefined}
          </TouchableOpacity>
        </View>

        {vm.type === 'Contract Interaction' ? (
          <View style={{ ...reviewItemStyle }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-value')}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ ...reviewItemValueStyle, maxWidth: 150, marginEnd: 4 }} numberOfLines={1}>
                {vm.value}
              </Text>

              <Text style={{ ...reviewItemValueStyle }} numberOfLines={1}>
                {vm.network.symbol}
              </Text>
            </View>
          </View>
        ) : undefined}

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ ...network, width: 15, style: { marginEnd: 6 } })}

            <Text style={{ ...reviewItemValueStyle, color: network?.color }} numberOfLines={1}>
              {network?.network?.split(' ')?.[0]}
            </Text>

            {vm.initializing ? <ActivityIndicator size="small" style={{ marginStart: 5 }} /> : undefined}
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

          <AnimateNumber
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

      {vm.insufficientFee ? <InsufficientFee /> : undefined}

      {vm.txException ? <TxException exception={vm.txException} /> : undefined}

      <View style={{ flex: 1 }} />

      <RejectApproveButtons
        onReject={onReject}
        themeColor={network?.color}
        rejectTitle={t('button-reject')}
        approveTitle={t(bioType === 'faceid' ? 'modal-review-button-confirm' : 'button-send')}
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
});

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);
  const [type, setType] = useState<'gas' | 'func'>('gas');
  const [decodedFunc, setDecodedFunc] = useState<DecodedFunc>();

  const swipeTo = (type: 'gas' | 'func') => {
    setType(type);
    setTimeout(() => swiper.current?.scrollTo(1), 10);
  };

  const goBack = () => swiper.current?.scrollTo(0);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <TxReview
        {...props}
        onGasPress={() => swipeTo('gas')}
        onDecodedFuncPress={(func) => {
          setDecodedFunc(func);
          swipeTo('func');
        }}
      />

      {type === 'gas' && <GasReview onBack={goBack} vm={props.vm} themeColor={props.vm.network.color} />}

      {type === 'func' && <FuncReview onBack={goBack} themeColor={props.vm.network.color} decodedFunc={decodedFunc} />}
    </Swiper>
  );
});
