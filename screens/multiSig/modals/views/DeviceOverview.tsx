import { Text, View } from 'react-native';

import { ButtonV2 } from '../../../../components';
import { ClientInfo } from '../../../../common/p2p/Constants';
import Device from '../../../../components/Device';
import { FadeInDownView } from '../../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput } from 'react-native-gesture-handler';
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
  onDeviceNameChanged?: () => void;
}

export const DeviceOverview = ({
  deviceInfo,
  createdAt,
  lastUsedAt,
  onNext,
  buttonTitle,
  disableButton,
  expired,
  onDeviceNameChanged,
}: Props) => {
  const { secondaryTextColor } = Theme;
  const { t } = i18n;
  const safeBottom = useOptimizedSafeBottom();

  return (
    <FadeInDownView style={{ flex: 1 }} delay={300}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Device deviceId={deviceInfo.device} os={deviceInfo!.rn_os!} style={{ width: 108, height: 150 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <TextInput
            defaultValue={deviceInfo.name}
            placeholder={'-----'}
            maxLength={32}
            onChangeText={(t) => (deviceInfo.name = t.trim())}
            onBlur={() => deviceInfo.name && onDeviceNameChanged?.()}
            style={{
              minWidth: 16,
              maxWidth: 200,
              textAlign: 'center',
              textDecorationStyle: 'dotted',
              textDecorationLine: 'underline',
              textDecorationColor: secondaryTextColor,
            }}
          />

          <Ionicons
            name="pencil-outline"
            color={secondaryTextColor}
            style={{ marginStart: 2, marginEnd: 8, marginBottom: 0, opacity: 0.75 }}
          />

          <Text style={{ fontWeight: '500', color: secondaryTextColor }}>{`${deviceInfo.os} ${deviceInfo.osVersion}`}</Text>
        </View>

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
