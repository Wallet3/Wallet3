import { Text, TouchableOpacity, View } from 'react-native';

import React from 'react';

interface Props {
  busy?: boolean;
}

export default (props: Props) => {
  return (
    <View>
      <TouchableOpacity style={{ flexDirection: 'row' }}>
        <Text>Max: 0</Text>
      </TouchableOpacity>
    </View>
  );
};
