import { ScrollView, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default ({ exception }: { exception: string }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={{ alignItems: 'center', marginVertical: -12, paddingHorizontal: 16 }}
      style={{
        borderRadius: 10,
        marginTop: 12,
        backgroundColor: 'crimson',
      }}
    >
      <Ionicons name="alert-circle" color="white" size={16} />
      <Text style={{ color: 'white', marginStart: 8, fontSize: 12 }}>{exception}</Text>
    </ScrollView>
  );
};
