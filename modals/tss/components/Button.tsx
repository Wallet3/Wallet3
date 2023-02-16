import Button, { ButtonProps } from '../../../components/Button';
import { DefaultCornerRadius, getScreenCornerRadius, useScreenCornerRadius } from '../../../utils/hardware';
import React, { useState } from 'react';

import { ModalMarginScreen } from '../../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const screenBorderRadius = useScreenCornerRadius();
  const { bottom: safeBottom } = useSafeAreaInsets();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 18, fontWeight: '600' }}
      style={{
        borderRadius: 7 + (screenBorderRadius - DefaultCornerRadius) / 3,
        height: 42 + (screenBorderRadius - DefaultCornerRadius) / 4,
        marginHorizontal: (screenBorderRadius - DefaultCornerRadius) / 4 + 16,
        marginBottom: Math.max(safeBottom - 16 - ModalMarginScreen, (screenBorderRadius - DefaultCornerRadius) / 5),
      }}
    />
  );
};
