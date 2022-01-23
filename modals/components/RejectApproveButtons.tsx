import { Button } from '../../components';
import React from 'react';
import { View } from 'react-native';

interface Props {
  onReject?: () => void;
  onApprove?: () => void;
  rejectTitle?: string;
  approveTitle?: string;
  themeColor?: string;
  disabledApprove?: boolean;
  longConfirm?: boolean;
  approveIcon?: () => JSX.Element;
}

export default ({
  onReject,
  onApprove,
  themeColor,
  rejectTitle,
  approveTitle,
  disabledApprove,
  longConfirm,
  approveIcon,
}: Props) => {
  return (
    <View style={{ flexDirection: 'row', marginTop: 12 }}>
      <Button title={rejectTitle} onPress={onReject} reverse themeColor={themeColor} style={{ flex: 10 }} />

      <View style={{ width: 12 }} />

      <Button
        title={approveTitle}
        disabled={disabledApprove}
        onPress={longConfirm ? undefined : onApprove}
        onLongPress={longConfirm ? onApprove : undefined}
        style={{ flex: 10 }}
        themeColor={themeColor}
        icon={approveIcon}
      />
    </View>
  );
};
