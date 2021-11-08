import { Mnemonic, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import App from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import { FullPasspad } from '../../modals/views/Passpad';
import { Modalize } from 'react-native-modalize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { Portal } from 'react-native-portalize';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const { ref: authModalRef, open, close } = useModalize();
  const [retried, setRetried] = useState(0);
  const [authorized, setAuthorized] = useState(false);

  const verify = async (passcode?: string) => {
    console.log('verify', passcode);
    const secret = await App.currentWallet?.getSecret(passcode);
    const success = secret ? true : false;

    setAuthorized(success);

    try {
      if (success) {
        close();
      } else {
        setRetried((p) => p + 1);
      }

      return success;
    } finally {
      if (retried > 3) navigation.pop();
    }
  };

  useEffect(() => {
    setTimeout(() => open(), 0);
    if (Authentication.biometricsEnabled) verify();
  }, []);

  return (
    <SafeAreaView>
      <SafeViewContainer>
        {authorized ? (
          <View>
            <Mnemonic phrases={['']} />
          </View>
        ) : (
          <View></View>
        )}
      </SafeViewContainer>

      <Portal>
        <Modalize
          ref={authModalRef}
          disableScrollIfPossible
          adjustToContentHeight
          closeOnOverlayTap={false}
          panGestureEnabled={false}
          panGestureComponentEnabled={false}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <FullPasspad themeColor={Networks.current.color} height={420} onCodeEntered={(code) => verify(code)} />
        </Modalize>
      </Portal>
    </SafeAreaView>
  );
});
