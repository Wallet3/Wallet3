import Button, { ButtonProps } from '../../../components/Button';
import { DefaultCornerRadius, getScreenCornerRadius, useScreenCornerRadius } from '../../../utils/hardware';
import React, { useState } from 'react';

import { ButtonV2 } from '../../../components';
import { ModalMarginScreen } from '../../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const screenBorderRadius = useScreenCornerRadius();
  const { bottom: safeBottom } = useSafeAreaInsets();

  return (
    <ButtonV2
      {...props}
      style={{
        marginHorizontal: (screenBorderRadius - DefaultCornerRadius) / 4 + 16,
        marginBottom: Math.max(safeBottom - 16 - ModalMarginScreen, (screenBorderRadius - DefaultCornerRadius) / 5),
      }}
    />
  );
};
