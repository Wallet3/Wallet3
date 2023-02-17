import { Modalize, ModalizeProps, useModalize } from 'react-native-modalize';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default React.forwardRef<Modalize, ModalizeProps>((props: ModalizeProps, ref) => {
  return (
    <Modalize
      ref={ref}
      useNativeDriver
      withHandle={false}
      adjustToContentHeight
      disableScrollIfPossible
      scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      modalStyle={{ backgroundColor: 'transparent' }}
      {...props}
    >
      <SafeAreaProvider>{props.children}</SafeAreaProvider>
    </Modalize>
  );
});
