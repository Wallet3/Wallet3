import React, { useEffect } from 'react';
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import ScrollTitles from './ScrollTitles';
import Theme from '../../viewmodels/settings/Theme';
import { startLayoutAnimation } from '../../utils/animations';
import { useHorizontalPadding } from '../tss/components/Utils';
import { useOptimizedCornerRadius } from '../../utils/hardware';

interface Props {
  backDisabled?: boolean;
  showBack?: boolean;
  showClose?: boolean;
  iconColor?: string;
  titles: string[];
  currentIndex?: number;
  onBackPress?: () => void;
  onClosePress?: () => void;
  style?: StyleProp<ViewStyle>;
  txtStyle?: StyleProp<TextStyle>;
}

export default (props: Props) => {
  const { iconColor, showBack, titles, currentIndex, onBackPress, backDisabled, style, onClosePress } = props;
  const backButtonPadding = useHorizontalPadding();
  const screenRadius = useOptimizedCornerRadius();
  const { secondaryTextColor } = Theme;

  useEffect(() => startLayoutAnimation(), [showBack]);

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', paddingTop: screenRadius && showBack ? 4 : 0, ...(style as any) }}
    >
      <TouchableOpacity
        disabled={backDisabled || currentIndex === 0 || !showBack}
        onPress={onBackPress}
        style={{
          padding: backButtonPadding,
          margin: -backButtonPadding,
          opacity: backDisabled ? 0 : 1,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={iconColor}
          style={{ opacity: showBack ? 1 : 0, marginStart: backButtonPadding - 16 ? 4 : -2, marginTop: 1.5 }}
        />
      </TouchableOpacity>

      <ScrollTitles
        txtStyle={props.txtStyle}
        currentIndex={currentIndex}
        data={titles}
        contentContainerStyle={{ marginStart: -backButtonPadding - 1 }}
      />

      {props.showClose && (
        <TouchableOpacity
          onPress={onClosePress}
          style={{
            padding: 5,
            right: 4,
            top: 2,
            borderRadius: 50,
            position: 'absolute',
          }}
        >
          <Ionicons name={'close'} color={secondaryTextColor} size={19} style={{ marginBottom: 0 }} />
        </TouchableOpacity>
      )}
    </View>
  );
};
