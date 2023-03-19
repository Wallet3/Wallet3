import Authentication from '../../viewmodels/auth/Authentication';
import { Button } from '../../components';
import FaceID from '../../assets/icons/app/FaceID-white.svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import i18n from '../../i18n';

interface Props {
  onPress?: () => void;
  disabled?: boolean;
  themeColor?: string;
}
export default ({ onPress, disabled, themeColor }: Props) => {
  const { biometricType } = Authentication;
  const { t } = i18n;

  const sendTitle = biometricType === 'faceid' ? t('modal-review-button-slide-to-send') : t('modal-review-button-send');
  const onLongSendPress = biometricType === 'faceid' ? onPress : undefined;
  const onSendPress = biometricType === 'faceid' ? undefined : onPress;
  const authIcon = biometricType
    ? biometricType === 'fingerprint'
      ? () => <MaterialCommunityIcons name="fingerprint" size={19} color="#fff" />
      : () => <FaceID width={12.5} height={12.5} style={{ marginEnd: 4 }} />
    : undefined;

  return (
    <Button
      title={sendTitle}
      disabled={disabled}
      onPress={onSendPress}
      onLongPress={onLongSendPress}
      onSwipeSuccess={onLongSendPress}
      icon={authIcon}
      themeColor={themeColor}
    />
  );
};
