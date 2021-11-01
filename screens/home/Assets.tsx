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

  return <FlatList data={tokens} keyExtractor={(i) => i.address} renderItem={renderItem} style={{ paddingHorizontal: 16 }} />;
};

export default observer(({ tokens }: { tokens?: IToken[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const swiper = React.useRef<Swiper>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={{ ...styles.headerLabel, ...(activeTab === 0 ? styles.headerLabelActive : {}) }}>Assets</Text>
        <Text style={{ ...styles.headerLabel, ...(activeTab === 1 ? styles.headerLabelActive : {}) }}>NFTs</Text>
        <Text style={{ ...styles.headerLabel, ...(activeTab === 2 ? styles.headerLabelActive : {}) }}>History</Text>
      </View>

      <Swiper
        ref={swiper}
        showsPagination={false}
        loop={false}
        showsButtons={false}
        containerStyle={{ marginHorizontal: -16, paddingHorizontal: 0 }}
        style={{}}
        onIndexChanged={(i) => setActiveTab(i)}
      >
        <Tokens tokens={tokens} />
        <View style={{ flex: 1 }}>
          <Text>Nfts</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>History</Text>
        </View>
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
