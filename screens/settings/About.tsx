import { Feather, Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { secondaryFontColor, themeColor, thirdFontColor } from '../../constants/styles';

import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';

export function About() {
  const { t } = i18n;
  let { textColor, isLightMode } = Theme;

  textColor = isLightMode ? thirdFontColor : textColor;
  const txtStyle = { ...styles.txt, color: textColor };

  return (
    <SafeViewContainer paddingHeader style={{}}>
      <Text style={{ fontWeight: '500', color: textColor, fontSize: 16 }}>{t('about-slogan')}</Text>

      <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: textColor }}>
        {t('about-features')}
      </Text>

      <View style={styles.item}>
        <Feather name="box" size={16} color={textColor} />
        <Text style={txtStyle}>{t('about-features-1')}</Text>
      </View>

      <View style={styles.item}>
        <Feather name="link-2" size={16} color={textColor} />
        <Text style={txtStyle}>{t('about-features-2')}</Text>
      </View>

      <View style={styles.item}>
        <Feather name="cpu" size={16} color={textColor} />
        <Text style={txtStyle}>{t('about-features-3')}</Text>
      </View>

      <View style={styles.item}>
        <Ionicons name="shield-checkmark-outline" size={16} color={textColor} />
        <Text style={txtStyle}>{t('about-features-4')}</Text>
      </View>

      <View style={styles.item}>
        <Ionicons name="logo-github" size={16} color={textColor} />
        <Text style={txtStyle}>{t('about-features-5')}</Text>
      </View>

      <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: textColor }}>
        {t('about-data-providers')}
      </Text>

      <View style={{ ...styles.item, height: 40 }}>
        <Image
          source={require('../../assets/3rd/debank-logo.png')}
          style={{ width: 190, resizeMode: 'contain', marginStart: -30 }}
        />
        <Image
          source={require('../../assets/3rd/coingecko.png')}
          style={{ width: 150, resizeMode: 'contain', marginStart: 0 }}
        />
      </View>

      <Text style={{ marginTop: 24, color: textColor, fontSize: 12 }}>
        ©️ 2021-{new Date().getFullYear()} ChainBow Co., Ltd.
      </Text>
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
    alignItems: 'center',
    marginVertical: 6,
  },
});
