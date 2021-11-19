import { ScrollView, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default ({ exception }: { exception: string }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        borderRadius: 10,
        marginTop: 12,
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: 'crimson',
        paddingBottom: 0,
      }}
      contentContainerStyle={{ alignItems: 'center', marginTop: -11 }}
    >
      <Ionicons name="alert-circle" color="white" size={16} />
      <Text style={{ color: 'white', marginStart: 8, fontSize: 12 }}>{exception}</Text>
    </ScrollView>
  );
};
