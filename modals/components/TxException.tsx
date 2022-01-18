import { ScrollView, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default ({ exception }: { exception: string }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
      bounces={false}
      contentContainerStyle={{ alignItems: 'center', marginVertical: -12, paddingHorizontal: 16 }}
      style={{
        borderRadius: 10,
        marginTop: 8,
        backgroundColor: 'crimson',
        minHeight: 22,
        maxHeight: 30,
      }}
    >
      <Ionicons name="alert-circle" color="white" size={16} style={{ marginBottom: -1 }} />
      <Text style={{ color: 'white', marginStart: 8, fontSize: 12 }}>{exception}</Text>
    </ScrollView>
  );
};
