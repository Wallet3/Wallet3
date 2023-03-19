import Button, { ButtonProps } from './Button';

import { useOptimizedCornerRadius } from '../utils/hardware';
import { useState } from 'react';

export default (props: ButtonProps) => {
  const optimizedRadius = useOptimizedCornerRadius();
  const [height] = useState(Math.min(42 + optimizedRadius / 6.4, 46));

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 17, fontWeight: '600' }}
      style={{
        height,
        borderRadius: 10 + optimizedRadius / 8,
        ...(props.style as any),
      }}
    />
  );
};
