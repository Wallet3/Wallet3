import { ButtonV2, SafeViewContainer } from '../../components';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationPairing from '../../assets/illustrations/misc/pair_programming.svg';
import { Ionicons } from '@expo/vector-icons';
import MessageKeys from '../../common/MessageKeys';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { MultiSigWallet } from '../../viewmodels/wallet/MultiSigWallet';
import { PairedDevice } from '../../viewmodels/tss/management/PairedDevice';
import { PairedDeviceModal } from './modals';
import PairedDevices from '../../viewmodels/tss/management/PairedDevices';
import { Portal } from 'react-native-portalize';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize';
import { useOptimizedSafeBottom } from '../../utils/hardware';

export default ({ wallet }: { wallet: MultiSigWallet }) => {
  const { t } = i18n;
  const { appColor } = Theme;

  return (
    <SafeViewContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: appColor, marginVertical: 16 }}>
          {`${t('multi-sig-modal-txt-threshold')}: ${wallet.threshold} of ${wallet.trustedDevice.length}`}
        </Text>
      </View>
    </SafeViewContainer>
  );
};
