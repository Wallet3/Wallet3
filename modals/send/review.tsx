import { Button, Coin } from '../../components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import Swiper from 'react-native-swiper';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onBack?: () => void;
  onSend?: () => void;
  onGasPress?: () => void;
}

const ReviewView = observer((props: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={props.onBack} />
      </View>

      <View style={viewStyles.reviewItemContainer}>
        <View style={viewStyles.reviewItem}>
          <Text style={viewStyles.reviewItemTitle}>Send</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...viewStyles.reviewItemValue, marginEnd: 8 }} numberOfLines={1}>
              20.01 UNI
            </Text>
            <Coin symbol="UNI" />
          </View>
        </View>

        <View style={viewStyles.reviewItem}>
          <Text style={viewStyles.reviewItemTitle}>To</Text>

          <Text style={{ ...viewStyles.reviewItemValue, maxWidth: '45%' }} numberOfLines={1}>
            {formatAddress('cryptopunk.eth')}
          </Text>
        </View>

        <View style={{ ...viewStyles.reviewItem, borderBottomWidth: 0 }}>
          <Text style={viewStyles.reviewItemTitle}>Network</Text>

          <View>
            <Text style={viewStyles.reviewItemValue}>Ethereum</Text>
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
          // borderColor: 'red',
        }}
      >
        <Text style={viewStyles.reviewItemTitle}>Tx Fee</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }} onPress={props.onGasPress}>
          <Text style={{ ...viewStyles.reviewItemTitle, fontSize: 15 }}>(89.01 USD)</Text>
          <Text style={{ ...viewStyles.reviewItemValue, marginHorizontal: 2, maxWidth: '50%' }} numberOfLines={1}>
            0.02567 ETH
          </Text>

          <MaterialIcons name="keyboard-arrow-right" size={15} />
        </TouchableOpacity>
      </View>

      <Text style={{ color: 'red', textAlign: 'right', fontSize: 12, fontWeight: '600', marginEnd: 18, marginTop: 6 }}>
        {'Insufficient Funds'}
      </Text>

      <View style={{ flex: 1 }} />

      <Button title="Send" onPress={props.onSend} />
    </View>
  );
});

interface GasProps {
  onBack?: () => void;
}

const GasView = observer((props: GasProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={props.onBack} />
      </View>
    </View>
  );
});

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <ReviewView onBack={props.onBack} onSend={props.onSend} onGasPress={() => swiper.current?.scrollTo(1)} />
      <GasView onBack={() => swiper.current?.scrollTo(0)} />
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
    padding: 16,
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
});
