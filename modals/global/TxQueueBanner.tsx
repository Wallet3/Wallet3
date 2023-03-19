import Animated, { FadeOutRight } from 'react-native-reanimated';
import { FadeInDownView, FadeInRightView, FadeInUpView } from '../../components/animations';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ERC4337Queue from '../../viewmodels/transferring/ERC4337Queue';
import { FadeInRight } from 'react-native-reanimated';
import MessageKeys from '../../common/MessageKeys';
import { ReactiveScreen } from '../../utils/device';
import SquircleViewContainer from '../../components/SquircleViewContainer';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../constants/styles';
import { startLayoutAnimation } from '../../utils/animations';

const { View, Text } = Animated;

interface Props {}

export default observer(({}: Props) => {
  const { t } = i18n;
  const { backgroundColor, tintColor } = Theme;
  const { count } = ERC4337Queue;
  const { width } = ReactiveScreen;

  useEffect(() => startLayoutAnimation(), [width]);

  return (
    <View
      entering={FadeInRight.springify()}
      exiting={FadeOutRight.springify()}
      style={{
        width: 128,
        height: 48,
        borderRadius: 50,
        alignSelf: 'center',
        position: 'absolute',
        right: -64,
        top: 81,
        shadowColor: tintColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => PubSub.publish(MessageKeys.openERC4337Queue)}
        style={{
          borderRadius: 50,
          height: 72,
          flex: 1,
          backgroundColor: backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
          paddingStart: 27,
          position: 'relative',
        }}
      >
        <Text numberOfLines={1} style={{ color: tintColor, ...styles.txt }}>
          {count}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  txt: {
    fontSize: 32,
    fontWeight: '800',
    opacity: 0.9,
  },
});
