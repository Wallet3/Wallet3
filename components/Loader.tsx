import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { verifiedColor } from '../constants/styles';

interface Props {
  loading?: boolean;
  message?: string;
}

export default ({ loading, message }: Props) => {
  return (
    <Modal transparent={true} animationType={'none'} visible={loading}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} color={verifiedColor} />
          <Text style={{ marginStart: 16, fontSize: 16, fontWeight: '500' }}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },

  activityIndicatorWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 36,
    paddingBottom: 33,
    borderRadius: 12.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
