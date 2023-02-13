import Button, { ButtonProps } from '../../../components/Button';
import { DefaultCornerRadius, getScreenCornerRadius } from '../../../utils/ios';
import React, { useState } from 'react';

export default (props: ButtonProps) => {
  const [borderRadius] = useState(getScreenCornerRadius());

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 18, fontWeight: '600' }}
      style={{
        borderRadius: 7 + (borderRadius - DefaultCornerRadius) / 2.4,
        height: 42 + (borderRadius - DefaultCornerRadius) / 5,
        marginHorizontal: (borderRadius - DefaultCornerRadius) / 4 + 16,
        marginBottom: (borderRadius - DefaultCornerRadius) / 5,
      }}
    />
  );
};
