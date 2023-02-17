import Button, { ButtonProps } from '../../../components/Button';
import {
  DefaultCornerRadius,
  getScreenCornerRadius,
  useOptimizedCornerRadius,
  useScreenCornerRadius,
} from '../../../utils/hardware';
import React, { useState } from 'react';

import { ButtonV2 } from '../../../components';
import { ModalMarginScreen } from '../../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const optimizedRadius = useOptimizedCornerRadius();
  const { bottom: safeBottom } = useSafeAreaInsets();

  return (
    <ButtonV2
      {...props}
      style={{
        marginHorizontal: optimizedRadius / 4 + 16,
        marginBottom: Math.max(safeBottom - 16 - ModalMarginScreen, optimizedRadius / 5),
      }}
    />
  );
};
