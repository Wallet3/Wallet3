import { Button, Coin, SafeViewContainer } from '../../components';
import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import AnimateNumber from 'react-native-animate-number';
import BackButton from '../components/BackButton';
import Currency from '../../viewmodels/settings/Currency';
import GasReview from './GasReview';
import Image from 'react-native-expo-cached-image';
import InsufficientFee from '../components/InsufficientFee';
import { MaterialIcons } from '@expo/vector-icons';
import Networks from '../../viewmodels/Networks';
import Swiper from 'react-native-swiper';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import TxException from '../components/TxException';
import { formatAddress } from '../../utils/formatter';
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
  biometricEnabled?: boolean;
}

const ReviewView = observer(({ vm, onBack, onGasPress, onSend, disableBack, biometricEnabled }: Props) => {
  const { t } = i18n;
  const [busy, setBusy] = React.useState(false);

  const send = async () => {
    setBusy(true);
    await onSend?.();
    setBusy(false);
  };

  const sendTitle = biometricEnabled ? t('modal-review-button-hold-to-send') : t('modal-review-button-send');
  const onLongSendPress = biometricEnabled ? send : undefined;
  const onSendPress = biometricEnabled ? undefined : send;

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        {disableBack ? <View /> : <BackButton onPress={onBack} color={Networks.current.color} />}

        <Text style={styles.navTitle}>{t('modal-review-title')}</Text>
      </View>

      <View style={styles.reviewItemsContainer}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-send')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ ...styles.reviewItemValue, marginEnd: 8, maxWidth: '50%' }} numberOfLines={1}>
              {vm.amount}
            </Text>
            <Text style={{ ...styles.reviewItemValue, marginEnd: 8 }}>{vm.token.symbol}</Text>
            <Coin symbol={vm.token!.symbol} forceRefresh iconUrl={vm.token?.iconUrl} />
          </View>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-to')}</Text>

          <View style={{ flexDirection: 'row', maxWidth: '72%', alignItems: 'center' }}>
            {vm.avatar ? (
              <Image source={{ uri: vm.avatar }} style={{ width: 15, height: 15, marginEnd: 5, borderRadius: 100 }} />
            ) : undefined}
            <Text style={{ ...styles.reviewItemValue }} numberOfLines={1}>
              {utils.isAddress(vm.to) ? formatAddress(vm.to, 9, 6) : vm.to}
            </Text>
          </View>
        </View>

        <View style={{ ...styles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>

          <View>
            <Text style={{ ...styles.reviewItemValue, color: vm.network.color }}>{vm.network.network}</Text>
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
            value={vm.txFee}
            duration={1500}
            formatter={(val) => `${val.toFixed(5)} ${vm.feeTokenSymbol}`}
          />

          <MaterialIcons name="keyboard-arrow-right" size={15} />
        </TouchableOpacity>
      </View>

      {vm.insufficientFee ? <InsufficientFee /> : undefined}

      {vm.txException ? <TxException exception={vm.txException} /> : undefined}

      <View style={{ flex: 1 }} />

      <Button
        title={sendTitle}
        themeColor={vm.network.color}
        disabled={!vm.isValidParams || busy}
        onPress={onSendPress}
        onLongPress={onLongSendPress}
      />
    </SafeViewContainer>
  );
});

export default observer((props: Props) => {
  const { onBack, vm, onSend, disableBack } = props;
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <ReviewView {...props} onGasPress={() => swiper.current?.scrollTo(1)} />
      <GasReview onBack={() => swiper.current?.scrollTo(0)} vm={vm} themeColor={vm.network.color} />
    </Swiper>
  );
});
