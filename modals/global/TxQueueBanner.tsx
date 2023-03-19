import Animated, { FadeOutRight } from 'react-native-reanimated';
import { FadeInDownView, FadeInLeftView, FadeInRightView } from '../../components/animations';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ERC4337Queue from '../../viewmodels/transferring/ERC4337Queue';
import { EvilIcons } from '@expo/vector-icons';
import { FadeInRight } from 'react-native-reanimated';
import MessageKeys from '../../common/MessageKeys';
import { ReactiveScreen } from '../../utils/device';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';

const { View, Text } = Animated;

interface Props {}

export default observer(() => {
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
        height: 48,
        alignSelf: 'center',
        position: 'absolute',
        right: -5,
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
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          paddingHorizontal: 16,
          height: 72,
          flex: 1,
          backgroundColor: backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
          gap: 8,
        }}
      >
        <FadeInLeftView delay={300}>
          <EvilIcons name="sc-telegram" color={tintColor} size={27} style={{ marginTop: -2 }} />
        </FadeInLeftView>
        <FadeInRightView delay={150}>
          <Text numberOfLines={1} style={{ color: tintColor, ...styles.txt }}>
            {count}
          </Text>
        </FadeInRightView>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  txt: {
    fontSize: 22,
    fontWeight: '800',
    opacity: 0.9,
  },
});
