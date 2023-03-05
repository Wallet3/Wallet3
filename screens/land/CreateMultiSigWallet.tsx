import { Button, Loader, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { openKeyRecoveryRequestor, openShardsDistributors } from '../../common/Modals';
import { secondaryFontColor, secureColor, thirdFontColor, verifiedColor } from '../../constants/styles';

import IllustrationNomad from '../../assets/illustrations/tss/nomad.svg';
import IllustrationPartying from '../../assets/illustrations/misc/partying.svg';
import IllustrationWorld from '../../assets/illustrations/tss/world.svg';
import { KeyRecoveryRequestor } from '../../viewmodels/tss/KeyRecoveryRequestor';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import MultiWalletQRScan from './modals/MultiWalletQRScan';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import { ShardsDistributor } from '../../viewmodels/tss/ShardsDistributor';
import Swiper from 'react-native-swiper';
import { getSecureRandomBytes } from '../../utils/math';
import i18n from '../../i18n';
import { logCreateMultiSigWallet } from '../../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';
import { sleep } from '../../utils/async';
import { useModalize } from 'react-native-modalize';
import { useNavigation } from '@react-navigation/native';
import { utils } from 'ethers';

export default observer(() => {
  const { t } = i18n;
  const navigation = useNavigation<any>();
  const [busy, setBusy] = useState(false);
  const { ref, open: openQRScan, close: closeQRScan } = useModalize();

  const { width: screenWidth, height: screenHeight } = ReactiveScreen;

  const create = async () => {
    setBusy(true);

    await sleep(100);
    const vm = new ShardsDistributor({ mnemonic: utils.entropyToMnemonic(getSecureRandomBytes(32)) });
    vm.once('secretDistributed', () => {
      setTimeout(() => navigation.navigate('SetupPasscode'), 500);
      logCreateMultiSigWallet({ threshold: `${vm.threshold}/${vm.approvedClients.length}` });
    });
    await sleep(50);

    setBusy(false);
    openShardsDistributors({ vm });
  };

  const openKeyRequestor = () => {
    const vm = new KeyRecoveryRequestor();
    openKeyRecoveryRequestor({ vm });
  };

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
        title={t('land-welcome-restore-multiSig-via-qrcode')}
        onPress={() => openQRScan()}
        themeColor={secondaryFontColor}
        style={{ marginBottom: 12 }}
        txtStyle={{ textTransform: 'none' }}
        reverse
      />

      <Button
        title={t('land-welcome-restore-multiSig-via-network')}
        onPress={() => openKeyRequestor()}
        themeColor={verifiedColor}
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
          modalStyle={{
            borderTopStartRadius: 0,
            borderTopEndRadius: 0,
            backgroundColor: '#000',
            flex: 1,
            flexGrow: 1,
          }}
        >
          <MultiWalletQRScan close={closeQRScan} onBusy={setBusy} />
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
