import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { Coin } from '../../components';
import { IToken } from '../../common/Tokens';
import Swiper from 'react-native-swiper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';

const Tokens = ({ tokens }: { tokens?: IToken[] }) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<IToken>) => {
    return (
      <View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: -16,
            paddingVertical: 12,
            paddingHorizontal: 20,
            paddingEnd: 24,
          }}
        >
          <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} iconUrl={item.iconUrl} />
          <Text style={{ fontSize: 18 }}>{item.symbol}</Text>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 20 }}>0</Text>
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: '#efefef80', marginStart: 56 }} />
      </View>
    );
  };

  return <FlatList data={tokens} renderItem={renderItem} style={{ paddingHorizontal: 16 }}></FlatList>;
};

export default observer(({ tokens }: { tokens?: IToken[] }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Assets</Text>
        <Text style={styles.headerLabel}>NFTs</Text>
        <Text style={styles.headerLabel}>History</Text>
      </View>

      <Swiper
        showsPagination={false}
        showsButtons={false}
        containerStyle={{ marginHorizontal: -16, paddingHorizontal: 0 }}
        style={{}}
        onIndexChanged={(index) => setActiveTab(index)}
      >
        <Tokens tokens={tokens} />
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 1 }}></View>
      </Swiper>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },

  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: secondaryFontColor,
  },

  headerLabelActive: {
    color: fontColor,
    fontWeight: '500',
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '500',
    fontSize: 27,
    fontFamily: 'Avenir Next',
  },
});
