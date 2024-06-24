import * as Animatable from 'react-native-animatable';

import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/entities/Transaction';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import ERC20Tokens from './ERC20Tokens';
import HistoryList from './HistoryList';
import { IFungibleToken } from '../../models/Interfaces';
import { INetwork } from '../../common/Networks';
import { ITokenMetadata } from '../../common/tokens';
import { RootNavigationProps } from '../navigations';
import { RotateAnimation } from '../../utils/animations';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import TxHub from '../../viewmodels/hubs/TxHub';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/core';

interface Props {
  tokens?: IFungibleToken[];
  themeColor: string;
  network: INetwork;
  loadingTokens?: boolean;
  onRefreshRequest?: () => Promise<void>;
  onTokenPress?: (token: IFungibleToken) => void;
  onTxPress?: (tx: Transaction) => void;
}

export default observer(({ tokens, themeColor, loadingTokens, onRefreshRequest, onTokenPress, onTxPress, network }: Props) => {
  const { t } = i18n;

  const [activeTab, setActiveTab] = useState(0);
  const swiper = React.useRef<Swiper>(null);
  let { borderColor, systemBorderColor } = Theme;

  const swipeTo = (index: number) => {
    swiper.current?.scrollTo(index);
    setActiveTab(index);
  };

  const navigation = useNavigation<RootNavigationProps>();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ ...styles.header, borderBottomColor: `${borderColor}`, borderBottomWidth: 0.5 }}>
        <View style={styles.tabsContainer}>
          <Text
            style={{
              ...styles.headerLabel,
              ...(activeTab === 0 ? { ...styles.headerLabelActive, color: themeColor } : {}),
              paddingStart: 0,
            }}
            onPress={() => {
              swipeTo(0);
            }}
          >
            {t('home-tabs-assets')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
            <Text
              style={{
                ...styles.headerLabel,
                ...(activeTab === 1 ? { ...styles.headerLabelActive, color: themeColor } : {}),
                paddingHorizontal: 0,
              }}
              onPress={() => {
                swipeTo(1);
              }}
            >
              {TxHub.pendingCount > 0 ? `${t('home-tabs-history')} (${TxHub.pendingCount}` : t('home-tabs-history')}
            </Text>
            {TxHub.pendingCount > 0 && (
              <Animatable.View
                style={{ marginStart: 4 }}
                animation={RotateAnimation}
                iterationCount="infinite"
                easing="linear"
                duration={2000}
              >
                <Ionicons name="sync" size={14} color={activeTab === 1 ? themeColor : secondaryFontColor} />
              </Animatable.View>
            )}
            {TxHub.pendingCount > 0 && (
              <Text
                style={{
                  ...styles.headerLabel,
                  ...(activeTab === 1 ? { ...styles.headerLabelActive, color: themeColor } : {}),
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
        onIndexChanged={(i) => {
          setActiveTab(i);
        }}
      >
        <ERC20Tokens
          tokens={tokens}
          network={network}
          loading={loadingTokens}
          separatorColor={`${borderColor}70`}
          onRefreshRequest={onRefreshRequest}
          onTokenPress={onTokenPress}
        />
        <View style={{ flex: 1 }}>
          <HistoryList data={TxHub.allTxs} onTxPress={onTxPress} onEndReached={TxHub.loadMore} />
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
    borderBottomColor: '#efefef80',
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
