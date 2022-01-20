import { Coin, SafeViewContainer, Skeleton } from '../../components';
import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fontColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AnimateNumber from 'react-native-animate-number';
import Authentication from '../../viewmodels/Authentication';
import Avatar from '../../components/Avatar';
import Currency from '../../viewmodels/settings/Currency';
import GasReview from '../views/GasReview';
import Image from 'react-native-expo-cached-image';
import InsufficientFee from '../components/InsufficientFee';
import { MaterialIcons } from '@expo/vector-icons';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';
import RejectApproveButtons from '../components/RejectApproveButtons';
import Swiper from 'react-native-swiper';
import TxException from '../components/TxException';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  vm: RawTransactionRequest;
  app: { name: string; icon: string };
  onReject?: () => void;
  onApprove?: () => Promise<void>;
  onGasPress?: () => void;
  account: Account;
}

const TxReview = observer(({ vm, onReject, onApprove, onGasPress, app, account }: Props) => {
  const { network } = vm;
  const { t } = i18n;

  const [busy, setBusy] = useState(false);

  return (
    <SafeViewContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingEnd: 4 }}>
        <Avatar
          size={18}
          emoji={account?.emojiAvatar}
          emojiSize={8}
          backgroundColor={account?.emojiColor}
          uri={account?.avatar}
        />
        <Text style={{ marginStart: 8, color: `${thirdFontColor}`, fontSize: 13 }}>{account?.miniDisplayName}</Text>
      </View>

      <View style={styles.reviewItemsContainer}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>DApp</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: app.icon }} style={{ width: 19, height: 19, marginEnd: 4, borderRadius: 3 }} />
            <Text style={{ ...styles.reviewItemValue, maxWidth: 180 }} numberOfLines={1}>
              {app.name}
            </Text>
          </View>
        </View>

        <View style={{ ...styles.reviewItem }}>
          <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-type')}</Text>
          <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
            {vm.type}
          </Text>
        </View>

        {vm.type === 'Transfer' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-amount')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {vm.tokenAmountWei.gt(0) ? (
                <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
                  {`${vm.tokenAmount} ${vm.tokenSymbol}`}
                </Text>
              ) : undefined}

              {vm.tokenAmountWei.gt(0) && vm.valueWei.gt(0) ? (
                <Text style={{ ...styles.reviewItemValue, marginHorizontal: 6 }}>+</Text>
              ) : undefined}

              {vm.valueWei.gt(0) || vm.tokenAmountWei.eq(0) ? (
                <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>{`${vm.value} ${vm.network.symbol}`}</Text>
              ) : undefined}
            </View>
          </View>
        ) : undefined}

        {vm.type === 'Approve' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-max-approve')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                numberOfLines={1}
                defaultValue={vm.maxUint256Amount ? 'Unlimited' : vm.tokenAmount}
                keyboardType="decimal-pad"
                onChangeText={(t) => vm.setApproveAmount(t)}
                selectTextOnFocus
                textAlign="right"
                style={{
                  ...styles.reviewItemValue,
                  maxWidth: 120,
                  color: vm.maxUint256Amount ? 'deeppink' : fontColor,
                  marginEnd: 4,
                  minWidth: 52,
                }}
              />

              {vm.tokenSymbol ? <Coin symbol={vm.tokenSymbol} size={20} /> : undefined}
              {vm.tokenSymbol ? (
                <Text style={{ ...styles.reviewItemValue, marginStart: 2, maxWidth: 64 }} numberOfLines={1}>
                  {vm.tokenSymbol}
                </Text>
              ) : (
                <Skeleton style={{ width: 52, height: 19, marginStart: 4 }} />
              )}
            </View>
          </View>
        ) : undefined}

        {vm.type !== 'Contract Interaction' ? (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-to')}</Text>
            <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
              {formatAddress(vm.to, 9, 5)}
            </Text>
          </View>
        ) : (
          <View style={{ ...styles.reviewItem }}>
            <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-value')}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ ...styles.reviewItemValue, maxWidth: 120, marginEnd: 4 }} numberOfLines={1}>
                {vm.value}
              </Text>

              <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
                {vm.network.symbol}
              </Text>
            </View>
          </View>
        )}

        <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {generateNetworkIcon({ ...network, width: 15, style: { marginEnd: 6 } })}
            <Text style={{ ...styles.reviewItemValue, color: network?.color }} numberOfLines={1}>
              {network?.network}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          ...styles.reviewItemsContainer,
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
            paddingEnd: 14,
            justifyContent: 'flex-end',
            width: '75%',
          }}
        >
          <Text style={{ ...styles.reviewItemTitle, fontSize: 15 }}>
            {`(${Currency.tokenToUSD(vm.estimatedRealFee, vm.network.symbol).toFixed(2)} USD)`}
          </Text>

          <AnimateNumber
            style={{ ...styles.reviewItemValue, marginHorizontal: 2 }}
            numberOfLines={1}
            timing="linear"
            value={vm.txFee}
            formatter={(val) => `${val.toFixed(5)} ${vm.feeTokenSymbol}`}
          />

          <MaterialIcons name="keyboard-arrow-right" size={15} />
        </TouchableOpacity>
      </View>

      {vm.insufficientFee ? <InsufficientFee /> : undefined}

      {vm.txException ? <TxException exception={vm.txException} /> : undefined}

      <View style={{ flex: 1 }} />

      <RejectApproveButtons
        onReject={onReject}
        themeColor={network?.color}
        rejectTitle={t('button-reject')}
        approveTitle={t(Authentication.biometricType === 'faceid' ? 'modal-review-button-hold-to-send' : 'button-send')}
        disabledApprove={!vm.isValidParams || busy}
        longConfirm={Authentication.biometricType === 'faceid'}
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

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <TxReview {...props} onGasPress={() => swiper.current?.scrollTo(1)} />
      <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={props.vm} themeColor={props.vm.network.color} />
    </Swiper>
  );
});
