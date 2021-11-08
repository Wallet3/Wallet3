import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { SortWords } from '../components/SecretWords';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
  const [verified, setVerified] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer>
        {verified ? (
          <View></View>
        ) : (
          <View>
            <Text>Please sort the words correctly. </Text>
            <SortWords words={MnemonicOnce.secretWords} onVerified={(v) => setVerified(v)} />
          </View>
        )}
      </SafeViewContainer>
    </SafeAreaView>
  );
});
