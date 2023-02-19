import Button, { ButtonProps } from './Button';

import { useOptimizedCornerRadius } from '../utils/hardware';

export default (props: ButtonProps) => {
  const optimizedRadius = useOptimizedCornerRadius();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 17, fontWeight: '600' }}
      style={{
        borderRadius: 10 + optimizedRadius / 4,
        height: 42 + optimizedRadius / 6.4,
        ...(props.style as any),
      }}
    />
  );
};
