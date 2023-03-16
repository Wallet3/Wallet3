import { Modalize, ModalizeProps } from 'react-native-modalize';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../../viewmodels/settings/Theme';
import { isAndroid } from '../../utils/platform';

interface Props extends ModalizeProps {
  safeAreaStyle?: StyleProp<ViewStyle>;
}

export default React.forwardRef<Modalize, Props>((props: Props, ref) => {
  return (
    <Modalize
      ref={ref}
      useNativeDriver
      handlePosition="inside"
      handleStyle={{ marginTop: -3, backgroundColor: Theme.borderColor, width: 36, opacity: 0.75 }}
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
      modalStyle={{
        ...(props.modalStyle as any),
        backgroundColor: '#ffffff00',
        shadowColor: undefined,
        shadowOffset: undefined,
        shadowOpacity: 0,
        shadowRadius: 0,
      }}
    >
      <SafeAreaProvider style={[isAndroid ? { minHeight: 439 } : undefined, props.safeAreaStyle]}>
        {props.children}
      </SafeAreaProvider>
    </Modalize>
  );
});
