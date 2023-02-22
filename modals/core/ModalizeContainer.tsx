import { Modalize, ModalizeProps, useModalize } from 'react-native-modalize';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface Props extends ModalizeProps {
  safeAreaStyle?: StyleProp<ViewStyle>;
}

export default React.forwardRef<Modalize, Props>((props: Props, ref) => {
  return (
    <Modalize
      ref={ref}
      useNativeDriver
      withHandle={false}
      adjustToContentHeight
      disableScrollIfPossible
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      {...props}
      modalStyle={{ ...(props.modalStyle as any), backgroundColor: 'transparent' }}
    >
      <SafeAreaProvider style={props.safeAreaStyle}>{props.children}</SafeAreaProvider>
    </Modalize>
  );
});
