import { Button, Placeholder, SafeViewContainer } from '../../components';
import { StyleSheet, Text, View } from 'react-native';
import { secondaryFontColor, secureColor, themeColor, thirdFontColor } from '../../constants/styles';

import IllustrationNomad from '../../assets/illustrations/tss/nomad.svg';
import IllustrationPartying from '../../assets/illustrations/misc/partying.svg';
import IllustrationWorld from '../../assets/illustrations/tss/world.svg';
import React from 'react';
import Swiper from 'react-native-swiper';
import i18n from '../../i18n';
import { useNavigation } from '@react-navigation/native';

export default () => {
  const { t } = i18n;
  const navigation = useNavigation<any>();

  return (
    <SafeViewContainer style={{ flex: 1, backgroundColor: '#fff' }} paddingHeader>
      <Swiper
        containerStyle={{ marginHorizontal: -16, flexGrow: 1 }}
        contentContainerStyle={{ flex: 1, flexGrow: 1 }}
        autoplay
        autoplayTimeout={7}
        paginationStyle={{ marginBottom: -10 }}
        activeDotColor={secureColor}
        dotStyle={{ backgroundColor: `${secureColor}40` }}
      >
        <View style={styles.viewItem}>
          <IllustrationPartying width={200} height={200} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.txt}>{t('land-create-multi-sig-txt-1')}</Text>
        </View>

        <View style={styles.viewItem}>
          <IllustrationWorld width={200} height={200} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.txt}>{t('land-create-multi-sig-txt-2')}</Text>
        </View>

        <View style={styles.viewItem}>
          <IllustrationNomad width={200} height={200} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.txt}>{t('land-create-multi-sig-txt-3')}</Text>
        </View>
      </Swiper>

      <Button
        title={t('land-welcome-import-wallet')}
        onPress={() => navigation.navigate('ImportWallet')}
        themeColor={secureColor}
        style={{ marginBottom: 12 }}
        txtStyle={{ textTransform: 'none' }}
        reverse
      />

      <Button title={t('button-start')} onPress={() => {}} themeColor={secureColor} txtStyle={{ textTransform: 'none' }} />
    </SafeViewContainer>
  );
};

const styles = StyleSheet.create({
  txt: {
    fontSize: 15,
    color: thirdFontColor,
    lineHeight: 19,
    marginBottom: 12,
    marginHorizontal: 16,
    alignSelf: 'center',
    textAlign: 'center',
    maxWidth: 320,
  },

  viewItem: {
    flex: 1,
    justifyContent: 'center',
  },
});
