import { Button, Coin, Placeholder, SafeViewContainer } from '../../components';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { verifiedColor, warningColor } from '../../constants/styles';

import AddToSendingQueue from '../components/AddToSendingQueue';
import AddressRiskIndicator from '../components/AddressRiskIndicator';
import AnimatedNumber from '../../components/AnimatedNumber';
import BackButton from '../components/BackButton';
import BioAuthSendButton from '../components/BioAuthSendButton';
import { BioType } from '../../viewmodels/auth/Authentication';
import Currency from '../../viewmodels/settings/Currency';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import GasFeeReviewItem from '../components/GasFeeReviewItem';
import GasReview from './GasReview';
import Image from 'react-native-fast-image';
import InsufficientFee from '../components/InsufficientFee';
import { ReactiveScreen } from '../../utils/device';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import TxException from '../components/TxException';
import UserTxData from './UserTxData';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  onBack?: () => void;
  onSend?: () => Promise<void>;
  onGasPress?: () => void;
  disableBack?: boolean;
  vm: TokenTransferring;
  txDataEditable?: boolean;
  onEditDataPress?: () => void;
}

const ReviewView = observer(({ vm, onBack, onGasPress, onSend, disableBack, txDataEditable, onEditDataPress }: Props) => {
  const { t } = i18n;
  const [busy, setBusy] = useState(false);
  const { borderColor, textColor, secondaryTextColor, tintColor } = Theme;

  const send = async () => {
    setBusy(true);
    await onSend?.();
    setBusy(false);
  };

  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        {disableBack ? <View /> : <BackButton onPress={onBack} color={vm.transferToRisky ? warningColor : vm.network.color} />}

        <Text style={styles.navTitle}>{t('modal-review-title')}</Text>
      </View>

      <View style={reviewItemsContainer}>
        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-send')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text
              style={{ ...reviewItemValueStyle, marginEnd: 8, maxWidth: ReactiveScreen.width - 215 }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {vm.amount}
            </Text>

            <Coin
              address={vm.token.address}
              chainId={vm.network.chainId}
              symbol={vm.token!.symbol}
              forceRefresh
              iconUrl={vm.token?.logoURI}
            />

            <Text style={{ ...reviewItemValueStyle, marginStart: 8 }}>{vm.token.symbol}</Text>
          </View>
        </View>

        <View style={reviewItemStyle}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-to')}</Text>

          <View style={{ flexDirection: 'row', maxWidth: '72%', alignItems: 'center', position: 'relative' }}>
            {(vm.hasZWSP || vm.isContractRecipient) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', end: 0, bottom: -11.5 }}>
                <Ionicons
                  name={vm.isContractWallet ? 'wallet-outline' : 'warning'}
                  size={8}
                  color={vm.isContractWallet ? verifiedColor : 'crimson'}
                  style={{ marginEnd: 4 }}
                />
                <Text style={{ fontSize: 8, color: vm.isContractWallet ? verifiedColor : 'crimson' }}>
                  {t(
                    vm.isContractRecipient
                      ? vm.isContractWallet
                        ? 'tip-recipient-is-contract-wallet'
                        : 'tip-recipient-is-contract'
                      : 'tip-zero-width-space'
                  )}
                </Text>
              </View>
            )}

            {vm.avatar ? (
              <Image source={{ uri: vm.avatar }} style={{ width: 15, height: 15, marginEnd: 5, borderRadius: 100 }} />
            ) : undefined}

            <Text
              numberOfLines={1}
              style={{
                ...reviewItemValueStyle,
                color: vm.transferToRisky ? warningColor : vm.isContractWallet ? 'dodgerblue' : textColor,
              }}
            >
              {utils.isAddress(vm.to) ? formatAddress(vm.toAddress, 8, 6) : formatAddress(vm.safeTo, 14, 6, '...')}
            </Text>

            {!vm.hasZWSP && !vm.isContractRecipient && vm.toAddressTag && (
              <AddressRiskIndicator
                address={vm.toAddress}
                chainId={vm.network.chainId}
                label={vm.toAddressTag?.publicName}
                risky={vm.toAddressTag?.dangerous}
                containerStyle={{ position: 'absolute', bottom: -11.5, right: 0 }}
              />
            )}
          </View>
        </View>

        <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ ...vm.network, width: 15, style: { marginEnd: 5 } })}
            <Text style={{ ...reviewItemValueStyle, color: vm.network.color, maxWidth: 150 }} numberOfLines={1}>
              {vm.network.network}
            </Text>
          </View>
        </View>
      </View>

      <GasFeeReviewItem vm={vm} onGasPress={onGasPress} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {vm.isERC4337Available ? (
          <AddToSendingQueue
            containerStyle={{ marginStart: -10 }}
            themeColor={tintColor}
            txtStyle={{ color: secondaryTextColor }}
            checked={vm.isQueuingTx}
            onToggle={() => vm.setIsQueuingTx(!vm.isQueuingTx)}
          />
        ) : (
          <View />
        )}

        {(txDataEditable || (vm.insufficientFee && !vm.loading)) && <Placeholder />}

        {vm.insufficientFee && !vm.loading ? <InsufficientFee /> : undefined}

        {txDataEditable && !vm.insufficientFee ? (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 15 }}
            onPress={onEditDataPress}
          >
            <Text style={{ fontWeight: '600', color: secondaryTextColor, fontSize: 12.5 }}>
              {t('modal-review-edit-tx-message')}
            </Text>
            <MaterialIcons name="keyboard-arrow-right" size={15} color={secondaryTextColor} style={{ marginBottom: -1 }} />
          </TouchableOpacity>
        ) : undefined}
      </View>

      {vm.txException ? <TxException exception={vm.txException} /> : undefined}

      <View style={{ flex: 1 }} />

      <BioAuthSendButton
        disabled={!vm.isValidParams || busy}
        onPress={send}
        themeColor={vm.transferToRisky ? warningColor : vm.network.color}
      />
    </SafeViewContainer>
  );
});

export default observer((props: Props) => {
  const { vm } = props;
  const swiper = useRef<Swiper>(null);
  const [type, setType] = useState(0);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <ReviewView
        {...props}
        onEditDataPress={() => {
          setType(1);
          setTimeout(() => swiper.current?.scrollBy(1), 10);
        }}
        onGasPress={() => {
          setType(0);
          setTimeout(() => swiper.current?.scrollBy(1), 10);
        }}
      />

      {type === 0 && <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={vm} themeColor={vm.network.color} />}
      {type === 1 && (
        <UserTxData
          vm={vm}
          themeColor={vm.network.color}
          onBack={() => {
            swiper.current?.scrollTo(0);
            vm.estimateGas();
          }}
        />
      )}
    </Swiper>
  );
});
