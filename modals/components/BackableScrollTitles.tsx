import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { secondaryFontColor, warningColor } from '../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import ScrollTitles from './ScrollTitles';
import Theme from '../../viewmodels/settings/Theme';
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
}

export default (props: Props) => {
  const { iconColor, showBack, titles, currentIndex, onBackPress, backDisabled, style, onClosePress } = props;
  const backButtonPadding = useHorizontalPadding();
  const screenRadius = useOptimizedCornerRadius();
  const { textColor, secondaryTextColor } = Theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: screenRadius ? 4 : 0, ...(style as any) }}>
      <TouchableOpacity
        disabled={backDisabled || currentIndex === 0}
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
          style={{ opacity: showBack ? 1 : 0, marginStart: backButtonPadding - 16 ? 4 : -2, marginTop: 2 }}
        />
      </TouchableOpacity>

      <ScrollTitles
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
            top: screenRadius ? 3 : 2,
            borderRadius: 50,
            position: 'absolute',
            // borderWidth: 1,
            // borderColor: textColor,
            // backgroundColor: `${secondaryFontColor}60`,
          }}
        >
          <Ionicons name={'close'} color={secondaryTextColor} size={20} style={{ marginBottom: 0 }} />
        </TouchableOpacity>
      )}
    </View>
  );
};
