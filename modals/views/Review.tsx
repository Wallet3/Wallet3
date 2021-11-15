import { Button, Coin, SafeViewContainer } from '../../components';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import BackButton from '../components/BackButton';
import Currency from '../../viewmodels/Currency';
import Fire from '../../assets/icons/app/fire.svg';
import Gem from '../../assets/icons/app/gem.svg';
import Image from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import { ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import { Transferring } from '../../viewmodels/Transferring';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  onBack?: () => void;
  onSend?: () => Promise<void>;
  onGasPress?: () => void;
  vm: Transferring;
}

const ReviewView = observer(({ vm, onBack, onGasPress, onSend }: Props) => {
  const [busy, setBusy] = React.useState(false);

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={onBack} color={Networks.current.color} />

        <Text style={styles.navTitle}>Tx Review</Text>
      </View>

      <View style={viewStyles.reviewItemContainer}>
        <View style={viewStyles.reviewItem}>
          <Text style={viewStyles.reviewItemTitle}>Send</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ ...viewStyles.reviewItemValue, marginEnd: 8, maxWidth: '50%' }} numberOfLines={1}>
              {vm.amount}
            </Text>
            <Text style={{ ...viewStyles.reviewItemValue, marginEnd: 8 }}>{vm.token.symbol}</Text>
            <Coin symbol={vm.token!.symbol} forceRefresh />
          </View>
        </View>

        <View style={viewStyles.reviewItem}>
          <Text style={viewStyles.reviewItemTitle}>To</Text>

          <View style={{ flexDirection: 'row', maxWidth: '72%', alignItems: 'center' }}>
            {vm.avatar ? (
              <Image source={{ uri: vm.avatar }} style={{ width: 15, height: 15, marginEnd: 5, borderRadius: 100 }} />
            ) : undefined}
            <Text style={{ ...viewStyles.reviewItemValue }} numberOfLines={1}>
              {utils.isAddress(vm.to) ? formatAddress(vm.to, 9, 7) : vm.to}
            </Text>
          </View>
        </View>

        <View style={{ ...viewStyles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={viewStyles.reviewItemTitle}>Network</Text>

          <View>
            <Text style={{ ...viewStyles.reviewItemValue, color: vm.network.color }}>{vm.network.network}</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          ...viewStyles.reviewItemContainer,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingStart: 16,
        }}
      >
        <Text style={viewStyles.reviewItemTitle}>Tx Fee</Text>

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
          <Text style={{ ...viewStyles.reviewItemTitle, fontSize: 15 }}>
            {`(${Currency.tokenToUSD(vm.txFee, vm.network.symbol).toFixed(2)} USD)`}
          </Text>

          <AnimateNumber
            style={{ ...viewStyles.reviewItemValue, marginHorizontal: 2 }}
            numberOfLines={1}
            value={vm.txFee}
            formatter={(val) => `${val.toFixed(5)} ${vm.feeTokenSymbol}`}
          />

          <MaterialIcons name="keyboard-arrow-right" size={15} />
        </TouchableOpacity>
      </View>

      {vm.txException ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            ...viewStyles.reviewItemContainer,

            borderWidth: 1,
            paddingTop: 12,
            paddingHorizontal: 16,
            backgroundColor: 'crimson',
            paddingBottom: 0,
          }}
          contentContainerStyle={{ alignItems: 'center', marginTop: -11 }}
        >
          <Ionicons name="alert-circle" color="white" size={16} />
          <Text style={{ color: 'white', marginStart: 8, fontSize: 12 }}>{vm.txException}</Text>
        </ScrollView>
      ) : undefined}

      {vm.insufficientFee ? (
        <Text style={{ color: 'crimson', textAlign: 'right', fontSize: 12, fontWeight: '600', marginEnd: 18, marginTop: 6 }}>
          {'Insufficient funds'}
        </Text>
      ) : undefined}

      <View style={{ flex: 1 }} />

      <Button
        title="Send"
        themeColor={Networks.current.color}
        disabled={!vm.isValidParams || busy}
        onPress={async () => {
          setBusy(true);
          await onSend?.();
          setBusy(false);
        }}
      />
    </SafeViewContainer>
  );
});

interface GasProps {
  onBack?: () => void;
  vm: Transferring;
}

