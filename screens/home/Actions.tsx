import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import React from 'react';
import Ripple from 'react-native-material-ripple';
import i18n from '../../i18n';

interface Props {
  style?: StyleProp<ViewStyle>;
  onSendPress?: () => void;
  onRequestPress?: () => void;
  themeColor?: string;
  disabled?: boolean;
}

export default ({ style, onSendPress, onRequestPress, themeColor, disabled }: Props) => {
  const { t } = i18n;

  return (
    <SafeAreaView style={{ ...styles.container, ...((style as any) || {}) }}>
      <Ripple
        style={{ ...styles.button, backgroundColor: themeColor ?? themeColor }}
        rippleContainerBorderRadius={20}
        onPress={(_) => (disabled ? undefined : onSendPress?.())}
      >
        <Ionicons name="md-arrow-up-circle-outline" size={20} color="white" />
        <Text style={styles.text}>{t('button-send')}</Text>
      </Ripple>

      <View style={{ flex: 1 }}></View>

      <Ripple
        style={{ ...styles.button, backgroundColor: themeColor ?? themeColor }}
        rippleContainerBorderRadius={20}
        onPress={(_) => (disabled ? undefined : onRequestPress?.())}
      >
        <Ionicons name="md-arrow-down-circle-outline" size={20} color="white" />
        <Text style={styles.text}>{t('button-request')}</Text>
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
  },

  text: {
    color: 'white',
    marginStart: 6,
    fontSize: 17,
    fontWeight: '500',
  },
});
