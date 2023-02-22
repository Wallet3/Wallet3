import { Modalize, ModalizeProps, useModalize } from 'react-native-modalize';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../../viewmodels/settings/Theme';

interface Props extends ModalizeProps {
  safeAreaStyle?: StyleProp<ViewStyle>;
}

export default React.forwardRef<Modalize, Props>((props: Props, ref) => {
  return (
    <Modalize
      ref={ref}
      useNativeDriver
      handlePosition="inside"
      handleStyle={{ marginTop: -3, backgroundColor: Theme.borderColor, width: 36 }}
      withHandle={true}
      adjustToContentHeight
      disableScrollIfPossible
      scrollViewProps={{
        scrollEnabled: false,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        bounces: false,
      }}
      {...props}
      modalStyle={{ ...(props.modalStyle as any), backgroundColor: 'transparent' }}
    >
      <SafeAreaProvider style={props.safeAreaStyle}>{props.children}</SafeAreaProvider>
    </Modalize>
  );
});
