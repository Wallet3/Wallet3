import Animated, { FadeInUp } from 'react-native-reanimated';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { getScreenCornerRadius, useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../../utils/hardware';

import Aggregation from '../../aggregator/Aggregation';
import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import ModalRootContainer from '../../../core/ModalRootContainer';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../../viewmodels/tss/management/PairedDevices';
import { Passpad } from '../../../views';
import Preparations from '../requestor/Preparations';
import { ReactiveScreen } from '../../../../utils/device';
import RecoveryAggregation from '../requestor/RecoveryAggregation';
import { SafeViewContainer } from '../../../../components';
import ScrollTitles from '../../../components/ScrollTitles';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../../components/Utils';

interface Props {
  device: PairedDevice;
  service: Service;
}

export default ({ device, service }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;
  const [vm] = useState(new KeyRecoveryProvider({ service, shardKey: device.shard }));
  const marginHorizontal = useHorizontalPadding();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const cornerRadius = useOptimizedCornerRadius();

  useEffect(() => {}, []);

  const verifyPairingCode = async (code: string) => {
    const success = await vm.verifyPairingCode(code);
    setFailedAttempts((p) => p + (success ? 0 : 1));
    return success;
  };

  return (
    <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
      {vm.verified ? (
        <View>
          <Button title={t('button-next')} />
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: useOptimizedSafeBottom(), paddingHorizontal: 16 }}>
          <Passpad
            disableCancelButton
            passLength={4}
            failedAttempts={failedAttempts}
            style={{ padding: 0 }}
            numPadStyle={{ borderRadius: Math.max(cornerRadius, 12) }}
            onCodeEntered={verifyPairingCode}
          />
        </View>
      )}
    </View>
  );
};
