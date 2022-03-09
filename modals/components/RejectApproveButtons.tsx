import { Button } from '../../components';
import React from 'react';
import { ReactiveScreen } from '../../utils/device';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

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

export default observer(
  ({
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
    const { width } = ReactiveScreen;
    const buttonWidth = (width - 32 - 12) / 2;

    return (
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Button title={rejectTitle} onPress={onReject} reverse themeColor={themeColor} style={{ width: buttonWidth }} />

        <View style={{ width: 12 }} />

        <Button
          title={approveTitle}
          disabled={disabledApprove}
          onPress={longConfirm ? undefined : onApprove}
          onLongPress={longConfirm ? onApprove : undefined}
          onSwipeSuccess={swipeConfirm ? onApprove : undefined}
          style={{ width: buttonWidth }}
          themeColor={themeColor}
          icon={approveIcon}
        />
      </View>
    );
  }
);
