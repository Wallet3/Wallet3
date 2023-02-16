import Button, { ButtonProps } from './Button';
import { DefaultCornerRadius, useScreenCornerRadius } from '../utils/hardware';

import { ModalMarginScreen } from '../modals/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props: ButtonProps) => {
  const screenBorderRadius = useScreenCornerRadius();

  return (
    <Button
      {...props}
      txtStyle={{ fontSize: 18, fontWeight: '600' }}
      style={{
        borderRadius: 7 + (screenBorderRadius - DefaultCornerRadius) / 3,
        height: 42 + (screenBorderRadius - DefaultCornerRadius) / 4,
        ...(props.style as any),
      }}
    />
  );
};
