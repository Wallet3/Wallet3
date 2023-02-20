import Animated, { FadeInRight, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, FadeInLeftView, FadeInUpView, ZoomInView } from '../../../components/animations';
import React, { useEffect, useState } from 'react';
import { ShardPersistentStatus, ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import { getDeviceModel, useOptimizedSafeBottom } from '../../../utils/hardware';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Placeholder } from '../../../components';
import { SECOND } from '../../../utils/time';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text, FlatList } = Animated;

export default () => {
  return (
    <FadeInDownView>
      <View style={{ flex: 1 }} />
      <Button />
    </FadeInDownView>
  );
};
