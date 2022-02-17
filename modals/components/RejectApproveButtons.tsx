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
  swipeConfirm?: boolean;
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
  swipeConfirm,
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
        onSwipeSuccess={swipeConfirm ? onApprove : undefined}
        style={{ flex: swipeConfirm ? 11 : 10 }}
        themeColor={themeColor}
        icon={approveIcon}
      />
    </View>
  );
};
