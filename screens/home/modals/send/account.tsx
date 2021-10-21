import { Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor } from '../../../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default () => {
  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          position: 'relative',
          height: 42,
          borderColor,
          borderWidth: 1,
          borderRadius: 10,
          padding: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, color: secondaryFontColor, marginEnd: 12 }}>To:</Text>
        <TextInput style={{ fontSize: 20, flex: 1 }} />
        <Ionicons name="copy-outline" size={20} style={{ marginStart: 12, opacity: 0.5 }} />
      </View>
    </View>
  );
};
