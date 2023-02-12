import Button, { ButtonProps } from '../../../components/Button';
import React, { useState } from 'react';

import { getScreenCornerRadius } from '../../../utils/ios';

export default (props: ButtonProps) => {
  const [borderRadius] = useState(getScreenCornerRadius());

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 18, fontWeight: '600' }}
      style={{
        borderRadius: 7 + (borderRadius - 20) / 3,
        height: 42 + (borderRadius - 20) / 5,
        marginHorizontal: (borderRadius - 20) / 4 + 16,
        marginBottom: (borderRadius - 20) / 5,
      }}
    />
  );
};
