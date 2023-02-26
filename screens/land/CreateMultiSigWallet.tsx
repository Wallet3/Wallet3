import { Button, Loader, Placeholder, SafeViewContainer } from '../../components';
import { FadeInDownView, ZoomInView } from '../../components/animations';
import React, { useEffect, useState } from 'react';
import Scanner, { BarCodeScanningResult } from '../../components/Scanner';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { secondaryFontColor, secureColor, themeColor, thirdFontColor, verifiedColor } from '../../constants/styles';

import { AntDesign } from '@expo/vector-icons';
import IllustrationNomad from '../../assets/illustrations/tss/nomad.svg';
import IllustrationPartying from '../../assets/illustrations/misc/partying.svg';
import IllustrationWorld from '../../assets/illustrations/tss/world.svg';
import Loading from '../../modals/views/Loading';
import LottieView from 'lottie-react-native';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { Portal } from 'react-native-portalize';
import { QRCodeShardAggregator } from '../../viewmodels/tss/QRCodeShardAggregator';
import { QRScan } from '../../modals';
import { ReactiveScreen } from '../../utils/device';
import { ShardsDistributor } from '../../viewmodels/tss/ShardsDistributor';
import Swiper from 'react-native-swiper';
import { getRandomBytes } from 'expo-crypto';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openShardsDistributors } from '../../common/Modals';
import { sleep } from '../../utils/async';
import { useModalize } from 'react-native-modalize';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { utils } from 'ethers';

export default observer(() => {
  const { t } = i18n;
  const navigation = useNavigation<any>();
  const [busy, setBusy] = useState(false);
  const { ref, open, close } = useModalize();
  const { top } = useSafeAreaInsets();
  const [added, setAdded] = useState(false);
  const { width: screenWidth, height: screenHeight } = ReactiveScreen;

  const [aggregator] = useState(new QRCodeShardAggregator());

  const create = async () => {
    setBusy(true);

    await sleep(100);
    const vm = new ShardsDistributor({ mnemonic: utils.entropyToMnemonic(getRandomBytes(32)) });
    vm.once('secretDistributed', () => setTimeout(() => navigation.navigate('SetupPasscode'), 500));
    await sleep(50);

    setBusy(false);
    openShardsDistributors({ vm, onClosed: () => vm.removeListener('secretDistributed') });
  };

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (!aggregator.add(data)) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  useEffect(() => {
    aggregator.once('combined', (mnemonic) => {});

    return () => {
      aggregator.removeAllListeners();
    };
  }, []);

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
        onPress={() => open()}
        themeColor={secureColor}
        style={{ marginBottom: 12 }}
        txtStyle={{ textTransform: 'none' }}
        reverse
      />

      <Button title={t('button-start')} onPress={create} themeColor={secureColor} txtStyle={{ textTransform: 'none' }} />

      <Loader loading={busy} message={t('msg-data-loading')} />

      <Portal>
        <ModalizeContainer
          ref={ref}
          modalHeight={screenHeight}
          adjustToContentHeight={undefined}
          withHandle={false}
          safeAreaStyle={{ flex: 1, backgroundColor: '#000', width: screenWidth, height: screenHeight }}
          onClosed={() => aggregator.clear()}
          modalStyle={{
            borderTopStartRadius: 0,
            borderTopEndRadius: 0,
            backgroundColor: '#000',
            flex: 1,
            flexGrow: 1,
          }}
        >
          <QRScan
            tip={t('qrscan-tip-paired-devices-qrcode')}
            handler={handleBarCodeScanned}
            close={close}
            style={{ position: 'absolute' }}
          />

          {added && (
            <ZoomInView
              style={{
                position: 'absolute',
                left: (screenWidth - 250) / 2,
                top: (screenHeight - 250) / 2,
              }}
            >
              <LottieView
                autoPlay
                loop={false}
                style={{ width: 250, height: 250 }}
                source={require('../../assets/animations/check-verde.json')}
              />
            </ZoomInView>
          )}

          <View
            style={{
              position: 'absolute',
              right: 16,
              top: top + 16,
              backgroundColor: `${verifiedColor}c0`,
              borderRadius: 15,
              paddingHorizontal: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {`${aggregator.count} / ${aggregator.threshold || 'n'}`}
            </Text>
          </View>
        </ModalizeContainer>
      </Portal>
    </SafeViewContainer>
  );
});

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

  tip: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginStart: 8,
  },
});
