import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import React from 'react';

interface Props {
  style?: StyleProp<ViewStyle>;
  txtStyle?: StyleProp<TextStyle>;
  title?: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
  onPress?: () => void;
}

export default (props: Props) => {
  return (
    <TouchableOpacity
      onPress={() => props.onPress?.()}
      style={{
        ...styles.default,
        ...((props?.style as any) || {}),
        backgroundColor: props?.disabled
          ? 'lightgrey'
          : (props?.style as ViewStyle)?.backgroundColor || styles.default.backgroundColor,
      }}
    >
      {props?.icon}
      <Text style={{ ...styles.text, ...((props?.txtStyle as any) || {}) }}>{props?.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  default: {
    borderRadius: 7,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#627EEA',
  },

  text: {
    color: 'white',
    marginStart: 6,
    fontSize: 17,
    fontWeight: '500',
  },
});
