import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import React from 'react';
import Ripple from 'react-native-material-ripple';
import { themeColor } from '../../../constants/styles';

interface Props {
  style?: StyleProp<ViewStyle>;
  onSendPress?: () => void;
  onRequestPress?: () => void;
}

export default (props: Props) => {
  return (
    <SafeAreaView style={{ ...styles.container, ...((props?.style as any) || {}) }}>
      <Ripple style={styles.button} rippleContainerBorderRadius={20} onPress={(_) => props?.onSendPress?.()}>
        <Ionicons name="md-arrow-up-circle-outline" size={20} color="white" />
        <Text style={styles.text}>Send</Text>
      </Ripple>

      <View style={{ flex: 1 }}></View>

      <Ripple style={styles.button} rippleContainerBorderRadius={20} onPress={(_) => props?.onRequestPress?.()}>
        <Ionicons name="md-arrow-down-circle-outline" size={20} color="white" />
        <Text style={styles.text}>Request</Text>
      </Ripple>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },

  button: {
    flex: 12,
    borderRadius: 24,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    backgroundColor: themeColor,
  },

  text: {
    color: 'white',
    marginStart: 6,
    fontSize: 17,
    fontWeight: '500',
  },
});