const GasView = observer(({ onBack, vm }: GasProps) => {
  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={onBack} />

        <Text style={styles.navTitle}>Tx Fee</Text>
      </View>

      <View style={viewStyles.reviewItemContainer}>
        <View style={{ ...viewStyles.reviewItem, paddingBottom: 12 }}>
          <Text style={viewStyles.reviewItemTitle}>Gas Limit</Text>

          <TextInput
            keyboardType="number-pad"
            placeholder="21000"
            textAlign="right"
            style={{ ...viewStyles.reviewItemValue, fontSize: 20 }}
            maxLength={12}
            value={`${vm.gasLimit}`}
            onChangeText={(txt) => vm.setGasLimit(txt)}
          />
        </View>

        <View style={{ ...viewStyles.reviewItem, paddingBottom: 12 }}>
          <Text style={viewStyles.reviewItemTitle}>Max Gas Price</Text>

          <View style={{ marginBottom: -8 }}>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="20.00"
              textAlign="right"
              maxLength={12}
              style={{ ...viewStyles.reviewItemValue, fontSize: 20 }}
              value={`${Number(vm.maxGasPrice.toFixed(5))}`}
              onChangeText={(txt) => vm.setMaxGasPrice(txt)}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              {vm.network.eip1559 ? <Fire width={8} height={8} style={{ marginEnd: 3 }} /> : undefined}
              {vm.network.eip1559 ? (
                <AnimateNumber
                  style={viewStyles.gasGweiLabel}
                  value={vm.nextBlockBaseFee}
                  formatter={(val) => `${val.toFixed(6)} Gwei`}
                />
              ) : (
                <Text style={viewStyles.gasGweiLabel}>Gwei</Text>
              )}
            </View>
          </View>
        </View>

        {vm.network.eip1559 ? (
          <View style={{ ...viewStyles.reviewItem, paddingBottom: 12 }}>
            <Text style={viewStyles.reviewItemTitle}>Priority Price</Text>

            <View style={{ marginBottom: -8 }}>
              <TextInput
                keyboardType="decimal-pad"
                placeholder="1.00"
                textAlign="right"
                maxLength={12}
                style={{ ...viewStyles.reviewItemValue, fontSize: 20 }}
                value={`${vm.maxPriorityPrice.toFixed(6)}`}
                onChangeText={(txt) => vm.setPriorityPrice(txt)}
              />
              <Text style={{ ...viewStyles.gasGweiLabel, marginTop: -2 }}>Gwei</Text>
            </View>
          </View>
        ) : undefined}

        <View style={{ ...viewStyles.reviewItem, borderBottomWidth: 0, paddingBottom: 12 }}>
          <Text style={viewStyles.reviewItemTitle}>Nonce</Text>

          <TextInput
            keyboardType="number-pad"
            placeholder="0"
            textAlign="right"
            style={{ ...viewStyles.reviewItemValue, fontSize: 20 }}
            maxLength={12}
            value={`${vm.nonce}`}
            onChangeText={(txt) => vm.setNonce(txt)}
          />
        </View>
      </View>

      <View style={{ ...viewStyles.reviewItemContainer, flexDirection: 'row' }}>
        <TouchableOpacity style={viewStyles.gasItem} onPress={() => vm.setGas('rapid')}>
          <Ionicons name="rocket" size={12} color="tomato" />
          <Text style={{ ...viewStyles.gasItemText, color: 'tomato' }}>Rapid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={viewStyles.gasItem} onPress={() => vm.setGas('fast')}>
          <Ionicons name="car-sport" size={13} color="dodgerblue" />
          <Text style={{ ...viewStyles.gasItemText, color: 'dodgerblue' }}>Fast</Text>
        </TouchableOpacity>

        <TouchableOpacity style={viewStyles.gasItem} onPress={() => vm.setGas('standard')}>
          <FontAwesome5 name="walking" size={12} color="darkorchid" />
          <Text style={{ ...viewStyles.gasItemText, color: 'darkorchid' }}>Standard</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}></View>

      <Button title="OK" txtStyle={{ textTransform: 'uppercase' }} onPress={onBack} themeColor={Networks.current.color} />
    </SafeViewContainer>
  );
});

export default observer(({ onBack, vm, onSend }: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <ReviewView onBack={onBack} onSend={onSend} onGasPress={() => swiper.current?.scrollTo(1)} vm={vm} />
      <GasView onBack={() => swiper.current?.scrollTo(0)} vm={vm} />
    </Swiper>
  );
});

const viewStyles = StyleSheet.create({
  reviewItemContainer: {
    borderWidth: 1,
    borderColor,
    borderRadius: 10,
    marginTop: 12,
  },

  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },

  reviewItemTitle: {
    fontSize: 17,
    color: secondaryFontColor,
    fontWeight: '500',
  },

  reviewItemValue: {
    fontSize: 17,
    color: fontColor,
    fontWeight: '500',
  },

  gasItem: {
    flexDirection: 'row',
    padding: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gasGweiLabel: {
    fontSize: 8,
    color: secondaryFontColor,
    textAlign: 'right',
  },

  gasItemText: {
    marginStart: 6,
  },
});
