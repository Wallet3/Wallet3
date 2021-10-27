import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor } from '../../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import styles from '../styles';

export default () => {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 0 }}>
      <TouchableOpacity style={styles.navBar}>
        <Ionicons name="chevron-back-outline" size={24} />
        <Text style={styles.navTitle}>Back</Text>
      </TouchableOpacity>

      <TextInput
        multiline={true}
        numberOfLines={5}
        style={{
          height: 200,
          textAlignVertical: 'top',
          borderWidth: 1,
          borderColor: themeColor,
          borderRadius: 10,
          padding: 8,
          paddingVertical: 24,
          fontSize: 15,
        }}
        autoCapitalize="none"
        keyboardType="default"
      />
    </View>
  );
};
