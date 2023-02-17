import Button, { ButtonProps } from './Button';

import { useOptimizedCornerRadius } from '../utils/hardware';

export default (props: ButtonProps) => {
  const optimizedRadius = useOptimizedCornerRadius();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 16 + Math.min(optimizedRadius / 5, 2), fontWeight: '600' }}
      style={{
        borderRadius: 10 + optimizedRadius / 3,
        roundness: 0.17650602409638552,
        height: 42 + optimizedRadius / 4,
        ...(props.style as any),
      }}
    />
  );
};
