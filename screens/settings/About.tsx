import { Feather, Ionicons } from '@expo/vector-icons';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Rarible } from '../../assets/3rd';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { thirdFontColor } from '../../constants/styles';

export function About() {
  const { t } = i18n;
  let { textColor, isLightMode, foregroundColor, thirdTextColor } = Theme;

  textColor = isLightMode ? thirdTextColor : textColor;
  const txtStyle = { ...styles.txt, color: textColor };

  return (
    <SafeViewContainer paddingHeader style={{ paddingEnd: 0, paddingBottom: 0 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ fontWeight: '500', color: textColor, fontSize: 16 }}>{t('about-slogan')}</Text>

        <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: textColor }}>
          {t('about-features')}
        </Text>

        <View style={styles.item}>
          <Feather name="box" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-1')}</Text>
        </View>

        <View style={{ ...styles.item }}>
          <Feather name="compass" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-6')}</Text>
        </View>

        <View style={styles.item}>
          <Feather name="link-2" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-2')}</Text>
        </View>

        <View style={styles.item}>
          <Feather name="cpu" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-3')}</Text>
        </View>

        <View style={styles.item}>
          <Ionicons name="shield-checkmark-outline" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-4')}</Text>
        </View>

        <View style={styles.item}>
          <Ionicons name="logo-github" size={16} color={textColor} style={{ marginTop: 1 }} />
          <Text style={txtStyle}>{t('about-features-5')}</Text>
        </View>

        <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: textColor }}>
          {t('about-data-providers')}
        </Text>

        <View style={{ ...styles.item, height: 40, alignItems: 'center' }}>
          <Image
            source={require('../../assets/3rd/debank-logo.png')}
            style={{ width: 190, resizeMode: 'contain', marginStart: -30 }}
          />
          <Image
            source={require('../../assets/3rd/coingecko.png')}
            style={{ width: 150, resizeMode: 'contain', marginEnd: 32, marginStart: 0 }}
          />
        </View>

        <View style={{ ...styles.item, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Rarible width={36} height={36} />
            <Text style={{ fontSize: 24, fontWeight: '600', marginStart: 10, color: foregroundColor }}>Rarible</Text>
          </View>
        </View>

        <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: textColor }}>
          {t('about-support')}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ paddingVertical: 8, marginEnd: 12 }}
            onPress={() => Linking.openURL('https://twitter.com/wallet3_io')}
          >
            <Ionicons name="logo-twitter" size={24} color="#00acee" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            onPress={() => Linking.openURL('mailto:support@chainbow.io')}
          >
            <Ionicons name="mail" size={24} color="tomato" />
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 24, color: textColor, fontSize: 12 }}>
          ©️ 2021-{new Date().getFullYear()} ChainBow Co., Ltd.
        </Text>
      </ScrollView>
    </SafeViewContainer>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    marginStart: 8,
    fontSize: 16,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    marginEnd: 12,
  },
});
