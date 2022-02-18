import * as Animatable from 'react-native-animatable';

import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import SwipeButton from 'rn-swipe-button';
import { themeColor } from '../constants/styles';

interface Props {
  style?: StyleProp<ViewStyle>;
  txtStyle?: StyleProp<TextStyle>;
  title?: string;
  icon?: () => JSX.Element;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onSwipeSuccess?: () => void;
  themeColor?: string;
  reverse?: boolean;
}

const breath = {
  0: { opacity: 1 },
  0.5: { opacity: 0.25 },
  1: { opacity: 1 },
};

export default (props: Props) => {
  const { disabled, reverse, themeColor, onLongPress, onPress, onSwipeSuccess, title } = props;

  const backgroundColor: any = disabled
    ? '#D3D3D3'
    : reverse
    ? 'transparent'
    : props.themeColor || (props?.style as ViewStyle)?.backgroundColor || styles.default.backgroundColor;

  const buttonStyle = {
    ...styles.default,
    ...((props?.style as any) || {}),
    backgroundColor,
    borderColor: reverse ? themeColor : 'transparent',
    borderWidth: reverse ? 1 : 0,
  };

  const txtStyle = { ...styles.text, ...((props?.txtStyle as any) || {}), color: reverse ? themeColor : '#fff' };

  const arrowIcon = () => <Ionicons name="arrow-forward" size={19} color={backgroundColor} style={{}} />;

  return onSwipeSuccess ? (
    <View style={{ ...((props?.style as any) || {}), backgroundColor, borderRadius: 7, height: 42 }}>
      <Animatable.View
        animation={disabled ? undefined : breath}
        duration={2200}
        iterationCount={'infinite'}
        easing="ease-in-out"
        style={{
          flexDirection: 'row',
          position: 'absolute',
          alignSelf: 'center',
          height: 42,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          paddingStart: 18,
        }}
      >
        {props.icon?.()}
        <Text style={{ ...txtStyle, maxWidth: '100%' }} numberOfLines={1}>
          {title}
        </Text>
      </Animatable.View>

      <SwipeButton
        disabled={disabled}
        disabledRailBackgroundColor="transparent"
        disabledThumbIconBackgroundColor="#fff"
        shouldResetAfterSuccess
        swipeSuccessThreshold={95}
        containerStyles={{
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          borderRadius: 7,
          borderWidth: 0,
          height: 42,
          paddingHorizontal: 8,
        }}
        thumbIconStyles={{ backgroundColor: 'transparent', borderRadius: 6, borderWidth: 0, height: 32 }}
        titleStyles={txtStyle}
        onSwipeSuccess={onSwipeSuccess}
        railBackgroundColor={'transparent'}
        railStyles={{
          maxWidth: '100%',
          borderWidth: 0,
          borderColor: 'black',
          backgroundColor,
          borderRadius: 5,
          margin: 0,
          padding: 0,
          marginEnd: 4,
        }}
        thumbIconComponent={arrowIcon as any}
        thumbIconBackgroundColor="#fff"
        thumbIconWidth={34}
        titleColor="white"
        height={32}
        title={''}
      />
    </View>
  ) : (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} disabled={disabled} style={buttonStyle}>
      {props.icon?.()}
      <Text style={txtStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  default: {
    borderRadius: 7,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    backgroundColor: themeColor,
  },

  text: {
    color: 'white',
    textTransform: 'capitalize',
    marginStart: 6,
    fontSize: 17,
    fontWeight: '500',
  },
});
