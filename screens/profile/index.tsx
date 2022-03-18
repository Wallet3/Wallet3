import { Github, Opensea, Twitter } from '../../assets/3rd';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { secondaryFontColor, thirdFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import CachedImage from 'react-native-fast-image';
import CopyableText from '../../components/CopyableText';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/Networks';
import { Skeleton } from '../../components';
import { StatusBar } from 'expo-status-bar';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import icons from '../../assets/icons/crypto';
import { observer } from 'mobx-react-lite';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(() => {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { currentAccount } = App;
  const { ens } = currentAccount || {};

  const { t } = i18n;
  const { current } = Networks;

  useEffect(() => {
    ens?.fetchMoreInfo();
    return () => {};
  }, []);

  const addresses = [
    ['eth', currentAccount?.address || ''],
    ['btc', ens?.coins['btc'] || ''],
  ];

  return (
    <View style={{ backgroundColor: '#fff', flex: 1, paddingHorizontal: 16 }}>
      <View
        style={{
          paddingTop: top + headerHeight,
          backgroundColor: 'dodgerblue',
          position: 'relative',
          marginBottom: 48,
          marginHorizontal: -16,
        }}
      >
        <View
          style={{
            marginHorizontal: 16,
            bottom: -37,
            position: 'absolute',
            borderRadius: 200,
            padding: 0,
            borderWidth: 3,
            borderColor: '#fff',
          }}
        >
          {currentAccount?.avatar ? (
            <CachedImage
              source={currentAccount?.avatar ? { uri: currentAccount?.avatar } : icons[current.symbol.toLowerCase()]}
              style={{
                width: 64,
                height: 64,
                borderRadius: 200,
                backgroundColor: current.color,
              }}
            />
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 200,
                backgroundColor: currentAccount?.emojiColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>{currentAccount?.emojiAvatar}</Text>
            </View>
          )}
        </View>
      </View>

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            {ens?.name ? <Text style={{ fontSize: 17, fontWeight: '500', marginEnd: 8 }}>{ens?.name}</Text> : undefined}
            <Text style={{ fontSize: 15, color: secondaryFontColor }}>
              {formatAddress(currentAccount?.address || '', 7, 5)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="location" size={15} color="dodgerblue" style={{ marginEnd: 4 }} />
            <Text style={{ fontSize: 14, color: 'dodgerblue' }}>{ens?.location || 'Unknown'}</Text>
          </View>
        </View>

        {ens?.loading ? (
          <Skeleton style={{ height: 19, marginTop: 8 }} />
        ) : (
          <Text style={{ lineHeight: 19, marginTop: 8, color: thirdFontColor }} numberOfLines={2}>
            {ens?.description || 'No description'}
          </Text>
        )}
      </View>

      <Text style={styles.subtitle}>{t('profile-accounts')}</Text>

      <View style={styles.contentWrapper}>
        {ens?.twitter ? (
          <TouchableOpacity style={styles.socialContainer}>
            <Twitter width={20} height={20} />
            <Text style={styles.socialTxt}>{ens?.twitter}</Text>
          </TouchableOpacity>
        ) : undefined}

        <TouchableOpacity style={styles.socialContainer}>
          <Opensea width={20} height={20} />
          <Text style={styles.socialTxt}>{ens?.name || formatAddress(currentAccount?.address ?? '', 9, 5)}</Text>
        </TouchableOpacity>

        {ens?.github ? (
          <TouchableOpacity style={styles.socialContainer}>
            <Github width={20} height={20} />
            <Text style={styles.socialTxt}>{ens?.github}</Text>
          </TouchableOpacity>
        ) : undefined}
      </View>

      <Text style={styles.subtitle}>{t('profile-addresses')}</Text>

      <View style={styles.contentWrapper}>
        {addresses
          .filter(([_, addr]) => addr)
          .map(([symbol, address]) => {
            return (
              <View style={styles.socialContainer} key={`${symbol}-${address}`}>
                <Image source={icons[symbol]} style={styles.coin} />
                <CopyableText
                  copyText={address}
                  title={formatAddress(address || '', 6, 4)}
                  iconStyle={{ marginStart: 5 }}
                  iconColor="black"
                />
              </View>
            );
          })}
      </View>

      <Text style={styles.subtitle}>{t('profile-more-records')}</Text>
      <View style={styles.contentWrapper}></View>

      <StatusBar style="light" />
    </View>
  );
});

const styles = StyleSheet.create({
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#efefef',
    borderRadius: 15,
    marginEnd: 12,
  },

  socialTxt: {
    marginStart: 8,
  },

  subtitle: {
    marginTop: 24,
    color: secondaryFontColor,
  },

  contentWrapper: {
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    flexDirection: 'row',
  },

  coin: {
    width: 20,
    height: 20,
    marginEnd: 8,
  },
});
