import { Modalize, ModalizeProps } from 'react-native-modalize';
import { StyleProp, ViewStyle } from 'react-native';

import ModalizeContainer from './ModalizeContainer';
import React from 'react';
import SquircleViewContainer from '../../components/SquircleViewContainer';

interface Props extends ModalizeProps {
  safeAreaStyle?: StyleProp<ViewStyle>;
  squircleContainerStyle?: StyleProp<ViewStyle>;
  cornerRadius?: number;
  useSafeBottom?: boolean;
}

export default React.forwardRef<Modalize, Props>((props: Props, ref) => {
  return (
    <ModalizeContainer ref={ref} {...props}>
      <SquircleViewContainer cornerRadius={22} style={props.squircleContainerStyle} useSafeBottom={props.useSafeBottom}>
        {props.children}
      </SquircleViewContainer>
    </ModalizeContainer>
  );
});
