import { EvilIcons, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Animated from 'react-native-reanimated';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/ios';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
  const { backgroundColor, foregroundColor } = Theme;
  const [borderRadius] = useState(getScreenCornerRadius());

  return (
    <View
      style={{
        position: 'relative',
        margin: 8,
        backgroundColor,
        height: 400,
        borderRadius,
        overflow: 'hidden',
        padding: Math.max(16, borderRadius / 2),
      }}
    >
      <Animated.Text>1.</Animated.Text>
    </View>
  );
});
