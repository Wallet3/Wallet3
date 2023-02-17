import { ButtonV2, Loader, SafeViewContainer } from '../../components';
import { FlatList, Text, View } from 'react-native';
import React, { useState } from 'react';
import { openGlobalPasspad, openShardsDistributors } from '../../common/Modals';

import App from '../../viewmodels/core/App';
import IllustrationUpgrade from '../../assets/illustrations/misc/upgrade.svg';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../constants/styles';
import { sleep } from '../../utils/async';

export default observer(() => {
  const [busy, setBusy] = useState(false);

  const { currentWallet } = App;
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;
  const { t } = i18n;

  const openShardsDistributor = async () => {
    let secret: string | undefined;

    const getSecret = async (pin?: string) => {
      secret = await currentWallet?.getSecret(pin);
      return secret !== undefined;
    };

    if (!(await openGlobalPasspad({ onAutoAuthRequest: getSecret, onPinEntered: getSecret, closeOnOverlayTap: true }))) return;

    setBusy(true);
    await sleep(200);

    openShardsDistributors(secret!);

    setBusy(false);
  };

  return (
    <SafeViewContainer>
      {!currentWallet?.isMultiSig && (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <IllustrationUpgrade width={150} height={150} />
          <Text
            style={{
              color: secondaryTextColor,
              fontWeight: '500',
              marginTop: 24,
              marginHorizontal: 16,
              textAlignVertical: 'center',
            }}
          >
            <Ionicons name="arrow-up-circle" size={15} />
            {`${t('multi-sig-screen-tip-upgrade-to-multi-sig-wallet')}`}
          </Text>
        </View>
      )}

      {currentWallet?.isMultiSig && <FlatList style={{}} data={[]} renderItem={(i) => <View />} />}

      <ButtonV2
        title={t('button-upgrade')}
        style={{ marginTop: 12 }}
        themeColor={secureColor}
        icon={() => <Ionicons name="arrow-up-circle-outline" color="#fff" size={19} />}
        onPress={openShardsDistributor}
      />

      <Loader loading={busy} message={t('msg-data-loading')} />
    </SafeViewContainer>
  );
});
