import * as Animatable from 'react-native-animatable';
import * as ExpoLinking from 'expo-linking';
import * as shape from 'd3-shape';

import { Button, Coin, Skeleton } from '../../components';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { EvilIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatAddress, formatCurrency } from '../../utils/formatter';
import { thirdFontColor, warningColor } from '../../constants/styles';

import { BreathAnimation } from '../../utils/animations';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import { LineChart } from 'react-native-svg-charts';
import Theme from '../../viewmodels/settings/Theme';
import { TokenData } from '../../viewmodels/services/TokenData';
import i18n from '../../i18n';
import { isURL } from '../../utils/url';
import { observer } from 'mobx-react-lite';
import { openInappBrowser } from '../../modals/InappBrowser';

interface Props {
  token?: IToken;
  network: INetwork;
  themeColor?: string;
  onSendPress?: (token?: IToken) => void;
}

const Gradient = () => (
  <Defs key={'gradient'}>
    <LinearGradient id={'gradient'} x1={'0'} y1={'0%'} x2={'100%'} y2={'0%'}>
      <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
      <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
    </LinearGradient>
  </Defs>
);

export default observer(({ token, themeColor, onSendPress, network }: Props) => {
  const [vm, setVM] = useState<TokenData>();
  const { t } = i18n;
  const { backgroundColor, thirdTextColor, foregroundColor, borderColor, textColor } = Theme;

  useEffect(() => {
    setVM(token ? new TokenData({ token: token!, network }) : undefined);
  }, [token]);

  return (
    <View style={{ padding: 16, backgroundColor, borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Coin
          chainId={network.chainId}
          address={token?.address || ''}
          symbol={token?.symbol}
          size={39}
          iconUrl={token?.logoURI}
        />

        <View style={{ marginStart: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{ fontWeight: '500', fontSize: 19, color: vm?.dangerous ? warningColor : textColor, marginEnd: 6 }}
              numberOfLines={1}
            >
              {token?.symbol}
            </Text>

            {vm?.dangerous ? (
              <Animatable.View animation={BreathAnimation} duration={1200} iterationCount="infinite" useNativeDriver>
                <Ionicons name="warning" size={19} color={warningColor} />
              </Animatable.View>
            ) : (
              <MaterialIcons name="verified" size={17} color={vm?.verified ? 'dodgerblue' : borderColor} />
            )}
          </View>
          {vm?.loading ? (
            <Skeleton style={{ height: 14, marginTop: 2 }} />
          ) : (
            <Text
              style={{ fontSize: 14, color: (vm?.priceChangePercentIn24 || 0) > 0 ? 'yellowgreen' : 'crimson' }}
              numberOfLines={1}
            >
              {vm?.price
                ? `$ ${vm?.price.toFixed(2)} (${
                    (vm?.priceChangePercentIn24 || 0) > 0
                      ? '+' + (vm?.priceChangePercentIn24 || 0).toFixed(2)
                      : (vm?.priceChangePercentIn24 || 0).toFixed(2)
                  }% 24h)`
                : '-'}
            </Text>
          )}
        </View>
      </View>

      {!vm?.loading && vm?.historyPrices.length === 0 ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="bandage-outline" size={27} color={thirdTextColor} />
          <Text style={{ color: thirdTextColor, marginTop: 8 }}>No Data</Text>
        </View>
      ) : (
        <LineChart
          style={{ height: 200, marginHorizontal: -16, marginVertical: 16 }}
          data={vm?.historyPrices || []}
          contentInset={{ top: 20, bottom: 20 }}
          curve={shape.curveNatural}
          animate
          svg={{
            strokeWidth: 3,
            stroke: 'url(#gradient)',
          }}
        >
          <Gradient />
        </LineChart>
      )}

      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={styles.subTitle}>{t('modal-token-details-value')}</Text>
        <Text style={styles.subTitle}>{t('modal-token-details-balance')}</Text>
      </View>

      <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Text style={{ ...styles.subValue, color: foregroundColor }} numberOfLines={1}>
          {vm?.price ? formatCurrency(Number(token?.amount || 0) * (vm?.price || 0)) : '-'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...styles.subValue, marginEnd: 8, color: foregroundColor }}>
            {`${formatCurrency(token?.amount || 0, '', '0.0000')} ${token?.symbol}`}
          </Text>
          <Coin
            chainId={network.chainId}
            address={token?.address || ''}
            symbol={token?.symbol}
            iconUrl={token?.logoURI}
            size={19}
          />
        </View>
      </View>

      <Button
        themeColor={themeColor}
        title={t('button-send')}
        style={{ borderRadius: 50, marginVertical: 16 }}
        icon={() => <EvilIcons name="sc-telegram" color="white" size={22} style={{ marginTop: -1.25 }} />}
        onPress={() => onSendPress?.(token)}
      />

      <Text style={styles.sectionTitle}>{t('modal-token-details-about', { token: token?.symbol })}</Text>

      <View style={{ marginVertical: 8 }}>
        {vm?.loading ? (
          <Skeleton style={{ flex: 1, width: '100%', height: 32 }} />
        ) : (
          <Text style={{ ...styles.sectionValue, maxWidth: '100%' }}>{vm?.firstDescription || 'No Data'}</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>{t('modal-token-details-more')}</Text>

      <View style={{ marginVertical: 8 }}>
        {vm?.address ? (
          <View style={styles.sectionItem}>
            <View style={styles.sectionItem}>
              <Ionicons name="code-slash" style={styles.icon} />
              <Text style={styles.sectionValue}>{t('modal-token-details-contract-address')}</Text>
            </View>

            <TouchableOpacity
              style={styles.sectionItem}
              onPress={() => openInappBrowser(`${network.explorer}/address/${vm?.address}`, 'wallet')}
            >
              <Text style={styles.sectionValue} numberOfLines={1}>
                {formatAddress(vm?.address, 7, 5)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : undefined}

        {vm?.links?.homepage && isURL(vm?.links.homepage[0]) ? (
          <View style={styles.sectionItem}>
            <View style={styles.sectionItem}>
              <Ionicons name="home-outline" style={styles.icon} />
              <Text style={styles.sectionValue}>Homepage</Text>
            </View>

            <TouchableOpacity style={styles.sectionItem} onPress={() => openInappBrowser(vm?.links!.homepage[0], 'wallet')}>
              <Text style={styles.sectionValue} numberOfLines={1}>
                {`https://${ExpoLinking.parse(vm?.links.homepage[0]).hostname}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : vm?.loading ? (
          <Skeleton style={{ flex: 1, width: '100%', height: 19, marginTop: 2 }} />
        ) : undefined}

        {vm?.links?.twitter_screen_name ? (
          <View style={styles.sectionItem}>
            <View style={styles.sectionItem}>
              <Ionicons name="logo-twitter" style={styles.icon} />
              <Text style={styles.sectionValue}>Twitter</Text>
            </View>

            <TouchableOpacity
              style={styles.sectionItem}
              onPress={() => openInappBrowser(`https://twitter.com/${vm?.links!.twitter_screen_name}`, 'wallet')}
            >
              <Text style={styles.sectionValue} numberOfLines={1}>
                {`@${vm?.links.twitter_screen_name}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : undefined}

        {vm?.links?.subreddit_url && isURL(vm?.links.subreddit_url) ? (
          <View style={styles.sectionItem}>
            <View style={styles.sectionItem}>
              <Ionicons name="logo-reddit" style={styles.icon} />
              <Text style={styles.sectionValue}>Reddit</Text>
            </View>

            <TouchableOpacity style={styles.sectionItem} onPress={() => openInappBrowser(vm?.links!.subreddit_url, 'wallet')}>
              <Text style={styles.sectionValue} numberOfLines={1}>
                {`/r/${vm?.links.subreddit_url
                  .split('/')
                  .filter((i) => i)
                  .pop()}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : undefined}

        {vm?.links?.facebook_username ? (
          <View style={styles.sectionItem}>
            <View style={styles.sectionItem}>
              <Ionicons name="logo-facebook" style={styles.icon} />
              <Text style={styles.sectionValue}>Facebook</Text>
            </View>

            <TouchableOpacity
              style={styles.sectionItem}
              onPress={() => openInappBrowser(`https://facebook.com/${vm?.links?.facebook_username}`, 'wallet')}
            >
              <Text style={styles.sectionValue} numberOfLines={1}>
                {`@${vm?.links.facebook_username}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : undefined}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  subTitle: {
    color: thirdFontColor,
    opacity: 0.72,
    fontWeight: '500',
    fontSize: 15,
  },

  subValue: {
    fontSize: 17,
    fontWeight: '500',
  },

  sectionTitle: { fontSize: 21, marginTop: 12, color: '#75869c', fontWeight: '600', opacity: 0.72 },

  sectionItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },

  sectionValue: {
    lineHeight: 22,
    color: '#75869c',
    fontSize: 15,
    maxWidth: 200,
  },

  icon: {
    marginEnd: 8,
    color: '#75869c',
  },
});
