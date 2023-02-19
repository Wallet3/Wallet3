import * as Animatable from 'react-native-animatable';

import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { BreathAnimation } from '../utils/animations';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import SwipeButton from 'rn-swipe-button';
import { observable } from 'mobx';
import { themeColor } from '../constants/styles';

export interface ButtonProps {
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
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export default (props: ButtonProps) => {
  const { disabled, reverse, themeColor, onLongPress, onPress, onSwipeSuccess, title, onInteractionStart, onInteractionEnd } =
    props;

  const backgroundColor: any = disabled
    ? '#A2A2A250'
    : reverse
    ? 'transparent'
    : props.themeColor || (props?.style as ViewStyle)?.backgroundColor || styles.default.backgroundColor;

  const buttonStyle = {
    ...styles.default,
    ...((props?.style as any) || {}),
    backgroundColor: reverse && disabled ? 'transparent' : backgroundColor,
    borderColor: reverse ? (disabled ? 'lightgrey' : themeColor) : 'transparent',
    borderWidth: reverse ? 1 : 0,
  };

  const txtStyle = {
    ...styles.text,
    color: reverse ? (disabled ? 'lightgrey' : themeColor) : '#fff',
    ...((props?.txtStyle as any) || {}),
    marginStart: props.icon ? 8 : 0,
  };

  const arrowIcon = () => <Ionicons name="arrow-forward" size={19} color={backgroundColor} style={{}} />;

  return onSwipeSuccess ? (
    <View
      style={{ ...((props?.style as any) || {}), backgroundColor, borderRadius: 7, height: 42 }}
      onTouchStart={onInteractionStart}
      onTouchEnd={onInteractionEnd}
      onPointerEnter={onInteractionStart}
      onPointerLeave={onInteractionEnd}
    >
      <Animatable.View
        animation={disabled ? undefined : BreathAnimation}
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
          paddingEnd: 4,
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
        railFillBackgroundColor="transparent"
        disabledThumbIconBackgroundColor="#fff"
        shouldResetAfterSuccess={!disabled}
        resetAfterSuccessAnimDuration={5000}
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
        railBackgroundColor="transparent"
        railStyles={{
          maxWidth: '100%',
          borderWidth: 0,
          borderColor: 'black',
          backgroundColor: disabled ? 'transparent' : backgroundColor,
          backfaceVisibility: 'hidden',
          borderRadius: 5,
          margin: 0,
          padding: 0,
          marginEnd: 4,
        }}
        thumbIconComponent={arrowIcon as any}
        thumbIconBackgroundColor="#fff"
        thumbIconWidth={34}
        titleColor="#fff"
        height={32}
        title={''}
      />
    </View>
  ) : (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress} onLongPress={onLongPress} disabled={disabled} style={buttonStyle}>
      {/* <SquircleView
        style={{ ...buttonStyle, borderRadius: 0, backgroundColor: undefined, borderWidth: 0 }}
        squircleParams={{
          cornerSmoothing: 0.9,
          cornerRadius: buttonStyle.borderRadius,
          fillColor: buttonStyle.backgroundColor,
          strokeColor: buttonStyle.borderColor,
          strokeWidth: buttonStyle.borderWidth,
        }}
      > */}
        {props.icon?.()}
        <Text style={txtStyle}>{title}</Text>
      {/* </SquircleView> */}
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
    fontSize: 17,
    fontWeight: '500',
  },
});
