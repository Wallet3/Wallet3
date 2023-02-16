import Button, { ButtonProps } from '../../../components/Button';
import { DefaultCornerRadius, getScreenCornerRadius } from '../../../utils/hardware';
import React, { useState } from 'react';

import { ModalMarginScreen } from '../../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const [borderRadius] = useState(getScreenCornerRadius());
  const { bottom: safeBottom } = useSafeAreaInsets();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 18, fontWeight: '600' }}
      style={{
        borderRadius: 7 + (borderRadius - DefaultCornerRadius) / 3,
        height: 42 + (borderRadius - DefaultCornerRadius) / 4,
        marginHorizontal: (borderRadius - DefaultCornerRadius) / 4 + 16,
        marginBottom: Math.max(safeBottom - 16 - ModalMarginScreen, (borderRadius - DefaultCornerRadius) / 5),
      }}
    />
  );
};
