import { Button, NullableImage } from '../../components';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { PageMetadata } from '../../screens/browser/Web3View';
import { ParsedMessage } from '../../utils/siwe_plain';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  rawMsg: string;
  metadata?: { origin: string; icon: string; title: string };
  siwe: ParsedMessage;
  account?: Account;
  themeColor?: string;
}

export default observer(({ metadata, siwe, account, rawMsg, themeColor }: Props) => {
  const swiper = useRef<Swiper>(null);
  const { backgroundColor, foregroundColor, borderColor, secondaryTextColor, thirdTextColor } = Theme;
  const { t } = i18n;
  const { isConsistent } = siwe;

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      style={{ marginHorizontal: 0 }}
    >
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {isConsistent ? (
            <View />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="fish" size={10} color="crimson" />
              <Text style={{ fontSize: 10, color: 'crimson', fontWeight: '600', marginStart: 4 }}>
                {t('modal-siwe-phishing-warning')}
              </Text>
            </View>
          )}

          {account && <AccountIndicator account={account} />}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <NullableImage
            size={72}
            uri={metadata?.icon}
            text={metadata?.title || metadata?.origin}
            fontSize={36}
            imageRadius={5}
            fontStyle={{ marginTop: 2, marginStart: 2 }}
            containerStyle={{ marginBottom: 29 }}
            imageBackgroundColor={backgroundColor}
          />

          {isConsistent ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: foregroundColor, textAlign: 'center' }} numberOfLines={2}>
                {t('modal-siwe-request-msg', { domain: siwe.domain })}
              </Text>

              <Text style={{ fontSize: 12, marginTop: 12, color: secondaryTextColor }}>{siwe.statement}</Text>
            </View>
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#aaaaaac0', fontWeight: '500', fontSize: 12 }} numberOfLines={1}>
                {t('modal-siwe-request-msg', { domain: siwe.domain })}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, paddingHorizontal: 8 }}>
                <Ionicons name="warning" color={'crimson'} size={15} style={{ marginEnd: 4, marginTop: 2 }} />
                <Text numberOfLines={2} style={{ fontSize: 16, color: 'crimson', fontWeight: '500' }}>
                  {t('modal-siwe-warning-not-match', { domain: siwe.domain, origin: metadata?.origin })}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={() => swiper.current?.scrollTo(1)}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 12,
            margin: -12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: isConsistent ? secondaryTextColor : 'crimson', marginEnd: 3 }}>
            {t('modal-siwe-see-details')}
          </Text>
          <Ionicons name="chevron-forward" size={10} color={isConsistent ? secondaryTextColor : 'crimson'} />
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', height: '100%' }}>
        <View
          style={{
            ...styles.modalTitleContainer,
            borderBottomColor: borderColor,
            justifyContent: 'flex-start',
          }}
        >
          <FontAwesome5 name="ethereum" size={24} color={isConsistent ? themeColor : 'crimson'} />
          <Text style={{ fontSize: 21, color: isConsistent ? themeColor : 'crimson', fontWeight: '500', marginStart: 8 }}>
            {t('modal-siwe-title')}
          </Text>
        </View>

        <ScrollView
          style={{ width: '100%', height: '100%' }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <Text style={{ color: thirdTextColor }}>{rawMsg}</Text>
        </ScrollView>
      </View>
    </Swiper>
  );
});
