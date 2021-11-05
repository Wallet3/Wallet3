import * as Animatable from 'react-native-animatable';

import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import { Coin } from '../../components';
import { IToken } from '../../common/Tokens';
import { RootNavigationProps } from '../navigations';
import Skeleton from '../../components/Skeleton';
import Swiper from 'react-native-swiper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import TxHub from '../../viewmodels/TxHub';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/core';

const Token = observer(({ item }: { item: IToken }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: -16,
        paddingVertical: 16,
        paddingBottom: 13,
        paddingHorizontal: 22,
      }}
    >
      <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} iconUrl={item.iconUrl} />
      <Text style={{ fontSize: 18, color: fontColor }} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View style={{ flex: 1 }} />

      {item.loading ? (
        <Skeleton />
      ) : (
        <Text style={{ fontSize: 19, color: fontColor }} numberOfLines={1}>
          {formatCurrency(item.amount || '0', '')}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const Tokens = observer(({ tokens, loading }: { tokens?: IToken[]; loading?: boolean }) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<IToken>) => <Token item={item} />;

  return (tokens?.length ?? 0) > 0 && !loading ? (
    <FlatList
      data={tokens}
      keyExtractor={(i) => i.address}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#efefef80', marginStart: 56 }} />}
    />
  ) : (
    <View style={{ flex: 1, padding: 16, paddingVertical: 12 }}>
      <Skeleton style={{ height: 52, width: '100%' }} />
    </View>
  );
});

interface Props {
  tokens?: IToken[];
  themeColor: string;
  loadingTokens?: boolean;
}

const rotate = {
  from: {
    transform: [{ rotate: '0deg' }],
  },
  to: {
    transform: [{ rotate: '360deg' }],
  },
};

export default observer(({ tokens, themeColor, loadingTokens }: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const swiper = React.useRef<Swiper>(null);

  const swipeTo = (index: number) => {
    swiper.current?.scrollTo(index);
    setActiveTab(index);
  };

  const navigation = useNavigation<RootNavigationProps>();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <Text
            style={{
              ...styles.headerLabel,
              ...(activeTab === 0 ? { ...styles.headerLabelActive, color: themeColor } : {}),
              paddingStart: 0,
            }}
            onPress={() => swipeTo(0)}
          >
            Assets
          </Text>
          <Text
            style={{ ...styles.headerLabel, ...(activeTab === 1 ? { ...styles.headerLabelActive, color: themeColor } : {}) }}
            onPress={() => swipeTo(1)}
          >
            NFTs
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
            <Text
              style={{
                ...styles.headerLabel,
                ...(activeTab === 2 ? { ...styles.headerLabelActive, color: themeColor } : {}),
                paddingHorizontal: 0,
              }}
              onPress={() => swipeTo(2)}
            >
              {TxHub.pendingCount > 0 ? `History (${TxHub.pendingCount}` : `History`}
            </Text>
            {TxHub.pendingCount > 0 && (
              <Animatable.View
                style={{ marginStart: 4 }}
                animation={rotate}
                iterationCount="infinite"
                easing="linear"
                duration={2000}
              >
                <Ionicons name="sync" size={14} color={activeTab === 2 ? themeColor : secondaryFontColor} />
              </Animatable.View>
            )}
            {TxHub.pendingCount > 0 && (
              <Text
                style={{
                  ...styles.headerLabel,
                  ...(activeTab === 2 ? { ...styles.headerLabelActive, color: themeColor } : {}),
                  paddingHorizontal: 0,
                }}
              >
                )
              </Text>
            )}
          </View>
        </View>

        {activeTab === 0 ? (
          <TouchableOpacity
            style={{ padding: 4, marginEnd: 0, marginBottom: -2 }}
            onPress={() => navigation.navigate('Tokens')}
          >
            <Feather name="more-horizontal" size={21} color={secondaryFontColor} style={{ opacity: 0.8 }} />
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
        <Tokens tokens={tokens} loading={loadingTokens} />
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
    fontWeight: '500',
    fontSize: 15,
    color: secondaryFontColor,
  },

  headerLabelActive: {
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
