import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { borderColor, fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { Coin } from '../../components';
import { IToken } from '../../common/Tokens';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

const Tokens = ({ tokens }: { tokens?: IToken[] }) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<IToken>) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: -16,
          paddingVertical: 16,
          paddingBottom: 13,
          paddingHorizontal: 20,
          paddingEnd: 24,
        }}
      >
        <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} iconUrl={item.iconUrl} />
        <Text style={{ fontSize: 18, color: fontColor }}>{item.symbol}</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 19, color: fontColor }}>
          {item.amount
            ? formatCurrency(item.amount, '')
            : formatCurrency(utils.formatUnits(item.balance || 0, item.decimals), '')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={tokens}
      keyExtractor={(i) => i.address}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#efefef80', marginStart: 56 }} />}
    />
  );
};

export default observer(({ tokens }: { tokens?: IToken[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const swiper = React.useRef<Swiper>(null);

  const swipeTo = (index: number) => {
    swiper.current?.scrollTo(index);
    setActiveTab(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <Text
            style={{ ...styles.headerLabel, ...(activeTab === 0 ? styles.headerLabelActive : {}), paddingStart: 0 }}
            onPress={() => swipeTo(0)}
          >
            Assets
          </Text>
          <Text
            style={{ ...styles.headerLabel, ...(activeTab === 1 ? styles.headerLabelActive : {}) }}
            onPress={() => swipeTo(1)}
          >
            NFTs
          </Text>
          <Text
            style={{ ...styles.headerLabel, ...(activeTab === 2 ? styles.headerLabelActive : {}) }}
            onPress={() => swipeTo(2)}
          >
            History
          </Text>
        </View>

        {activeTab === 0 ? (
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={24} />
          </TouchableOpacity>
        ) : undefined}
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },

  tabsContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingStart: 8,
  },

  headerLabel: {
    textAlign: 'center',
    paddingHorizontal: 12,
    fontWeight: '400',
    fontSize: 15,
    color: secondaryFontColor,
  },

  headerLabelActive: {
    color: themeColor,
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
