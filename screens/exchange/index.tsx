import React, { useEffect, useState } from 'react';

import Theme from '../../viewmodels/settings/Theme';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { backgroundColor, shadow, mode, foregroundColor, secondaryTextColor } = Theme;

  return <View style={{ flex: 1, backgroundColor }}>
    
  </View>;
});
