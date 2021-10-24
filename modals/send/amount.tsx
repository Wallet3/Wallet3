import { Button, Coin } from '../../components';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { Image, ListRenderItemInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { borderColor, fontColor, numericFontFamily, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import Svg from 'react-native-svg';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
}

const AmountView = observer((props: SubViewProps) => {
  return (
    <View style={styles.container}>
      <View style={{ ...styles.navBar }}>
        <BackButton onPress={props.onBack} />

        <TouchableOpacity
          style={{
            borderRadius: 50,
            borderWidth: 1,
            borderColor: borderColor,
            padding: 4,
            paddingHorizontal: 12,
            alignItems: 'center',
            flexDirection: 'row',
          }}
          onPress={props.onTokenPress}
        >
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

        <TouchableOpacity style={{}} onPress={(_) => alert('abc')}>
          <Text style={{ color: secondaryFontColor, padding: 8 }} numberOfLines={1}>
            Balance: 1,212,345.67
          </Text>
        </TouchableOpacity>
      </View>

      <Button title="Next" onPress={props.onNext} />
    </View>
  );
});

const data = [
  { symbol: 'ETH' },
  { symbol: 'USDC' },
  { symbol: 'DAI' },
  { symbol: 'CRV' },
  { symbol: 'UNI' },
  { symbol: 'MKR' },
  { symbol: 'COMP' },
  { symbol: 'Sushi' },
  { symbol: 'LINK' },
  { symbol: 'Aave' },
];

const TokensView = observer((props: SubViewProps) => {
  const renderItem = ({ item }: ListRenderItemInfo<{ symbol: string }>) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 0,
          padding: 8,
        }}
        onPress={props.onTokenPress}
      >
        <Coin symbol={item.symbol} style={{ width: 25, height: 25, marginEnd: 12 }} />
        <Text style={{ fontSize: 19, color: fontColor, textTransform: 'uppercase' }} numberOfLines={1}>
          {item.symbol}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ ...styles.container, flexDirection: 'row' }}>
      <View style={{ ...styles.navBar, alignItems: 'flex-start', marginEnd: 8 }}>
        <BackButton onPress={props.onTokenBack} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(i) => i.symbol}
        style={{ marginTop: -2, marginEnd: -16, paddingEnd: 16 }}
      />
    </View>
  );
});

interface Props {
  onBack?: () => void;
  onNext?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountView onBack={props.onBack} onNext={props.onNext} onTokenPress={() => swiper.current?.scrollTo(1)} />
      <TokensView onTokenBack={() => swiper.current?.scrollTo(0)} onTokenPress={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});
