import { Text, View } from 'react-native';

import { ButtonV2 } from '../../../../components';
import { ClientInfo } from '../../../../common/p2p/Constants';
import Device from '../../../../components/Device';
import { FadeInDownView } from '../../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { useOptimizedSafeBottom } from '../../../../utils/hardware';
import { warningColor } from '../../../../constants/styles';

interface Props {
  deviceInfo: ClientInfo;
  buttonTitle: string;
  createdAt?: string;
  lastUsedAt?: string;
  onNext: () => void;
  disableButton?: boolean;
  expired?: boolean;
}

export const DeviceOverview = ({ deviceInfo, createdAt, lastUsedAt, onNext, buttonTitle, disableButton, expired }: Props) => {
  const { secondaryTextColor } = Theme;
  const { t } = i18n;
  const safeBottom = useOptimizedSafeBottom();

  return (
    <FadeInDownView style={{ flex: 1 }} delay={300}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Device deviceId={deviceInfo.device} os={deviceInfo!.rn_os!} style={{ width: 108, height: 150 }} />
        <Text style={{ marginTop: 16, fontWeight: '500', color: secondaryTextColor }}>
          {`${deviceInfo.name}, ${deviceInfo.os} ${deviceInfo.osVersion}`}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text
            style={{
              fontWeight: '500',
              color: expired ? warningColor : secondaryTextColor,
              fontSize: 12,
              textTransform: 'capitalize',
            }}
          >
            {`${t(createdAt ? 'multi-sig-modal-txt-created-time' : 'multi-sig-modal-txt-last-used-time')}: ${
              createdAt || lastUsedAt
            }`}
          </Text>
          {expired && <Ionicons name="warning" color={warningColor} size={15} style={{ marginStart: 8 }} />}
        </View>
      </View>

      <FadeInDownView delay={400}>
        <ButtonV2
          title={buttonTitle}
          style={{ marginBottom: safeBottom }}
          onPress={onNext}
          disabled={disableButton}
          icon={() => <Ionicons name="lock-closed" color="#fff" size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};
