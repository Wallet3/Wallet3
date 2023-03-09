import Button, { ButtonProps } from '../../../components/Button';
import {
  DefaultCornerRadius,
  getScreenCornerRadius,
  useOptimizedCornerRadius,
  useOptimizedSafeBottom,
  useScreenCornerRadius,
} from '../../../utils/hardware';
import React, { useState } from 'react';

import { ButtonV2 } from '../../../components';
import { ModalMarginScreen } from '../../styles';
import { useHorizontalPadding } from './Utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const marginHorizontal = useHorizontalPadding();
  const safeBottom = useOptimizedSafeBottom();

  return (
    <ButtonV2
      {...props}
      style={{
        marginHorizontal,
        marginBottom: safeBottom,
        ...(props.style as any),
      }}
    />
  );
};
