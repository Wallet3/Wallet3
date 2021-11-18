import { Button } from '../../components';
import React from 'react';
import { View } from 'react-native';

export default ({
  onReject,
  onApprove,
  themeColor,
  rejectTitle,
  approveTitle,
}: {
  onReject?: () => void;
  onApprove?: () => void;
  rejectTitle?: string;
  approveTitle?: string;
  themeColor?: string;
}) => {
  return (
    <View style={{ flexDirection: 'row', marginTop: 12 }}>
      <Button title={rejectTitle} onPress={onReject} reverse themeColor={themeColor} style={{ flex: 10 }} />
      <View style={{ width: 12 }} />
      <Button title={approveTitle} onPress={onApprove} style={{ flex: 10 }} themeColor={themeColor} />
    </View>
  );
};
