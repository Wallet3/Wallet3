import { Button, NullableImage } from '../../components';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, secondaryFontColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountIndicator from '../components/AccountIndicator';
import { PageMetadata } from '../../screens/browser/Web3View';
import { ParsedMessage } from '../../utils/siwe';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  rawMsg: string;
  metadata?: PageMetadata;
  siwe: ParsedMessage;
  account?: Account;
}

export default observer(({ metadata, siwe, account, rawMsg }: Props) => {
  const swiper = useRef<Swiper>(null);
  const { backgroundColor, foregroundColor, tintColor, borderColor } = Theme;
  const consistent = siwe.domain === metadata?.origin;
  const { t } = i18n;
  console.log(siwe.domain, metadata?.hostname, metadata);

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View />
          {account && <AccountIndicator account={account} />}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <NullableImage
            size={72}
            uri={metadata?.icon}
            text={metadata?.title || metadata?.hostname}
            fontSize={36}
            imageRadius={5}
            fontStyle={{ marginTop: 2, marginStart: 2 }}
            containerStyle={{ marginBottom: 29 }}
            imageBackgroundColor={backgroundColor}
          />

          {consistent ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...styles.text, fontWeight: '500', color: foregroundColor }}>
                {`${siwe.domain} wants you to Sign-In with Ethereum`}
              </Text>

              <Text style={{ ...styles.text, fontSize: 12, fontWeight: '400', marginTop: 16, color: secondaryFontColor }}>
                {`Click Sign-In to complete this request `}
              </Text>
            </View>
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ ...styles.text, color: '#aaaaaac0', fontWeight: '500' }} numberOfLines={1}>
                {`${siwe.domain} wants you to Sign-In with Ethereum`}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons name="warning" color={'crimson'} size={15} style={{ marginEnd: 4 }} />
                <Text numberOfLines={2} style={{ ...styles.text, fontSize: 16, color: 'crimson' }}>
                  {`Warning: ${siwe.domain} is not match ${metadata?.origin}`}
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
          <Text style={{ color: consistent ? secondaryFontColor : 'crimson', marginEnd: 3 }}>See details</Text>
          <Ionicons name="chevron-forward" size={10} color={consistent ? secondaryFontColor : 'crimson'} />
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', height: '100%' }}>
        <View
          style={{
            paddingBottom: 5,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FontAwesome5 name="ethereum" size={25} color={tintColor} />
          <Text style={{ fontSize: 21, color: tintColor, fontWeight: '500', marginStart: 8 }}>
            {t('modal-message-signing-sign-in-with-ethereum')}
          </Text>
        </View>

        <ScrollView
          style={{ width: '100%', height: '100%' }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <Text style={{ color: thirdFontColor }}>{rawMsg}</Text>
        </ScrollView>
      </View>
    </Swiper>
  );
});

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
  },
});
