import { Button, Coin } from '../../components';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef } from 'react';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import Swiper from 'react-native-swiper';
import Tokenlist from './tokenlist';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

const AmountView = observer((props: SubViewProps) => {
  return (
    <View style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} />}

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onTokenPress}>
          <Text style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500' }}>USDC</Text>

          <Coin symbol="USDC" style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -24 }}>
        <TextInput
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={{
            fontSize: 52,
            borderBottomColor: borderColor,
            borderBottomWidth: 1,
            fontWeight: '500',
            minWidth: 128,
            textAlign: 'center',
            marginTop: 24,
          }}
        />

        {props.disableBalance ? undefined : (
          <TouchableOpacity style={{}} onPress={(_) => alert('abc')}>
            <Text style={{ color: secondaryFontColor, padding: 8 }} numberOfLines={1}>
              Balance: 1,212,345.67
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Button title="Next" onPress={props.onNext} />
    </View>
  );
});

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountView
        onBack={props.onBack}
        onNext={props.onNext}
        onTokenPress={() => swiper.current?.scrollTo(1)}
        disableBack={props.disableBack}
        disableBalance={props.disableBalance}
      />

      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} onTokenSelected={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});
