import { ButtonV2, Loader, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import App from '../../viewmodels/core/App';
import IllustrationUpgrade from '../../assets/illustrations/misc/upgrade.svg';
import { Ionicons } from '@expo/vector-icons';
import { MultiSigWalletUpgrader } from '../../viewmodels/tss/adapters/MultiSigWalletUpgrader';
import { SingleSigWallet } from '../../viewmodels/wallet/SingleSigWallet';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../common/Modals';
import { secureColor } from '../../constants/styles';
import { sleep } from '../../utils/async';

export default observer(({ onNextPage }: { onNextPage?: () => void }) => {
  const [busy, setBusy] = useState(false);

  const { currentWallet } = App;
  const { secondaryTextColor, appColor } = Theme;
  const { t } = i18n;

  const execUpgrade = async () => {
    let secret: string | undefined;

    const getSecret = async (pin?: string) => {
      secret = await currentWallet?.getSecret(pin);
      return secret !== undefined;
    };

    if (!(await openGlobalPasspad({ onAutoAuthRequest: getSecret, onPinEntered: getSecret }))) return;

    setBusy(true);
    await sleep(200);

    const upgrader = new MultiSigWalletUpgrader(currentWallet as SingleSigWallet, secret!);
    upgrader.execUpgrade();

    setBusy(false);
  };

  return (
    <SafeViewContainer>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <IllustrationUpgrade width={150} height={150} />

        <Text style={{ color: secondaryTextColor, ...styles.txt }}>
          <Ionicons name="arrow-up-circle" size={15} />
          {`  ${t('multi-sig-screen-tip-upgrade-to-multi-sig-wallet')}`}
        </Text>

        <Text style={{ color: secondaryTextColor, ...styles.txt, marginTop: 24 }}>
          <Ionicons name="information-circle" size={15} />
          {`  ${t('multi-sig-screen-tip-after-upgrading')}`}
        </Text>

        <TouchableOpacity
          onPress={onNextPage}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: appColor,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 5,
          }}
        >
          <Ionicons name="phone-portrait-outline" size={15} color={'#fff'} />
          <Text style={{ color: '#fff', marginHorizontal: 4, fontWeight: '500', fontSize: 12, textTransform: 'uppercase' }}>
            {t('multi-sig-screen-paired-devices')}
          </Text>
          <Ionicons name="arrow-forward" color={'#fff'} size={14} />
        </TouchableOpacity>
      </View>

      <ButtonV2
        title={t('button-upgrade')}
        style={{ marginTop: 12 }}
        themeColor={secureColor}
        icon={() => <Ionicons name="arrow-up-circle-outline" color="#fff" size={19} />}
        onPress={execUpgrade}
      />

      <Loader loading={busy} message={t('msg-data-loading')} />
    </SafeViewContainer>
  );
});

const styles = StyleSheet.create({
  txt: {
    fontWeight: '500',
    marginTop: 36,
    marginHorizontal: 16,
    width: 320,
  },
});
