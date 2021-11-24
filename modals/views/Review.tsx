import { Button, Coin, SafeViewContainer } from '../../components';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import Authentication from '../../viewmodels/Authentication';
import BackButton from '../components/BackButton';
import { BaseTransaction } from '../../viewmodels/transferring/BaseTransaction';
import Currency from '../../viewmodels/Currency';
import Fire from '../../assets/icons/app/fire.svg';
import GasReview from './GasReview';
import Image from 'react-native-expo-cached-image';
import InsufficientFee from '../components/InsufficientFee';
import Networks from '../../viewmodels/Networks';
import { ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import TxException from '../components/TxException';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  onBack?: () => void;
  onSend?: () => Promise<void>;
  onGasPress?: () => void;
  disableBack?: boolean;
  vm: TokenTransferring;
}

const ReviewView = observer(({ vm, onBack, onGasPress, onSend, disableBack }: Props) => {
  const [busy, setBusy] = React.useState(false);

  const send = async () => {
    setBusy(true);
    await onSend?.();
    setBusy(false);
  };

  const sendTitle = Authentication.biometricsEnabled ? 'Hold to Send' : 'Send';
  const onLongSendPress = Authentication.biometricsEnabled ? send : undefined;
  const onSendPress = Authentication.biometricsEnabled ? undefined : send;

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        {disableBack ? <View /> : <BackButton onPress={onBack} color={Networks.current.color} />}

        <Text style={styles.navTitle}>Tx Review</Text>
      </View>

      <View style={styles.reviewItemsContainer}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>Send</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ ...styles.reviewItemValue, marginEnd: 8, maxWidth: '50%' }} numberOfLines={1}>
              {vm.amount}
            </Text>
            <Text style={{ ...styles.reviewItemValue, marginEnd: 8 }}>{vm.token.symbol}</Text>
            <Coin symbol={vm.token!.symbol} forceRefresh />
          </View>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewItemTitle}>To</Text>

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
          <Text style={styles.reviewItemTitle}>Network</Text>

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
        <Text style={styles.reviewItemTitle}>Tx Fee</Text>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingVertical: 12,
            paddingEnd: 14,
            justifyContent: 'flex-end',
            width: '75%',
          }}
          onPress={onGasPress}
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
