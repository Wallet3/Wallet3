import Button, { ButtonProps } from './Button';

import { useOptimizedCornerRadius } from '../utils/hardware';

export default (props: ButtonProps) => {
  const optimizedRadius = useOptimizedCornerRadius();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 16 + Math.min(optimizedRadius / 5, 2), fontWeight: '500' }}
      style={{
        borderRadius: 10 + optimizedRadius / 4,
        roundness: 0.17650602409638552,
        height: 42 + optimizedRadius / 6,
        ...(props.style as any),
      }}
    />
  );
};
