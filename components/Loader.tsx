import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import React from 'react';

interface Props {
  loading?: boolean;
  message?: string;
}

export default ({ loading, message }: Props) => {
  return (
    <Modal transparent={true} animationType={'none'} visible={loading}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} />
          <Text style={{ marginTop: 20 }}>{message}</Text>
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 21,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
